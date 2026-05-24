## What changed

<!-- Brief description in 1-2 sentences. -->

## Why

<!-- Link to ADR, issue, or Phase-Plan item from the Bible. -->

## How to test

- [ ] `pnpm test` green
- [ ] `cd apps/api-python && uv run pytest` green
- [ ] Round-trip: `node tests/integration/hmac_round_trip.mjs` green
- [ ] Manual UAT steps:

## Phase / ADR reference

Phase:
ADR(s):

## Checklist

- [ ] No em-dash or double-dash punctuation in code, comments, or PR text.
- [ ] No secrets, credentials, or PII in diff.
- [ ] Schema changes have matching down-migration.
- [ ] If touching auth, file pipeline, crypto, or schema/RLS: ADR added or updated, security-owner reviewed.
- [ ] If touching corpus: `lizenz_status` field present, source URL valid.
