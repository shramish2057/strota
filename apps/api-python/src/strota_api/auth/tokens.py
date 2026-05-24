"""Random tokens, hashing, and JWT issue/verify.

- One-time tokens (email-verify, password-reset, magic-link, refresh) are
  generated as 256-bit url-safe random and stored as sha256(plaintext) in
  the DB so a DB leak does not yield usable tokens.
- Access JWTs are stateless (no DB round-trip on verify). Signed HS256
  with key rotation overlap via JWT_SIGNING_KEY + JWT_SIGNING_KEY_PREVIOUS,
  same pattern as ADR-0035 HMAC rotation.
"""

from __future__ import annotations

import hashlib
import secrets
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt

from ..config import get_settings


# ---------------------------------------------------------------------
# One-time tokens
# ---------------------------------------------------------------------
def generate_token() -> str:
    """256-bit url-safe random string (43 base64url chars)."""
    return secrets.token_urlsafe(32)


def hash_token(plaintext: str) -> str:
    """SHA-256 hex hash of a token. Stored at rest; plaintext goes in the email."""
    return hashlib.sha256(plaintext.encode("utf-8")).hexdigest()


# ---------------------------------------------------------------------
# JWT access tokens
# ---------------------------------------------------------------------
@dataclass(frozen=True)
class AccessTokenClaims:
    """The minimal set of JWT claims Strota needs on the wire."""

    sub: str  # auth.users.id as str
    org_id: str | None  # public.users.org_id as str (None for fresh signups)
    role: str  # public.users.role
    iat: int
    exp: int
    iss: str
    aud: str
    jti: str  # unique per token


def issue_access_token(
    *,
    user_id: uuid.UUID,
    org_id: uuid.UUID | None,
    role: str,
    now: datetime | None = None,
) -> str:
    s = get_settings()
    now = now or datetime.now(tz=UTC)
    exp = now + timedelta(seconds=s.jwt_access_ttl_seconds)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "org_id": str(org_id) if org_id else None,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
        "iss": s.jwt_issuer,
        "aud": s.jwt_audience,
        "jti": secrets.token_urlsafe(12),
    }
    return jwt.encode(payload, s.jwt_signing_key, algorithm=s.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """Verify and decode. Tries the current key, then the previous key
    during rotation overlap. Raises jwt.PyJWTError on failure."""
    s = get_settings()
    try:
        return jwt.decode(
            token,
            s.jwt_signing_key,
            algorithms=[s.jwt_algorithm],
            audience=s.jwt_audience,
            issuer=s.jwt_issuer,
        )
    except jwt.InvalidSignatureError:
        if s.jwt_signing_key_previous:
            return jwt.decode(
                token,
                s.jwt_signing_key_previous,
                algorithms=[s.jwt_algorithm],
                audience=s.jwt_audience,
                issuer=s.jwt_issuer,
            )
        raise


# ---------------------------------------------------------------------
# Refresh tokens
# ---------------------------------------------------------------------
@dataclass(frozen=True)
class IssuedRefreshToken:
    plaintext: str
    token_hash: str
    family_id: uuid.UUID
    expires_at: datetime


def issue_refresh_token(
    *,
    family_id: uuid.UUID | None = None,
    now: datetime | None = None,
) -> IssuedRefreshToken:
    s = get_settings()
    now = now or datetime.now(tz=UTC)
    plaintext = generate_token()
    return IssuedRefreshToken(
        plaintext=plaintext,
        token_hash=hash_token(plaintext),
        family_id=family_id or uuid.uuid4(),
        expires_at=now + timedelta(days=s.jwt_refresh_ttl_days),
    )
