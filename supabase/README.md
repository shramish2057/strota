# Supabase

Database, Auth, Realtime, and Storage layer for Strota. Production instance lives in EU-Frankfurt; local development uses Supabase CLI or the lightweight `docker-compose.db.yml` at the repo root.

## Layout

```
supabase/
  config.toml             Local CLI config (ports, JWT, mail templates).
  migrations/             Numbered SQL migrations applied in order.
    001_initial_schema.sql
    002_rls_policies.sql
    003_triggers_lifecycle.sql
    004_seed.sql
  templates/              German email templates (verify, magic link, recovery, change email).
  seed/                   Optional fixtures for ad-hoc local use.
```

## Two ways to run locally

### Option A: Supabase CLI (Studio + Auth + Storage + Realtime)

```bash
# Install once: brew install supabase/tap/supabase
supabase start                         # Spins up the full stack at 54321/54322/54323
supabase db reset                      # Applies all migrations + seed
supabase status                        # Shows API URL, anon key, service-role key
```

### Option B: Postgres only via docker-compose (fast iteration on schema)

```bash
docker compose -f docker-compose.db.yml up -d
# Apply migrations with psql:
PGPASSWORD=strota_dev psql -h 127.0.0.1 -p 54322 -U postgres -d strota \
  -v ON_ERROR_STOP=1 \
  -f supabase/migrations/001_initial_schema.sql \
  -f supabase/migrations/002_rls_policies.sql \
  -f supabase/migrations/003_triggers_lifecycle.sql \
  -f supabase/migrations/004_seed.sql
```

CI uses Option B (faster, no extra Supabase services needed for schema validation).

## Migration conventions

1. One numbered file per logical chunk; never edit an applied migration in place.
2. Each up-file has a sibling down-file (e.g. `001_initial_schema.down.sql`) for rollback.
3. CHECK constraints, DEFERRABLE FKs, and RLS policies must round-trip green in CI before merge.
4. Schema changes that touch auth, RLS, or PII require an ADR and security-owner review.

## Email templates

German-language Supabase Auth templates live under `templates/`. Override the SMTP sender per environment via `supabase/config.toml` (`auth.email.smtp.admin_email` / `sender_name`).
