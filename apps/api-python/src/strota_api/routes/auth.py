"""Auth endpoints (ADR-0006).

All routes are public (skipped by HmacAuthMiddleware via PUBLIC_PATHS or
the auth-specific bypass). The middleware never gates these because the
caller is, by definition, not yet authenticated. The browser talks to them
directly via Next.js route handlers that proxy to FastAPI.
"""

from __future__ import annotations

import hashlib
import uuid
from datetime import datetime
from typing import Any

import jwt
from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr, Field

from ..auth import email as email_mod
from ..auth.service import (
    AuthError,
    AuthSession,
    confirm_password_reset,
    consume_magic_link,
    get_current_user,
    login,
    logout,
    refresh,
    request_magic_link,
    request_password_reset,
    signup,
    verify_email,
)
from ..auth.tokens import decode_access_token
from ..config import get_settings
from ..db import session
from ..logging import get_logger

router = APIRouter(prefix="/api/auth", tags=["auth"])
_log = get_logger("auth.routes")


# ---------------------------------------------------------------------
# Cookie helpers
# ---------------------------------------------------------------------
ACCESS_COOKIE = "strota_access"
REFRESH_COOKIE = "strota_refresh"
REFRESH_COOKIE_PATH = "/api/auth"


def _set_session_cookies(response: Response, sess: AuthSession) -> None:
    s = get_settings()
    response.set_cookie(
        ACCESS_COOKIE,
        sess.access_token,
        max_age=s.jwt_access_ttl_seconds,
        httponly=True,
        secure=s.environment != "development",
        samesite="lax",
        path="/",
    )
    response.set_cookie(
        REFRESH_COOKIE,
        sess.refresh_token_plaintext,
        max_age=s.jwt_refresh_ttl_days * 24 * 3600,
        httponly=True,
        secure=s.environment != "development",
        samesite="lax",
        path=REFRESH_COOKIE_PATH,
    )


def _clear_session_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_COOKIE, path="/")
    response.delete_cookie(REFRESH_COOKIE, path=REFRESH_COOKIE_PATH)


def _ip_hash_from_request(request: Request) -> str | None:
    # X-Forwarded-For respected only because Cloudflare sets it.
    ip = request.headers.get("x-forwarded-for") or request.client.host if request.client else ""
    if not ip:
        return None
    ip = ip.split(",")[0].strip()
    return hashlib.sha256(ip.encode()).hexdigest()


def _verify_url(token: str) -> str:
    s = get_settings()
    return f"{s.public_web_url.rstrip('/')}/verify-email?token={token}"


def _reset_url(token: str) -> str:
    s = get_settings()
    return f"{s.public_web_url.rstrip('/')}/passwort-zuruecksetzen?token={token}"


def _magic_url(token: str) -> str:
    s = get_settings()
    return f"{s.public_web_url.rstrip('/')}/magic-login?token={token}"


def _bearer_token(request: Request) -> str | None:
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip()
    return request.cookies.get(ACCESS_COOKIE)


def _refresh_token(request: Request) -> str | None:
    explicit = request.cookies.get(REFRESH_COOKIE)
    if explicit:
        return explicit
    return None


def _raise_for_auth_error(err: AuthError) -> None:
    raise HTTPException(status_code=err.http_status, detail={"code": err.code})


# ---------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------
class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=12, max_length=256)
    full_name: str | None = Field(default=None, max_length=200)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=256)


class EmailVerifyRequest(BaseModel):
    token: str = Field(..., min_length=20, max_length=256)


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str = Field(..., min_length=20, max_length=256)
    new_password: str = Field(..., min_length=12, max_length=256)


class MagicLinkRequest(BaseModel):
    email: EmailStr


class MagicLinkConsume(BaseModel):
    token: str = Field(..., min_length=20, max_length=256)


class SessionResponse(BaseModel):
    user_id: uuid.UUID
    org_id: uuid.UUID | None
    role: str
    email: EmailStr
    email_verified: bool
    access_token_expires_at: datetime
    refresh_token_expires_at: datetime


def _session_response(sess: AuthSession) -> SessionResponse:
    return SessionResponse(
        user_id=sess.user_id,
        org_id=sess.org_id,
        role=sess.role,
        email=sess.email,
        email_verified=sess.email_verified,
        access_token_expires_at=sess.access_token_expires_at,
        refresh_token_expires_at=sess.refresh_token_expires_at,
    )


