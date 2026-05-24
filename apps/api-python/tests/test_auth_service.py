"""End-to-end auth service tests against a real Postgres.

Requires the CI Postgres service (or local docker-compose.db.yml) on 55432.
Migrations 001-005 must be applied before this test module runs; the CI db
job applies them, and the local pytest run can rely on docker-compose having
been brought up via docker-compose.db.yml.
"""

from __future__ import annotations

import os
import uuid
from contextlib import asynccontextmanager

import pytest
import pytest_asyncio

os.environ["HMAC_SECRET"] = "x" * 32
os.environ.setdefault("ENVIRONMENT", "testing")
os.environ.setdefault("JWT_SIGNING_KEY", "ci_jwt_signing_key_ci_jwt_signing_key_xxx")
os.environ.setdefault("DATABASE_URL", "postgres://postgres:strota_dev@127.0.0.1:55432/strota")

import psycopg  # noqa: E402

from strota_api.auth.service import (  # noqa: E402
    AuthError,
    confirm_password_reset,
    consume_magic_link,
    login,
    logout,
    refresh,
    request_magic_link,
    request_password_reset,
    signup,
    verify_email,
)
from strota_api.config import get_settings  # noqa: E402

pytestmark = pytest.mark.asyncio


@asynccontextmanager
async def _conn():
    """Open an autocommit connection so service side-effects commit even when
    the service raises afterwards. Mirrors the production pool's autocommit=True."""
    s = get_settings()
    aconn = await psycopg.AsyncConnection.connect(
        s.database_url,
        autocommit=True,
        row_factory=psycopg.rows.dict_row,
    )
    try:
        yield aconn
    finally:
        await aconn.close()


@pytest_asyncio.fixture
async def fresh_email() -> str:
    return f"ci-{uuid.uuid4()}@example.com"


async def test_signup_creates_user_and_verification_token(fresh_email: str) -> None:
    async with _conn() as c:
        user_id, token = await signup(
            c, email=fresh_email, password="GoodPassword12345", full_name="CI Tester"
        )
        assert isinstance(user_id, uuid.UUID)
        assert len(token) >= 30

        async with c.cursor() as cur:
            await cur.execute(
                "SELECT email_normalized, email_verified_at FROM auth.users WHERE id = %s",
                (user_id,),
            )
            row = await cur.fetchone()
            assert row["email_normalized"] == fresh_email.lower()
            assert row["email_verified_at"] is None


async def test_signup_rejects_duplicate(fresh_email: str) -> None:
    async with _conn() as c:
        await signup(c, email=fresh_email, password="GoodPassword12345")
    with pytest.raises(AuthError) as ei:
        async with _conn() as c:
            await signup(c, email=fresh_email, password="GoodPassword12345")
    assert ei.value.code == "email_already_registered"


async def test_signup_rejects_short_password(fresh_email: str) -> None:
    with pytest.raises(AuthError) as ei:
        async with _conn() as c:
            await signup(c, email=fresh_email, password="short")
    assert ei.value.code == "password_too_short"


async def test_verify_email_succeeds_once(fresh_email: str) -> None:
    async with _conn() as c:
        _uid, token = await signup(c, email=fresh_email, password="GoodPassword12345")
    async with _conn() as c:
        uid = await verify_email(c, token_plaintext=token)
        async with c.cursor() as cur:
            await cur.execute("SELECT email_verified_at FROM auth.users WHERE id = %s", (uid,))
            r = await cur.fetchone()
            assert r["email_verified_at"] is not None
    with pytest.raises(AuthError) as ei:
        async with _conn() as c:
            await verify_email(c, token_plaintext=token)
    assert ei.value.code == "token_already_used"


async def test_login_happy_path_then_refresh_then_logout(fresh_email: str) -> None:
    async with _conn() as c:
        _uid, _vt = await signup(c, email=fresh_email, password="GoodPassword12345")
    async with _conn() as c:
        sess = await login(c, email=fresh_email, password="GoodPassword12345")
        assert sess.access_token
        assert sess.refresh_token_plaintext
        first_rt = sess.refresh_token_plaintext

    async with _conn() as c:
        sess2 = await refresh(c, refresh_token_plaintext=first_rt)
        assert sess2.refresh_token_plaintext != first_rt
        assert sess2.user_id == sess.user_id

    # Reuse of the old (now revoked) refresh token must blow up the whole family.
    with pytest.raises(AuthError) as ei:
        async with _conn() as c:
            await refresh(c, refresh_token_plaintext=first_rt)
    assert ei.value.code == "token_reused"

    # The fresh one we got back is also now revoked because of reuse detection.
    with pytest.raises(AuthError) as ei2:
        async with _conn() as c:
            await refresh(c, refresh_token_plaintext=sess2.refresh_token_plaintext)
    assert ei2.value.code in {"invalid_token", "token_reused"}

    async with _conn() as c:
        # logout is idempotent on an already-revoked family.
        await logout(c, refresh_token_plaintext=sess2.refresh_token_plaintext)


async def test_login_wrong_password_locks_after_threshold(fresh_email: str) -> None:
    async with _conn() as c:
        await signup(c, email=fresh_email, password="GoodPassword12345")
    s = get_settings()
    for _ in range(s.max_failed_logins_per_hour):
        with pytest.raises(AuthError) as ei:
            async with _conn() as c:
                await login(c, email=fresh_email, password="WrongPassword12345")
        assert ei.value.code == "invalid_credentials"

    # Threshold reached; even the right password is now locked.
    with pytest.raises(AuthError) as ei2:
        async with _conn() as c:
            await login(c, email=fresh_email, password="GoodPassword12345")
    assert ei2.value.code == "account_locked"


async def test_login_unknown_email_returns_invalid_credentials(fresh_email: str) -> None:
    with pytest.raises(AuthError) as ei:
        async with _conn() as c:
            await login(c, email=fresh_email, password="WhateverPassword12345")
    assert ei.value.code == "invalid_credentials"


async def test_password_reset_flow(fresh_email: str) -> None:
    async with _conn() as c:
        await signup(c, email=fresh_email, password="GoodPassword12345")
    async with _conn() as c:
        result = await request_password_reset(c, email=fresh_email)
        assert result is not None
        _uid, token = result
    async with _conn() as c:
        await confirm_password_reset(c, token_plaintext=token, new_password="BrandNewPassword99")
    async with _conn() as c:
        sess = await login(c, email=fresh_email, password="BrandNewPassword99")
        assert sess.access_token


async def test_password_reset_for_unknown_email_returns_none(fresh_email: str) -> None:
    async with _conn() as c:
        result = await request_password_reset(c, email=fresh_email)
        assert result is None


async def test_magic_link_flow(fresh_email: str) -> None:
    async with _conn() as c:
        await signup(c, email=fresh_email, password="GoodPassword12345")
    async with _conn() as c:
        result = await request_magic_link(c, email=fresh_email)
        assert result is not None
        _uid, token = result
    async with _conn() as c:
        sess = await consume_magic_link(c, token_plaintext=token)
        assert sess.access_token
    # Second consume is rejected.
    with pytest.raises(AuthError) as ei:
        async with _conn() as c:
            await consume_magic_link(c, token_plaintext=token)
    assert ei.value.code == "token_already_used"
