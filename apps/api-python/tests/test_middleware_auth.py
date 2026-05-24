"""Auth middleware integration tests using an in-memory nonce store."""

from __future__ import annotations

import os

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

os.environ.setdefault("HMAC_SECRET", "x" * 32)
os.environ.setdefault("ENVIRONMENT", "testing")

from strota_api.config import get_settings  # noqa: E402
from strota_api.main import create_app  # noqa: E402
from strota_api.middleware.auth import HmacAuthMiddleware  # noqa: E402
from strota_api.security.hmac import (  # noqa: E402
    HMAC_HEADER_NONCE,
    HMAC_HEADER_SIGNATURE,
    HMAC_HEADER_TIMESTAMP,
    sign_request,
)
from strota_api.security.nonce_store import InMemoryNonceStore  # noqa: E402

SECRET = "x" * 32


@pytest.fixture()
def app_with_inmem_nonce() -> FastAPI:
    """Build an app with InMemoryNonceStore so tests do not need Redis."""
    # Reset cached settings so env-var overrides take effect.
    get_settings.cache_clear()  # type: ignore[attr-defined]
    app = create_app()
    # Replace the middleware's nonce store with an in-memory one.
    for mw in app.user_middleware:
        if mw.cls is HmacAuthMiddleware:
            mw.kwargs["nonce_store"] = InMemoryNonceStore()
            break
    return app


@pytest.fixture()
def client(app_with_inmem_nonce: FastAPI) -> TestClient:
    return TestClient(app_with_inmem_nonce)


def test_signed_post_accepted(client: TestClient) -> None:
    body = b'{"msg":"hello"}'
    headers = sign_request(secret=SECRET, body=body)
    response = client.post(
        "/internal/echo",
        content=body,
        headers={
            HMAC_HEADER_SIGNATURE: headers[HMAC_HEADER_SIGNATURE],
            HMAC_HEADER_TIMESTAMP: headers[HMAC_HEADER_TIMESTAMP],
            HMAC_HEADER_NONCE: headers[HMAC_HEADER_NONCE],
            "content-type": "application/json",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["received_bytes"] == len(body)
    assert payload["body_text"] == body.decode()


def test_unsigned_post_rejected(client: TestClient) -> None:
    response = client.post("/internal/echo", content=b"hi")
    assert response.status_code == 401
    assert response.json()["error"] == "missing_header"


def test_tampered_body_rejected(client: TestClient) -> None:
    headers = sign_request(secret=SECRET, body=b"orig")
    response = client.post(
        "/internal/echo",
        content=b"tampered",
        headers={
            HMAC_HEADER_SIGNATURE: headers[HMAC_HEADER_SIGNATURE],
            HMAC_HEADER_TIMESTAMP: headers[HMAC_HEADER_TIMESTAMP],
            HMAC_HEADER_NONCE: headers[HMAC_HEADER_NONCE],
        },
    )
    assert response.status_code == 401
    assert response.json()["error"] == "signature_mismatch"


def test_nonce_replay_rejected(client: TestClient) -> None:
    body = b'{"msg":"x"}'
    headers = sign_request(secret=SECRET, body=body)
    req_headers = {
        HMAC_HEADER_SIGNATURE: headers[HMAC_HEADER_SIGNATURE],
        HMAC_HEADER_TIMESTAMP: headers[HMAC_HEADER_TIMESTAMP],
        HMAC_HEADER_NONCE: headers[HMAC_HEADER_NONCE],
    }
    first = client.post("/internal/echo", content=body, headers=req_headers)
    assert first.status_code == 200
    # Same nonce within TTL = replay attempt.
    replay = client.post("/internal/echo", content=body, headers=req_headers)
    assert replay.status_code == 401
    assert replay.json()["error"] == "nonce_replay"


def test_public_health_skips_auth(client: TestClient) -> None:
    assert client.get("/healthz").status_code == 200
    assert client.get("/readyz").status_code == 200
