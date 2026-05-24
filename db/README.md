# Database

Self-hosted Postgres 17 on the Hetzner CCX53 (co-located with FastAPI). Auth, sessions, storage URLs all owned by Strota: no Supabase, no managed-DB vendor. See ADR-0006 for the rationale and ADR-0001 for the platform shape.

## Layout

```
db/
  migrations/             Numbered SQL applied in order on every environment.
    001_initial_schema.sql + .down.sql
    002_rls_policies.sql + .down.sql
    003_triggers_lifecycle.sql + .down.sql
    004_seed.sql + .down.sql
```

## Local development

```bash
docker compose -f docker-compose.db.yml up -d   # Postgres 17 + Redis 7 on 55432 + 6379
PGPASSWORD=strota_dev psql -h 127.0.0.1 -p 55432 -U postgres -d strota \
  -v ON_ERROR_STOP=1 \
  -f db/migrations/001_initial_schema.sql \
  -f db/migrations/002_rls_policies.sql \
  -f db/migrations/003_triggers_lifecycle.sql \
  -f db/migrations/004_seed.sql
```

The web app and FastAPI talk to the same `127.0.0.1:55432` for dev. In production both run on the Hetzner CCX53 and talk over `127.0.0.1:5432` on the loopback (no network egress, no TLS overhead). The Hetzner firewall denies all external Postgres ingress.

## Production deployment

- Postgres 17 installed on the Hetzner CCX53 alongside FastAPI + Redis.
- Listens only on `127.0.0.1`; firewall blocks all external Postgres ports.
- `pgbackrest` (or equivalent) snapshots to Hetzner Object Storage every hour.
- Daily full + hourly incrementals; 30-day PITR window.
- Weekly verified restore drill into a throwaway namespace.
- TLS for application to DB is unnecessary on loopback; required when the DB moves to a separate node (Phase 16+ likely).

## Auth posture

There is no Supabase Auth and no third-party auth provider. The `auth.users` table in `001_initial_schema.sql` is owned by Strota; password hashing (argon2id), email verification, magic-link, password reset, JWT issuance, and session rotation all run in FastAPI (see `apps/api-python/src/strota_api/auth/`).

RLS still uses `auth.uid()` exactly as a Supabase setup would. The function reads `request.jwt.claim.sub`, which FastAPI sets per-connection via `SET LOCAL` after verifying the JWT. This keeps RLS as a defense-in-depth layer even if a FastAPI handler forgets to filter by org.

## Migration conventions

1. One numbered file per logical chunk; never edit an applied migration in place.
2. Each `NNN_name.up.sql` has a matching `NNN_name.down.sql`.
3. CHECK constraints, DEFERRABLE FKs, and RLS must round-trip green in CI before merge.
4. Anything touching auth, RLS, or PII needs an ADR and security-owner review.

## Smoke test

```bash
docker compose -f docker-compose.db.yml down -v
docker compose -f docker-compose.db.yml up -d
sleep 5
for f in 001_initial_schema 002_rls_policies 003_triggers_lifecycle 004_seed; do
  PGPASSWORD=strota_dev psql -h 127.0.0.1 -p 55432 -U postgres -d strota \
    -v ON_ERROR_STOP=1 -f db/migrations/$f.sql >/dev/null && echo "$f OK"
done
```

CI runs this against a fresh Postgres on every push.
