# ADR-0033: Audit chain race-safe via pg_advisory_xact_lock + monotonic sequence_no

- Status: accepted
- Date: 2026-05-24
- Phase: 2
- Owner: Eng-Lead

## Context

The audit_log table needs tamper-evidence: every row's `entry_hash` chains to the previous row's `entry_hash` via SHA-256. Earlier drafts used `ORDER BY created_at DESC LIMIT 1` to find the previous hash. This is racy: under concurrent INSERTs from two requests in the same microsecond, both inserts can read the same `prev_hash` and produce diverging chains. A daily verifier would flag the divergence but only after the damage was done.

## Decision

Two changes (see `db/migrations/003_triggers_lifecycle.sql`):

1. **`pg_advisory_xact_lock(858993459)`** at the top of the `audit_log_chain()` BEFORE INSERT trigger. The lock key is an arbitrary constant; any concurrent INSERT waits here until the holder commits. Serializes the trigger but does not block reads.
2. **Monotonic `sequence_no bigint`** column with a UNIQUE index. The trigger reads `MAX(sequence_no)` (via `ORDER BY sequence_no DESC LIMIT 1` under the advisory lock) and assigns last+1. The hash chain hashes `sequence_no` in too, so even theoretical clock-skew between rows cannot produce a valid duplicate.

`verify_audit_chain()` walks rows by `ORDER BY sequence_no` (not created_at) and returns the first divergent `sequence_no` or NULL when intact. A daily Supabase / pg_cron job runs the verifier and pages SRE on a non-NULL return.

## Alternatives considered

- **SERIALIZABLE transaction isolation**: stronger but global; also breaks application code that wants weaker isolation in the same transaction.
- **A row-level lock on a sentinel row**: equivalent in effect but adds a real table; advisory_xact_lock is built-in and free.
- **App-level mutex in FastAPI**: useless under multi-process / multi-host setups; the lock must live in the DB.
- **Append-only via PG logical replication slot consumer**: heavyweight and adds replay-time complexity for what is a serial-write workload.

## Consequences

Gains:
- Audit chain provably non-divergent under concurrency.
- Verifier returns NULL on intact chain so failure mode is loud, not silent.
- No application-layer change needed; service code does plain INSERT into audit_log.

Costs:
- The advisory lock serializes audit_log inserts. At our expected write rate (low; security events), this is invisible. Stress-tested locally with 100 parallel inserts: all serialize cleanly, no errors, total latency <500 ms.
- The verifier is O(n) over audit_log; we will need to checkpoint and verify in segments by sequence_no once the table grows past several million rows.

## Related

- `db/migrations/003_triggers_lifecycle.sql` (audit_log_chain, verify_audit_chain).
- `db/migrations/001_initial_schema.sql` (audit_log table + DO INSTEAD NOTHING rules).
- ADR-0034 DEFERRABLE FKs (shares the migrations-strategy pattern).
- Bible v5.0 Part 3.7.
