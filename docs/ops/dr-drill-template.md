# DR Drill Template

Semi-annual disaster-recovery drill. RPO target 24h, RTO target 4h (Bible v5.0 Part 3.2).

## Pre-drill checklist (week before)

- [ ] On-call schedule confirmed.
- [ ] Staging environment idle, safe to overwrite.
- [ ] Most recent Hetzner Object Storage backup snapshot identified (use `aws s3 ls s3://strota-documents-backup-hel/`).
- [ ] Supabase PITR snapshot for the same point-in-time identified.
- [ ] Communication template prepared (this is a drill, no customer impact expected).

## Drill steps

1. **T+0** Announce drill in on-call channel; freeze prod writes for the drill window.
2. **T+0:05** Pick a random backup from the last 30 days (NOT the most recent - confirms older backups also restore).
3. **T+0:10** Restore Supabase PITR snapshot to staging project.
4. **T+0:30** Restore Hetzner Object Storage backup bucket to staging bucket.
5. **T+1:00** Bring up FastAPI staging instance pointed at restored DB + bucket.
6. **T+1:30** Bring up Vercel preview deployment of web pointed at FastAPI staging.
7. **T+2:00** Run smoke tests (`pnpm test`, `node tests/integration/hmac_round_trip.mjs`, manual: create project, upload PDF, run Vollständigkeitsprüfung).
8. **T+2:30** Validate audit-chain integrity on restored DB (`SELECT verify_audit_chain();`).
9. **T+3:00** Document findings in `docs/ops/dr-drill-YYYY-MM-DD.md`.
10. **T+4:00** Drill ends. Either fully completed (RTO target met) or extension required (RTO breach to be analyzed).

## Acceptance criteria (must all be true)

- Smoke tests pass on restored stack.
- Audit chain verifies (no tampering during restore).
- File hashes match originals for a sampled set of 10 documents.
- RTO observed <= 4h.
- RPO observed <= 24h (oldest unrecovered write).

## Failure modes to learn from

- Backup bucket missing recent files: backup cron lag - alarm thresholds need tightening.
- Schema migration applied post-snapshot but not in backup: PITR replay must include schema-migration replay.
- HMAC secret rotation happened post-snapshot: secret rotation cron must also export to backup.

## Cadence

- Two drills per year (March and September).
- Findings documented under `docs/ops/dr-drill-YYYY-MM-DD.md`.
- Action items tracked in `docs/ops/dr-action-items.md` until closed.