# ---------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def route_signup(body: SignupRequest) -> dict[str, Any]:
    try:
        async with session() as conn:
            user_id, verify_token = await signup(
                conn,
                email=body.email,
                password=body.password,
                full_name=body.full_name,
            )
    except AuthError as e:
        _raise_for_auth_error(e)
    msg = email_mod.build_email_verification(
        to=body.email, verify_url=_verify_url(verify_token), full_name=body.full_name or ""
    )
    await email_mod.send_email(msg)
    return {"user_id": str(user_id), "verification_email_sent": True}


@router.post("/verify-email")
async def route_verify_email(body: EmailVerifyRequest) -> dict[str, Any]:
    try:
        async with session() as conn:
            user_id = await verify_email(conn, token_plaintext=body.token)
    except AuthError as e:
        _raise_for_auth_error(e)
    return {"user_id": str(user_id), "email_verified": True}


@router.post("/login")
async def route_login(body: LoginRequest, request: Request, response: Response) -> SessionResponse:
    try:
        async with session() as conn:
            sess = await login(
                conn,
                email=body.email,
                password=body.password,
                user_agent=request.headers.get("user-agent"),
                ip_hash=_ip_hash_from_request(request),
            )
    except AuthError as e:
        _raise_for_auth_error(e)
    _set_session_cookies(response, sess)
    return _session_response(sess)


@router.post("/refresh")
async def route_refresh(request: Request, response: Response) -> SessionResponse:
    tok = _refresh_token(request)
    if not tok:
        raise HTTPException(status_code=401, detail={"code": "missing_refresh_token"})
    try:
        async with session() as conn:
            sess = await refresh(
                conn,
                refresh_token_plaintext=tok,
                user_agent=request.headers.get("user-agent"),
                ip_hash=_ip_hash_from_request(request),
            )
    except AuthError as e:
        _clear_session_cookies(response)
        _raise_for_auth_error(e)
    _set_session_cookies(response, sess)
    return _session_response(sess)


@router.post("/logout")
async def route_logout(request: Request, response: Response) -> dict[str, Any]:
    tok = _refresh_token(request)
    if tok:
        async with session() as conn:
            await logout(conn, refresh_token_plaintext=tok)
    _clear_session_cookies(response)
    return {"logged_out": True}


@router.post("/password-reset/request")
async def route_password_reset_request(
    body: PasswordResetRequest, request: Request
) -> dict[str, Any]:
    async with session() as conn:
        result = await request_password_reset(
            conn, email=body.email, ip_hash=_ip_hash_from_request(request)
        )
    # Always respond with 200 so callers cannot enumerate accounts.
    if result is not None:
        _user_id, plaintext = result
        msg = email_mod.build_password_reset(to=body.email, reset_url=_reset_url(plaintext))
        await email_mod.send_email(msg)
    return {"sent_if_account_exists": True}


@router.post("/password-reset/confirm")
async def route_password_reset_confirm(body: PasswordResetConfirm) -> dict[str, Any]:
    try:
        async with session() as conn:
            user_id = await confirm_password_reset(
                conn, token_plaintext=body.token, new_password=body.new_password
            )
    except AuthError as e:
        _raise_for_auth_error(e)
    return {"user_id": str(user_id), "password_reset": True}


@router.post("/magic-link/request")
async def route_magic_link_request(body: MagicLinkRequest, request: Request) -> dict[str, Any]:
    async with session() as conn:
        result = await request_magic_link(
            conn, email=body.email, ip_hash=_ip_hash_from_request(request)
        )
    if result is not None:
        _user_id, plaintext = result
        msg = email_mod.build_magic_link(to=body.email, magic_url=_magic_url(plaintext))
        await email_mod.send_email(msg)
    return {"sent_if_account_exists": True}


@router.post("/magic-link/consume")
async def route_magic_link_consume(
    body: MagicLinkConsume, request: Request, response: Response
) -> SessionResponse:
    try:
        async with session() as conn:
            sess = await consume_magic_link(
                conn,
                token_plaintext=body.token,
                user_agent=request.headers.get("user-agent"),
                ip_hash=_ip_hash_from_request(request),
            )
    except AuthError as e:
        _raise_for_auth_error(e)
    _set_session_cookies(response, sess)
    return _session_response(sess)


@router.get("/me")
async def route_me(request: Request) -> dict[str, Any]:
    tok = _bearer_token(request)
    if not tok:
        raise HTTPException(status_code=401, detail={"code": "missing_access_token"})
    try:
        claims = decode_access_token(tok)
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=401, detail={"code": "invalid_access_token"}
        ) from e
    user_id = uuid.UUID(claims["sub"])
    try:
        async with session(user_id=str(user_id)) as conn:
            return await get_current_user(conn, user_id=user_id)
    except AuthError as e:
        _raise_for_auth_error(e)
        raise  # _raise_for_auth_error always raises; satisfies type-checker
