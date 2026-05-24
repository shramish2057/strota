# ADR-0034: DEFERRABLE FKs for projects <-> persona circular references

- Status: accepted
- Date: 2026-05-24
- Phase: 2
- Owner: Eng-Lead

## Context

The Strota schema has unavoidable circular references between `projects` and several persona tables:

- `projects.bauleiter_id` -> `bauleiter.id`
- `bauleiter.project_id` -> `projects.id`
- same pattern for `bauherren`, `eigentuemer`, `fachplaner`, `weg_beschluesse`, `projekt_eigentuemer`

If both FKs are NOT DEFERRABLE, no row can be inserted first - inserting a project before its bauleiter fails (FK references nothing) and vice versa. The earlier draft had this exact bug and tried to paper over it with multi-statement migrations.

## Decision

All persona-table FKs to projects are declared **DEFERRABLE INITIALLY DEFERRED**. The reverse FK `projects.bauleiter_id -> bauleiter.id` is also DEFERRABLE.

Implementation in `db/migrations/001_initial_schema.sql`: persona tables are created with `project_id uuid NOT NULL` but **without** the FK clause. Then `projects` is created. Then ALTER TABLE statements add all the cross-table FK constraints with `DEFERRABLE INITIALLY DEFERRED`.

Effect: inside a single transaction, you can:

```sql
BEGIN;
INSERT INTO projects (...) RETURNING id;          -- bauleiter_id = NULL
INSERT INTO bauleiter (project_id, ...) RETURNING id;
UPDATE projects SET bauleiter_id = <new bauleiter id>;
COMMIT;
```

Or even insert the bauleiter first with a project_id that references a not-yet-existing projects row, then insert the project. FK is checked at COMMIT, not at each statement.

## Alternatives considered

- **Drop one of the FKs** (e.g. don't track `projects.bauleiter_id`; query bauleiter by project_id only): loses the cheap denormalized lookup for the active bauleiter, even though we index it that way.
- **Use a `current_bauleiter` view or table**: adds a second source of truth.
- **Allow NULL on both sides + application-layer integrity**: brittle; the DB should enforce reality.
- **DEFERRABLE INITIALLY IMMEDIATE**: still requires explicit SET CONSTRAINTS in the transaction. Less ergonomic.

## Consequences

Gains:
- Schema can model the real reality (project knows its current bauleiter; bauleiter knows its project) without bootstrap pain.
- Tests and application code can insert in any order inside a transaction.

Costs:
- DEFERRABLE FKs check at COMMIT, so an invalid row inserted mid-tx gives the error only at COMMIT. We tolerate this for the schema-cleanliness win; tests exercise the failure mode.

## Related

- `db/migrations/001_initial_schema.sql` (ALTER TABLE ADD CONSTRAINT lines, end of file).
- ADR-0033 audit chain (shares the principle that the DB enforces what the DB owns).
- Bible v5.0 Part 3.7 ('Reihenfolge der Definitionen').
