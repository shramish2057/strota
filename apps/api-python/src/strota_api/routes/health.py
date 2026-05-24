"""Health endpoints.

`/healthz` is public (skipped by HmacAuthMiddleware). Used by Cloudflare Tunnel
health probes and Better Uptime monitoring.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter

from .. import __version__
from ..config import get_settings

router = APIRouter()


@router.get("/healthz", tags=["health"])
async def healthz() -> dict[str, Any]:
    """Liveness probe."""
    return {
        "status": "ok",
        "service": "strota-api",
        "version": __version__,
        "environment": get_settings().environment,
        "timestamp": datetime.now(tz=UTC).isoformat(),
    }


@router.get("/readyz", tags=["health"])
async def readyz() -> dict[str, Any]:
    """Readiness probe.

    Phase 1: returns ok if config loads. Later phases will check Redis, DB,
    Anthropic reachability.
    """
    settings = get_settings()
    return {
        "status": "ready",
        "service": settings.service_name,
        "checks": {"config": "ok"},
    }
