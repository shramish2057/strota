# @strota/api-python

FastAPI service auf Hetzner CCX53 Nuremberg, erreichbar nur via Cloudflare Tunnel mit mTLS + HMAC-Signatur (Defense in Depth, ADR-0002).

## Stack

- Python 3.12.
- FastAPI 0.115, Pydantic 2, Pydantic-Settings.
- uvicorn (ASGI), Tini als PID 1.
- Redis 7 (Nonce-Store, Rate-Limit).
- structlog (JSON logging, PII-Redaction via Allow-List).
- Paket-Management: uv.

## Lokal starten

Voraussetzungen: Python 3.12, uv installiert (`pipx install uv` oder `brew install uv`).

```bash
cd apps/api-python
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"
cp .env.example .env
uv run uvicorn strota_api.main:app --reload --port 8000
```

Health: http://localhost:8000/healthz

## Tests

```bash
uv run pytest
uv run ruff check src tests
uv run mypy src
```

## Docker

```bash
docker build -t strota-api:dev .
docker run --rm -p 8000:8000 --env-file .env strota-api:dev
```

## Phase-1-Scope

- Health (`/healthz`, `/readyz`) Endpoints.
- HMAC + mTLS Middleware Stub (full crypto in Commit 5 dieser Phase).
- Strukturiertes Logging (structlog JSON).
- Pydantic Settings mit Pflicht-HMAC-Secret-Validation beim Boot.
- Dockerfile mit Multi-Stage Build + Non-Root User + Tini.

Spätere Phasen ergänzen File-Validation (Phase 6), AI-Streaming (Phase 9), B-Plan-Vision (Phase 13), qeS-Pipeline (Phase 20), etc.
