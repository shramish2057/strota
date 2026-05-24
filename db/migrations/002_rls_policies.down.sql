-- Rollback for 002_rls_policies.sql: drop all policies + helpers.
DO $$ DECLARE r record; BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS current_user_is_admin();
DROP FUNCTION IF EXISTS current_user_can_write();
DROP FUNCTION IF EXISTS current_user_org_id();
