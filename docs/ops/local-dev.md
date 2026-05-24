# Local Development Setup

What every engineer needs on their machine the first day.

## Required

- **Node.js 20.11** via `nvm use` (root `.nvmrc`).
- **pnpm 9.12.0** via Corepack: `corepack enable && corepack prepare pnpm@9.12.0 --activate`.
- **Python 3.12** via system package manager or pyenv.
- **uv** for Python deps: `pipx install uv` or `brew install uv`.
- **Docker** for local Postgres + Redis + (later) ClamAV, Ghostscript, VeraPDF.
- **psql** (Postgres client) for migration smoke tests: `brew install libpq && brew link --force libpq` or `apt install postgresql-client`.
- **Git** with user.name and user.email configured.

## First-time setup

```bash
git clone https://github.com/shramish2057/strota.git
cd strota

# Node
nvm use
corepack enable
corepack prepare pnpm@9.12.0 --activate
pnpm install

# Python API
cd apps/api-python
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"
cp .env.example .env  # edit HMAC_SECRET to a 32-char value
cd ../..

# Web
cp apps/web/.env.example apps/web/.env

# Postgres + Redis (both run in one compose file)
docker compose -f docker-compose.db.yml up -d
# Wait a few seconds then apply all migrations:
for f in 001_initial_schema 002_rls_policies 003_triggers_lifecycle 004_seed 005_self_hosted_auth; do
  PGPASSWORD=strota_dev psql -h 127.0.0.1 -p 55432 -U postgres -d strota \
    -v ON_ERROR_STOP=1 -f db/migrations/$f.sql
done
```

## Daily workflow

```bash
# Run all tests
pnpm test
cd apps/api-python && uv run pytest && cd ../..

# Start web dev server
pnpm --filter @strota/web dev

# Start API dev server (another terminal)
cd apps/api-python && uv run uvicorn strota_api.main:app --reload --port 8000
```

## Cross-language round-trip

```bash
pnpm --filter @strota/shared build
node tests/integration/hmac_round_trip.mjs
```

## Local Postgres + Redis

```bash
docker compose -f docker-compose.db.yml up -d   # Postgres 55432, Redis 6379
docker compose -f docker-compose.db.yml down    # Stop
docker compose -f docker-compose.db.yml down -v # Stop + wipe data volumes
```

## Where things live

- `apps/web/` - Next.js 15 user-facing app.
- `apps/api-python/` - FastAPI backend + custom auth.
- `packages/shared/` - shared TS types + HMAC.
- `packages/corpus/` - regulatory corpus (Phase 4 fills Bayern).
- `db/migrations/` - numbered SQL migrations (Postgres 17, self-hosted).
- `docs/adr/` - architecture decisions.
- `docs/ops/` - runbooks.
- `tests/integration/` - cross-language and cross-service tests.

## Git rules

- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`).
- No em-dash or `--` in code, comments, commit messages, or PR text (CI enforces).
- No secrets in diffs (gitleaks CI catches the obvious).
- Phase 1-3 has no CLAUDE co-author trailer; commits are authored by the actual engineer.

## Common errors

- `HMAC secret must be at least 32 characters`: edit `apps/api-python/.env` so `HMAC_SECRET` is 32+ chars.
- `Cannot connect to Redis`: start the docker container (above).
- `pnpm install` fails on Apple Silicon: confirm Node 20+ and pnpm 9.
