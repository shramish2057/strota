"""Inter-service auth middleware.

Validates four layers per ADR-0002 + ADR-0035 (v5.0):

  1. mTLS client cert fingerprint allowlist (set by Cloudflare Tunnel /
     X-Forwarded-Client-Cert header in production; bypassed when
     `MTLS_ALLOWED_FINGERPRINTS` is empty for local dev).
  2. HMAC-SHA256 signature over the canonical message.
  3. Timestamp skew check (60s window per ADR-0035).
  4. Redis nonce store (NX SET with TTL) to prevent replay even within the
     skew window.

Public health endpoints in ``PUBLIC_PATHS`` skip the entire pipeline.
"""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any, cast

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from ..config import Settings, get_settings
from ..logging import get_logger
from ..security.hmac import (
    HMAC_HEADER_NONCE,
    HMAC_HEADER_SIGNATURE,
    HMAC_HEADER_TIMESTAMP,
    verify_request,
)
from ..security.mtls import check_allowlist, fingerprint_from_pem, is_valid_fingerprint
from ..security.nonce_store import InMemoryNonceStore, NonceStore, RedisNonceStore

PUBLIC_PATHS: frozenset[str] = frozenset({"/healthz", "/readyz", "/openapi.json"})

MTLS_HEADER = "x-forwarded-client-cert"
MTLS_FINGERPRINT_HEADER = "x-client-cert-fingerprint-sha256"


def _make_default_nonce_store(settings: Settings) -> NonceStore:
    """Return Redis store in real environments, in-memory in tests."""
    if settings.environment == "testing":
        return InMemoryNonceStore()
    return RedisNonceStore(settings.redis_url)


class HmacAuthMiddleware(BaseHTTPMiddleware):
    """Full HMAC + mTLS + Redis-nonce middleware (Commit 5, Phase 1)."""

    def __init__(self, app: Any, *, nonce_store: NonceStore | None = None) -> None:
        super().__init__(app)
        self._settings = get_settings()
        self._log = get_logger("auth")
        self._nonce_store: NonceStore = nonce_store or _make_default_nonce_store(self._settings)

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        if request.url.path in PUBLIC_PATHS:
            return await call_next(request)

        settings = self._settings

        # Layer 1: mTLS fingerprint allowlist (skip if no allowlist configured).
        if settings.mtls_allowed_fingerprints:
            fingerprint = self._extract_fingerprint(request)
            if not fingerprint:
                return self._reject(401, "mtls_fingerprint_missing")
            if not check_allowlist(fingerprint, settings.mtls_allowed_fingerprints):
                return self._reject(401, "mtls_fingerprint_not_allowed")
            # CRL check via Redis. RedisNonceStore reuses its client; we open a
            # tiny check here without a separate dependency.
            if await self._is_revoked(fingerprint):
                return self._reject(401, "mtls_fingerprint_revoked")

        # Layer 2 + 3: signature + timestamp.
        body = await request.body()
        outcome = verify_request(
            secret=settings.hmac_secret,
            secret_previous=settings.hmac_secret_previous,
            body=body,
            signature_header=request.headers.get(HMAC_HEADER_SIGNATURE, ""),
            timestamp_header=request.headers.get(HMAC_HEADER_TIMESTAMP, ""),
            nonce_header=request.headers.get(HMAC_HEADER_NONCE, ""),
            skew_seconds=settings.hmac_skew_seconds,
        )
        if not outcome.ok:
            return self._reject(401, outcome.reason or "auth_failed")

        # Layer 4: Redis nonce replay prevention.
        nonce = request.headers[HMAC_HEADER_NONCE]
        accepted = await self._nonce_store.remember(nonce, settings.nonce_ttl_seconds)
        if not accepted:
            return self._reject(401, "nonce_replay")

        # Re-inject body so downstream handlers can read it again.
        # Starlette's BaseHTTPMiddleware does not preserve body across `await request.body()`,
        # so we wrap the receive callable.
        request._receive = self._replay_body_receive(body)

        return await call_next(request)

    @staticmethod
    def _extract_fingerprint(request: Request) -> str | None:
        # Preferred: Cloudflare or sidecar sets a pre-computed fingerprint header.
        pre = request.headers.get(MTLS_FINGERPRINT_HEADER, "").strip().lower()
        if is_valid_fingerprint(pre):
            return pre
        # Fallback: parse the full cert PEM from X-Forwarded-Client-Cert.
        pem = request.headers.get(MTLS_HEADER, "").strip()
        if pem.startswith("-----BEGIN"):
            try:
                return fingerprint_from_pem(pem.encode("ascii"))
            except (ValueError, UnicodeError):
                return None
        return None

    async def _is_revoked(self, fingerprint: str) -> bool:
        store = self._nonce_store
        if not isinstance(store, RedisNonceStore):
            # In test/in-memory mode there is no CRL; treat as not revoked.
            return False
        client = store._client  # noqa: SLF001 - same-package helper access
        # redis-py types sismember as a union of sync int and awaitable for
        # client-mode overloading. The asyncio client always returns the
        # awaitable; we cast so mypy strict accepts the await.
        coro = cast(Awaitable[int], client.sismember(self._settings.mtls_crl_redis_key, fingerprint))
        return bool(await coro)

    @staticmethod
    def _replay_body_receive(body: bytes) -> Callable[[], Awaitable[dict[str, Any]]]:
        sent = False

        async def receive() -> dict[str, Any]:
            nonlocal sent
            if sent:
                return {"type": "http.request", "body": b"", "more_body": False}
            sent = True
            return {"type": "http.request", "body": body, "more_body": False}

        return receive

    def _reject(self, status: int, reason: str) -> Response:
        self._log.warning("auth.reject", reason=reason)
        return JSONResponse(status_code=status, content={"error": reason})
