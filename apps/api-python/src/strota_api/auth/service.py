"""Pure auth-flow logic.

Routes (next file) translate HTTP into these calls; tests drive these
directly without TestClient.

Pool connections are autocommit=True, so each statement commits independently.
signup wraps its own `async with conn.transaction()` block for atomicity
across the three rows it creates. login/refresh/etc rely on autocommit so
side-effect rows (failed-login counter, refresh-token family-kill) commit
before the function raises - otherwise security signals get rolled back.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import psycopg

from ..config import get_settings
from ..db import dict_cursor
from ..logging import get_logger
from .passwords import hash_password, needs_rehash, verify_password
from .tokens import (
    generate_token,
    hash_token,
    issue_access_token,
    issue_refresh_token,
)

_log = get_logger("auth.service")


class AuthError(Exception):
    """Raised when an auth flow fails for a known reason."""

    def __init__(self, code: str, http_status: int = 400, message: str | None = None) -> None:
        super().__init__(code)
        self.code = code
        self.http_status = http_status
        self.message = message or code


@dataclass(frozen=True)
class AuthSession:
    user_id: uuid.UUID
    org_id: uuid.UUID | None
    role: str
    email: str
    email_verified: bool
    access_token: str
    refresh_token_plaintext: str
    access_token_expires_at: datetime
    refresh_token_expires_at: datetime


# ---------------------------------------------------------------------
# Signup
# ---------------------------------------------------------------------
async def signup(
    conn: psycopg.AsyncConnection,
    *,
    email: str,
    password: str,
    full_name: str | None = None,
) -> tuple[uuid.UUID, str]:
    """Create auth.users + public.users + verification token atomically.

    Wraps in an explicit transaction because pool connections are autocommit=True
    by default. signup is the only place we need atomicity.
    """
    s = get_settings()
    email_norm = email.strip().lower()
    if len(password) < s.password_min_length:
        raise AuthError("password_too_short", 400)

    async with conn.transaction():
        async with dict_cursor(conn) as cur:
            await cur.execute(
                "SELECT id FROM auth.users WHERE email_normalized = %s AND deleted_at IS NULL",
                (email_norm,),
            )
            if await cur.fetchone():
                raise AuthError("email_already_registered", 409)

            user_id = uuid.uuid4()
            password_hash = hash_password(password)
            await cur.execute(
                "INSERT INTO auth.users (id, email, password_hash) VALUES (%s, %s, %s)",
                (user_id, email_norm, password_hash),
            )
            await cur.execute(
                """
                INSERT INTO users (id, email, full_name, role, bauvorlageberechtigung)
                VALUES (%s, %s, %s, 'owner', 'keine')
                """,
                (user_id, email_norm, full_name),
            )

            plaintext = generate_token()
            await cur.execute(
                """
                INSERT INTO auth.email_verification_tokens (user_id, token_hash, expires_at)
                VALUES (%s, %s, %s)
                """,
                (
                    user_id,
                    hash_token(plaintext),
                    datetime.now(tz=UTC) + timedelta(hours=s.email_verification_ttl_hours),
                ),
            )

    _log.info("auth.signup", user_id=str(user_id))
    return user_id, plaintext


# ---------------------------------------------------------------------
# Email verification
# ---------------------------------------------------------------------
async def verify_email(conn: psycopg.AsyncConnection, *, token_plaintext: str) -> uuid.UUID:
    th = hash_token(token_plaintext)
    async with dict_cursor(conn) as cur:
        await cur.execute(
            """
            SELECT id, user_id, expires_at, consumed_at
            FROM auth.email_verification_tokens
            WHERE token_hash = %s
            """,
            (th,),
        )
        row = await cur.fetchone()
        if row is None:
            raise AuthError("invalid_token", 400)
        if row["consumed_at"] is not None:
            raise AuthError("token_already_used", 400)
        if row["expires_at"] < datetime.now(tz=UTC):
            raise AuthError("token_expired", 400)
        await cur.execute(
            "UPDATE auth.email_verification_tokens SET consumed_at = now() WHERE id = %s",
            (row["id"],),
        )
        await cur.execute(
            "UPDATE auth.users SET email_verified_at = now() WHERE id = %s",
            (row["user_id"],),
        )
    user_id: uuid.UUID = row["user_id"]
    _log.info("auth.email_verified", user_id=str(user_id))
    return user_id


# ---------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------
async def login(
    conn: psycopg.AsyncConnection,
    *,
    email: str,
    password: str,
    user_agent: str | None = None,
    ip_hash: str | None = None,
) -> AuthSession:
    s = get_settings()
    email_norm = email.strip().lower()
    async with dict_cursor(conn) as cur:
        await cur.execute(
            """
            SELECT a.id, a.password_hash, a.email_verified_at,
                   a.failed_login_attempts, a.locked_until,
                   u.org_id, u.role
            FROM auth.users a
            LEFT JOIN users u ON u.id = a.id
            WHERE a.email_normalized = %s AND a.deleted_at IS NULL
            """,
            (email_norm,),
        )
        row = await cur.fetchone()
        if row is None:
            # Equalize timing with the wrong-password path so we don't leak
            # account existence: spend the argon2 verify cost on a throwaway.
            verify_password(
                "$argon2id$v=19$m=19456,t=2,p=1$AAAAAAAAAAAAAAAAAAAAAA$"
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                password,
            )
            raise AuthError("invalid_credentials", 401)

        now = datetime.now(tz=UTC)
        if row["locked_until"] and row["locked_until"] > now:
            raise AuthError("account_locked", 423)

        if not verify_password(row["password_hash"], password):
            await cur.execute(
                """
                UPDATE auth.users
                SET failed_login_attempts = failed_login_attempts + 1,
                    locked_until = CASE
                      WHEN failed_login_attempts + 1 >= %s
                      THEN now() + (%s || ' minutes')::interval
                      ELSE locked_until
                    END
                WHERE id = %s
                """,
                (s.max_failed_logins_per_hour, str(s.account_lock_minutes), row["id"]),
            )
            raise AuthError("invalid_credentials", 401)

        new_hash = row["password_hash"]
        if needs_rehash(new_hash):
            new_hash = hash_password(password)
        await cur.execute(
            """
            UPDATE auth.users
            SET failed_login_attempts = 0,
                locked_until = NULL,
                last_login_at = now(),
                password_hash = %s
            WHERE id = %s
            """,
            (new_hash, row["id"]),
        )

        access = issue_access_token(
            user_id=row["id"],
            org_id=row["org_id"],
            role=row["role"] or "owner",
        )
        rt = issue_refresh_token()
        await cur.execute(
            """
            INSERT INTO auth.refresh_tokens
              (user_id, token_hash, family_id, expires_at, user_agent, ip_hash)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (row["id"], rt.token_hash, rt.family_id, rt.expires_at, user_agent, ip_hash),
        )

        await cur.execute(
            "SELECT email_normalized AS email FROM auth.users WHERE id = %s",
            (row["id"],),
        )
        email_row = await cur.fetchone()
        if email_row is None:
            raise AuthError("user_gone", 401)

    return AuthSession(
        user_id=row["id"],
        org_id=row["org_id"],
        role=row["role"] or "owner",
        email=email_row["email"],
        email_verified=row["email_verified_at"] is not None,
        access_token=access,
        refresh_token_plaintext=rt.plaintext,
        access_token_expires_at=now + timedelta(seconds=s.jwt_access_ttl_seconds),
        refresh_token_expires_at=rt.expires_at,
    )


