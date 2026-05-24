-- =====================================================================
-- 003_triggers_lifecycle.sql
-- Audit-chain trigger (race-safe via pg_advisory_xact_lock + sequence_no),
-- updated_at auto-touch on every mutable table, and the 10-year hard-delete
-- lifecycle function called by the Supabase scheduled cron in production.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Audit chain (ADR-0033)
-- One global advisory lock per insert ensures consecutive sequence_no values
-- without the ORDER BY created_at race. Genesis prev_hash is SHA-256(zeros).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_log_chain() RETURNS trigger AS $$
DECLARE
  last_hash text;
  last_seq bigint;
BEGIN
  -- 858993459 is an arbitrary 32-bit constant used as the lock key for the
  -- audit chain. Any concurrent INSERT waits here until the holder commits.
  PERFORM pg_advisory_xact_lock(858993459);

  SELECT entry_hash, sequence_no INTO last_hash, last_seq
    FROM audit_log ORDER BY sequence_no DESC LIMIT 1;
  IF last_hash IS NULL THEN
    last_hash := repeat('0', 64);
    last_seq  := 0;
  END IF;

  NEW.prev_hash := last_hash;
  NEW.sequence_no := last_seq + 1;
  NEW.entry_hash := encode(
    digest(
      last_hash
        || NEW.sequence_no::text
        || coalesce(NEW.org_id::text, '')
        || coalesce(NEW.user_id::text, '')
        || NEW.action
        || coalesce(NEW.entity_type, '')
        || coalesce(NEW.entity_id::text, '')
        || coalesce(NEW.metadata::text, '')
        || NEW.created_at::text,
      'sha256'
    ),
    'hex'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_audit_log_chain BEFORE INSERT ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_chain();

-- Verification function: walks the chain in sequence_no order and recomputes
-- each entry_hash. Returns the first sequence_no that diverged, or NULL if
-- the chain is intact. Daily Supabase cron pages SRE on a non-NULL return.
CREATE OR REPLACE FUNCTION verify_audit_chain()
RETURNS bigint LANGUAGE plpgsql STABLE AS $$
DECLARE
  r record;
  prev text := repeat('0', 64);
  expected text;
BEGIN
  FOR r IN SELECT * FROM audit_log ORDER BY sequence_no LOOP
    expected := encode(
      digest(
        prev
          || r.sequence_no::text
          || coalesce(r.org_id::text, '')
          || coalesce(r.user_id::text, '')
          || r.action
          || coalesce(r.entity_type, '')
          || coalesce(r.entity_id::text, '')
          || coalesce(r.metadata::text, '')
          || r.created_at::text,
        'sha256'
      ),
      'hex'
    );
    IF expected <> r.entry_hash OR r.prev_hash <> prev THEN
      RETURN r.sequence_no;
    END IF;
    prev := r.entry_hash;
  END LOOP;
  RETURN NULL;
END;
$$;

-- ---------------------------------------------------------------------
-- updated_at: apply to every table that has the column.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE r record; BEGIN
  FOR r IN
    SELECT table_schema, table_name
    FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema = 'public'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS tg_updated_%I ON %I.%I',
                   r.table_name, r.table_schema, r.table_name);
    EXECUTE format(
      'CREATE TRIGGER tg_updated_%I BEFORE UPDATE ON %I.%I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      r.table_name, r.table_schema, r.table_name
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- 10-year hard-delete lifecycle (HOAI §14 + AO §147 + HGB §257)
-- Called by Supabase Scheduled Function or pg_cron in production. Local
-- and CI invocation is a no-op when no expired rows exist.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_10y_retention()
RETURNS TABLE (table_name text, deleted_rows bigint)
LANGUAGE plpgsql AS $$
DECLARE
  deleted bigint;
BEGIN
  DELETE FROM files
   WHERE project_id IN (
     SELECT id FROM projects
      WHERE deleted_at IS NOT NULL
        AND deleted_at < now() - interval '10 years'
   );
  GET DIAGNOSTICS deleted = ROW_COUNT;
  table_name := 'files'; deleted_rows := deleted; RETURN NEXT;

  DELETE FROM generated_documents
   WHERE project_id IN (
     SELECT id FROM projects
      WHERE deleted_at IS NOT NULL
        AND deleted_at < now() - interval '10 years'
   );
  GET DIAGNOSTICS deleted = ROW_COUNT;
  table_name := 'generated_documents'; deleted_rows := deleted; RETURN NEXT;

  DELETE FROM projects
   WHERE deleted_at IS NOT NULL
     AND deleted_at < now() - interval '10 years';
  GET DIAGNOSTICS deleted = ROW_COUNT;
  table_name := 'projects'; deleted_rows := deleted; RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION enforce_10y_retention IS
  'Deletes records whose parent project was soft-deleted more than 10 years ago. '
  'audit_log entries are NEVER deleted (retained 10y hot + cold archive thereafter).';
