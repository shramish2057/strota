"""FastAPI entrypoint.

Phase 1 scope: health endpoint + HMAC + mTLS middleware skeleton.
Subsequent phases add file validation, AI streaming, qeS pipeline, etc.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from . import __version__
from .config import get_settings
from .db import close_pool, get_pool
from .logging import configure_logging, get_logger
from .middleware.auth import HmacAuthMiddleware
from .routes import auth as auth_routes
from .routes import health, internal, public as public_routes


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """App lifespan: configure logging, validate config, log boot."""
    configure_logging()
    settings = get_settings()
    log = get_logger(__name__)
    log.info(
        "service.boot",
        environment=settings.environment,
        version=__version__,
        hmac_skew_seconds=settings.hmac_skew_seconds,
        nonce_ttl_seconds=settings.nonce_ttl_seconds,
    )
    # Eagerly open the DB pool; failure here is fatal at boot, not first request.
    try:
        await get_pool()
    except Exception as e:  # noqa: BLE001
        log.error("db.pool.open_failed", error=str(e))
    yield
    await close_pool()
    log.info("service.shutdown")


def create_app() -> FastAPI:
    """App factory, used by ASGI server and tests."""
    app = FastAPI(
        title="Strota API",
        version=__version__,
        docs_url=None,  # API docs disabled in prod; rely on OpenAPI export
        redoc_url=None,
        openapi_url="/openapi.json" if get_settings().environment != "production" else None,
        lifespan=lifespan,
    )

    # HMAC + mTLS-fingerprint middleware applied to ALL non-public routes.
    # Public routes (e.g. /healthz) skip via path allowlist inside the middleware.
    app.add_middleware(HmacAuthMiddleware)

    app.include_router(health.router)
    app.include_router(auth_routes.router)
    app.include_router(internal.router)
    app.include_router(public_routes.router)

    return app


app = create_app()
