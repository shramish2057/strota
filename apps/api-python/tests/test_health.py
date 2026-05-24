"""Health endpoint smoke tests."""

from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient

# Same fix as test_middleware_auth.py: force the secret so tests are
# independent of the shell/CI HMAC_SECRET value.
os.environ["HMAC_SECRET"] = "x" * 32
os.environ.setdefault("ENVIRONMENT", "testing")


@pytest.fixture(scope="module")
def client() -> TestClient:
    from strota_api.config import get_settings
    from strota_api.main import create_app

    get_settings.cache_clear()  # type: ignore[attr-defined]
    return TestClient(create_app())


def test_healthz_returns_ok(client: TestClient) -> None:
    response = client.get("/healthz")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "strota-api"


def test_readyz_returns_ready(client: TestClient) -> None:
    response = client.get("/readyz")
    assert response.status_code == 200
    assert response.json()["status"] == "ready"


def test_unauthenticated_protected_path_returns_401(client: TestClient) -> None:
    """Non-public paths require HMAC headers. Missing headers => 401."""
    response = client.get("/internal/echo")
    assert response.status_code == 401
    # `missing_header` from the HMAC verifier, or `method_not_allowed` if the
    # route only allows POST; this test confirms the auth middleware ran first.
    assert response.json()["error"] in {"missing_header", "method_not_allowed"}