# ---------------------------------------------------------------------
# Refresh
# ---------------------------------------------------------------------
async def refresh(
    conn: psycopg.AsyncConnection,
    *,
    refresh_token_plaintext: str,
    user_agent: str | None = None,
    ip_hash: str | None = None,
) -> AuthSession:
    s = get_settings()
    th = hash_token(refresh_token_plaintext)
    async with dict_cursor(conn) as cur:
        await cur.execute(
            """
            SELECT id, user_id, family_id, expires_at, revoked_at
            FROM auth.refresh_tokens
            WHERE token_hash = %s
            """,
            (th,),
        )
        row = await cur.fetchone()
        if row is None:
            raise AuthError("invalid_token", 401)
        if row["revoked_at"] is not None:
            # Reuse detection: kill the entire family.
            await cur.execute(
                """
                UPDATE auth.refresh_tokens
                SET revoked_at = now(), revoked_reason = 'family_reuse_detected'
                WHERE family_id = %s AND revoked_at IS NULL
                """,
                (row["family_id"],),
            )
            raise AuthError("token_reused", 401)
        if row["expires_at"] < datetime.now(tz=UTC):
            raise AuthError("token_expired", 401)

        # Revoke the old token, issue a new one in the same family.
        await cur.execute(
            "UPDATE auth.refresh_tokens SET revoked_at = now(), revoked_reason = 'rotated' WHERE id = %s",
            (row["id"],),
        )
        new_rt = issue_refresh_token(family_id=row["family_id"])
        await cur.execute(
            """
            INSERT INTO auth.refresh_tokens
              (user_id, token_hash, family_id, parent_id, expires_at, user_agent, ip_hash)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                row["user_id"],
                new_rt.token_hash,
                new_rt.family_id,
                row["id"],
                new_rt.expires_at,
                user_agent,
                ip_hash,
            ),
        )

        await cur.execute(
            """
            SELECT a.id, a.email_normalized AS email, a.email_verified_at,
                   u.org_id, u.role
            FROM auth.users a
            LEFT JOIN users u ON u.id = a.id
            WHERE a.id = %s
            """,
            (row["user_id"],),
        )
        u = await cur.fetchone()
        if u is None:
            raise AuthError("user_gone", 401)

        access = issue_access_token(
            user_id=u["id"],
            org_id=u["org_id"],
            role=u["role"] or "owner",
        )

    now = datetime.now(tz=UTC)
    return AuthSession(
        user_id=u["id"],
        org_id=u["org_id"],
        role=u["role"] or "owner",
        email=u["email"],
        email_verified=u["email_verified_at"] is not None,
        access_token=access,
        refresh_token_plaintext=new_rt.plaintext,
        access_token_expires_at=now + timedelta(seconds=s.jwt_access_ttl_seconds),
        refresh_token_expires_at=new_rt.expires_at,
    )


# ---------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------
async def logout(conn: psycopg.AsyncConnection, *, refresh_token_plaintext: str) -> None:
    th = hash_token(refresh_token_plaintext)
    async with dict_cursor(conn) as cur:
        await cur.execute(
            """
            UPDATE auth.refresh_tokens
            SET revoked_at = now(), revoked_reason = 'logout'
            WHERE family_id IN (
              SELECT family_id FROM auth.refresh_tokens WHERE token_hash = %s
            )
            AND revoked_at IS NULL
            """,
            (th,),
        )


# ---------------------------------------------------------------------
# Password reset
# ---------------------------------------------------------------------
async def request_password_reset(
    conn: psycopg.AsyncConnection,
    *,
    email: str,
    ip_hash: str | None = None,
) -> tuple[uuid.UUID, str] | None:
    """Returns (user_id, token_plaintext) if a user exists; None otherwise.
    The route always returns the same 200 to avoid account enumeration."""
    s = get_settings()
    email_norm = email.strip().lower()
    async with dict_cursor(conn) as cur:
        await cur.execute(
            "SELECT id FROM auth.users WHERE email_normalized = %s AND deleted_at IS NULL",
            (email_norm,),
        )
        row = await cur.fetchone()
        if row is None:
            return None
        plaintext = generate_token()
        await cur.execute(
            """
            INSERT INTO auth.password_reset_tokens
              (user_id, token_hash, expires_at, requested_ip_hash)
            VALUES (%s, %s, %s, %s)
            """,
            (
                row["id"],
                hash_token(plaintext),
                datetime.now(tz=UTC) + timedelta(hours=s.password_reset_ttl_hours),
                ip_hash,
            ),
        )
        return row["id"], plaintext


async def confirm_password_reset(
    conn: psycopg.AsyncConnection,
    *,
    token_plaintext: str,
    new_password: str,
) -> uuid.UUID:
    s = get_settings()
    if len(new_password) < s.password_min_length:
        raise AuthError("password_too_short", 400)
    th = hash_token(token_plaintext)
    async with dict_cursor(conn) as cur:
        await cur.execute(
            "SELECT id, user_id, expires_at, consumed_at FROM auth.password_reset_tokens WHERE token_hash = %s",
            (th,),
        )
        row = await cur.fetchone()
        if row is None:
            raise AuthError("invalid_token", 400)
        if row["consumed_at"] is not None:
            raise AuthError("token_already_used", 400)
        if row["expires_at"] < datetime.now(tz=UTC):
            raise AuthError("token_expired", 400)
        new_hash = hash_password(new_password)
        await cur.execute(
            """
            UPDATE auth.users
            SET password_hash = %s, failed_login_attempts = 0, locked_until = NULL
            WHERE id = %s
            """,
            (new_hash, row["user_id"]),
        )
        await cur.execute(
            "UPDATE auth.password_reset_tokens SET consumed_at = now() WHERE id = %s",
            (row["id"],),
        )
        # Revoke all active refresh tokens; user must log in again everywhere.
        await cur.execute(
            """
            UPDATE auth.refresh_tokens
            SET revoked_at = now(), revoked_reason = 'password_reset'
            WHERE user_id = %s AND revoked_at IS NULL
            """,
            (row["user_id"],),
        )
    user_id: uuid.UUID = row["user_id"]
    return user_id


# ---------------------------------------------------------------------
# Magic link
# ---------------------------------------------------------------------
async def request_magic_link(
    conn: psycopg.AsyncConnection,
    *,
    email: str,
    ip_hash: str | None = None,
) -> tuple[uuid.UUID, str] | None:
    s = get_settings()
    email_norm = email.strip().lower()
    async with dict_cursor(conn) as cur:
        await cur.execute(
            "SELECT id FROM auth.users WHERE email_normalized = %s AND deleted_at IS NULL",
            (email_norm,),
        )
        row = await cur.fetchone()
        if row is None:
            return None
        # Invalidate any active magic-link tokens for this user.
        await cur.execute(
            """
            UPDATE auth.magic_link_tokens
            SET consumed_at = now()
            WHERE user_id = %s AND consumed_at IS NULL
            """,
            (row["id"],),
        )
        plaintext = generate_token()
        await cur.execute(
            """
            INSERT INTO auth.magic_link_tokens
              (user_id, token_hash, expires_at, requested_ip_hash)
            VALUES (%s, %s, %s, %s)
            """,
            (
                row["id"],
                hash_token(plaintext),
                datetime.now(tz=UTC) + timedelta(minutes=s.magic_link_ttl_minutes),
                ip_hash,
            ),
        )
        return row["id"], plaintext


async def consume_magic_link(
    conn: psycopg.AsyncConnection,
    *,
    token_plaintext: str,
    user_agent: str | None = None,
    ip_hash: str | None = None,
) -> AuthSession:
    s = get_settings()
    th = hash_token(token_plaintext)
    async with dict_cursor(conn) as cur:
        await cur.execute(
            "SELECT id, user_id, expires_at, consumed_at FROM auth.magic_link_tokens WHERE token_hash = %s",
            (th,),
        )
        row = await cur.fetchone()
        if row is None:
            raise AuthError("invalid_token", 400)
        if row["consumed_at"] is not None:
            raise AuthError("token_already_used", 400)
        if row["expires_at"] < datetime.now(tz=UTC):
            raise AuthError("token_expired", 400)
        await cur.execute(
            "UPDATE auth.magic_link_tokens SET consumed_at = now() WHERE id = %s",
            (row["id"],),
        )
        await cur.execute(
            """
            SELECT a.id, a.email_normalized AS email, a.email_verified_at,
                   u.org_id, u.role
            FROM auth.users a
            LEFT JOIN users u ON u.id = a.id
            WHERE a.id = %s
            """,
            (row["user_id"],),
        )
        u = await cur.fetchone()
        if u is None:
            raise AuthError("user_gone", 401)

        await cur.execute(
            "UPDATE auth.users SET last_login_at = now() WHERE id = %s",
            (u["id"],),
        )

        access = issue_access_token(
            user_id=u["id"],
            org_id=u["org_id"],
            role=u["role"] or "owner",
        )
        rt = issue_refresh_token()
        await cur.execute(
            """
            INSERT INTO auth.refresh_tokens
              (user_id, token_hash, family_id, expires_at, user_agent, ip_hash)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (u["id"], rt.token_hash, rt.family_id, rt.expires_at, user_agent, ip_hash),
        )

    now = datetime.now(tz=UTC)
    return AuthSession(
        user_id=u["id"],
        org_id=u["org_id"],
        role=u["role"] or "owner",
        email=u["email"],
        email_verified=u["email_verified_at"] is not None,
        access_token=access,
        refresh_token_plaintext=rt.plaintext,
        access_token_expires_at=now + timedelta(seconds=s.jwt_access_ttl_seconds),
        refresh_token_expires_at=rt.expires_at,
    )


# ---------------------------------------------------------------------
# Current user (called from /api/auth/me with a verified access token)
# ---------------------------------------------------------------------
async def get_current_user(
    conn: psycopg.AsyncConnection, *, user_id: uuid.UUID
) -> dict[str, object]:
    async with dict_cursor(conn) as cur:
        await cur.execute(
            """
            SELECT u.id, u.email, u.full_name, u.role, u.org_id,
                   u.bauvorlageberechtigung, u.theme, u.locale,
                   a.email_verified_at IS NOT NULL AS email_verified
            FROM users u
            JOIN auth.users a ON a.id = u.id
            WHERE u.id = %s AND u.deleted_at IS NULL
            """,
            (user_id,),
        )
        row = await cur.fetchone()
        if row is None:
            raise AuthError("user_not_found", 404)
        return dict(row)
