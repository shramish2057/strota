"""Inter-service auth middleware stub for Phase 1 boot.

The full HMAC + mTLS + nonce + CRL implementation arrives in Commit 5 (Phase 1).
This stub keeps `/healthz` and `/readyz` reachable so the service can boot and
Cloudflare Tunnel health probes succeed before the cryptographic layer lands.
"""

from __future__ import annotations

from collections.abc import Awaitable, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Paths that bypass auth (health probes from Cloudflare Tunnel / Better Uptime).
PUBLIC_PATHS: frozenset[str] = frozenset({"/healthz", "/readyz"})


class HmacAuthMiddleware(BaseHTTPMiddleware):
    """Stub middleware: lets public paths through; rejects everything else.

    Full implementation in `Commit 5` adds:
      - X-Strota-Signature HMAC-SHA256 verification (with secret rotation overlap).
      - X-Strota-Timestamp skew check (60s window, v5.0 ADR-0035).
      - X-Strota-Nonce replay prevention via Redis SET with TTL.
      - mTLS client cert SHA-256 fingerprint allowlist.
      - Redis-backed CRL check for revoked deployment certs.
    """

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        if request.url.path in PUBLIC_PATHS:
            return await call_next(request)

        # Phase 1 stub: future commits gate authenticated routes here.
        # Until Commit 5, no authenticated routes exist, so this branch is unreachable.
        return Response(
            status_code=401,
            content='{"error":"auth_middleware_not_yet_implemented"}',
            media_type="application/json",
        )
