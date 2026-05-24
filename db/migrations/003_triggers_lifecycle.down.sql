-- Rollback for 003_triggers_lifecycle.sql.
DROP TRIGGER IF EXISTS tg_audit_log_chain ON audit_log;
DROP FUNCTION IF EXISTS audit_log_chain();
DROP FUNCTION IF EXISTS verify_audit_chain();
DROP FUNCTION IF EXISTS enforce_10y_retention();

DO $$ DECLARE r record; BEGIN
  FOR r IN
    SELECT table_schema, table_name
    FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema = 'public'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS tg_updated_%I ON %I.%I',
                   r.table_name, r.table_schema, r.table_name);
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS set_updated_at();
