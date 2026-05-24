-- =====================================================================
-- 002_rls_policies.sql
-- Row Level Security policies for every table in 001.
-- Per v5.0 Bible Part 3.7 with INSERT WITH CHECK lückenlos.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helpers
-- SECURITY DEFINER so the functions read users without triggering the
-- users-table RLS policy, which would recurse infinitely (each policy
-- on users would re-invoke current_user_org_id which selects from users).
-- search_path is locked down to prevent SQL-injection via temp objects.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION current_user_org_id() RETURNS uuid
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog AS $$
  SELECT org_id FROM users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION current_user_can_write() RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role IN ('owner','admin','member')
      AND deleted_at IS NULL
  )
$$;

CREATE OR REPLACE FUNCTION current_user_is_admin() RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role IN ('owner','admin')
      AND deleted_at IS NULL
  )
$$;

-- Revoke execute from anon; only authenticated and service_role should call.
REVOKE EXECUTE ON FUNCTION current_user_org_id()      FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION current_user_can_write()   FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION current_user_is_admin()    FROM PUBLIC;

-- ---------------------------------------------------------------------
-- Enable RLS on every public-schema table
-- ---------------------------------------------------------------------
ALTER TABLE organizations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE standorte                ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_kammer_eintragungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_standorte          ENABLE ROW LEVEL SECURITY;
ALTER TABLE versicherungsnachweise   ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE bauherren                ENABLE ROW LEVEL SECURITY;
ALTER TABLE eigentuemer              ENABLE ROW LEVEL SECURITY;
ALTER TABLE bauleiter                ENABLE ROW LEVEL SECURITY;
ALTER TABLE fachplaner               ENABLE ROW LEVEL SECURITY;
ALTER TABLE weg_beschluesse          ENABLE ROW LEVEL SECURITY;
ALTER TABLE projekt_eigentuemer      ENABLE ROW LEVEL SECURITY;
ALTER TABLE required_documents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE files                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bplan_analyses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE completeness_checks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE nachbar_beteiligung      ENABLE ROW LEVEL SECURITY;
ALTER TABLE aktenzeichen             ENABLE ROW LEVEL SECURITY;
ALTER TABLE parallel_genehmigungen   ENABLE ROW LEVEL SECURITY;
ALTER TABLE genehmigungsfristen      ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures               ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE bauamt_kommunikation     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bautagebuch_eintraege    ENABLE ROW LEVEL SECURITY;
ALTER TABLE geltungsdauer_alerts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE abnahmen                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandanten_briefkoepfe    ENABLE ROW LEVEL SECURITY;
ALTER TABLE hoai_honorare            ENABLE ROW LEVEL SECURITY;
ALTER TABLE korpus_snapshots         ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_feedback              ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_checks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookie_consents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_audit_log            ENABLE ROW LEVEL SECURITY;
-- baurecht_qa_cache: write only via service role; revoke anon/authenticated.
REVOKE ALL ON TABLE baurecht_qa_cache FROM PUBLIC;

-- ---------------------------------------------------------------------
-- Organizations + Standorte + Users
-- ---------------------------------------------------------------------
CREATE POLICY "org_read_own" ON organizations FOR SELECT
  USING (id = current_user_org_id());
CREATE POLICY "org_update_admin" ON organizations FOR UPDATE
  USING (id = current_user_org_id() AND current_user_is_admin())
  WITH CHECK (id = current_user_org_id() AND current_user_is_admin());

CREATE POLICY "standorte_select" ON standorte FOR SELECT
  USING (org_id = current_user_org_id());
CREATE POLICY "standorte_write" ON standorte FOR ALL
  USING (org_id = current_user_org_id())
  WITH CHECK (org_id = current_user_org_id() AND current_user_is_admin());

CREATE POLICY "users_read_org" ON users FOR SELECT
  USING (org_id = current_user_org_id());
CREATE POLICY "users_update_own" ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "kammer_eintragungen_own" ON users_kammer_eintragungen FOR ALL
  USING (user_id = auth.uid()
    OR (current_user_is_admin()
        AND user_id IN (SELECT id FROM users WHERE org_id = current_user_org_id())))
  WITH CHECK (user_id = auth.uid()
    OR (current_user_is_admin()
        AND user_id IN (SELECT id FROM users WHERE org_id = current_user_org_id())));

CREATE POLICY "users_standorte_org" ON users_standorte FOR ALL
  USING (user_id IN (SELECT id FROM users WHERE org_id = current_user_org_id()))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE org_id = current_user_org_id()));

CREATE POLICY "versicherung_select" ON versicherungsnachweise FOR SELECT
  USING (user_id = auth.uid() OR org_id = current_user_org_id());
CREATE POLICY "versicherung_write" ON versicherungsnachweise FOR ALL
  USING (user_id = auth.uid()
    OR (org_id = current_user_org_id() AND current_user_can_write()))
  WITH CHECK (user_id = auth.uid()
    OR (org_id = current_user_org_id() AND current_user_can_write()));

-- ---------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------
CREATE POLICY "projects_read_org" ON projects FOR SELECT
  USING (org_id = current_user_org_id());
CREATE POLICY "projects_insert" ON projects FOR INSERT
  WITH CHECK (org_id = current_user_org_id() AND current_user_can_write());
CREATE POLICY "projects_update" ON projects FOR UPDATE
  USING (org_id = current_user_org_id())
  WITH CHECK (current_user_can_write());
CREATE POLICY "projects_delete_admin" ON projects FOR DELETE
  USING (org_id = current_user_org_id() AND current_user_is_admin());

-- ---------------------------------------------------------------------
-- Persona tables (project-scoped)
-- ---------------------------------------------------------------------
CREATE POLICY "bauherren_select" ON bauherren FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "bauherren_write" ON bauherren FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

CREATE POLICY "eigentuemer_select" ON eigentuemer FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "eigentuemer_write" ON eigentuemer FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

CREATE POLICY "bauleiter_select" ON bauleiter FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "bauleiter_write" ON bauleiter FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

CREATE POLICY "fachplaner_select" ON fachplaner FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    OR external_user_id = auth.uid());
CREATE POLICY "fachplaner_write" ON fachplaner FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

CREATE POLICY "weg_select" ON weg_beschluesse FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "weg_write" ON weg_beschluesse FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

CREATE POLICY "pe_select" ON projekt_eigentuemer FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "pe_write" ON projekt_eigentuemer FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

-- ---------------------------------------------------------------------
-- Documents + Files
-- ---------------------------------------------------------------------
CREATE POLICY "reqdocs_select" ON required_documents FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "reqdocs_insert" ON required_documents FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());
CREATE POLICY "reqdocs_update" ON required_documents FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (current_user_can_write());
CREATE POLICY "reqdocs_delete" ON required_documents FOR DELETE
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_is_admin());

CREATE POLICY "files_select" ON files FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "files_insert" ON files FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());
CREATE POLICY "files_update" ON files FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (current_user_can_write());

CREATE POLICY "file_versions_select" ON file_versions FOR SELECT
  USING (file_id IN (SELECT id FROM files WHERE project_id IN
    (SELECT id FROM projects WHERE org_id = current_user_org_id())));
CREATE POLICY "file_versions_insert" ON file_versions FOR INSERT
  WITH CHECK (file_id IN (SELECT id FROM files WHERE project_id IN
    (SELECT id FROM projects WHERE org_id = current_user_org_id()))
    AND current_user_can_write());

CREATE POLICY "gendocs_select" ON generated_documents FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "gendocs_insert" ON generated_documents FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());
CREATE POLICY "gendocs_update" ON generated_documents FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (current_user_can_write());

-- ---------------------------------------------------------------------
-- B-Plan + Completeness + Nachbarbeteiligung + Fristen
-- ---------------------------------------------------------------------
CREATE POLICY "bplan_select" ON bplan_analyses FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "bplan_write" ON bplan_analyses FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

CREATE POLICY "checks_select" ON completeness_checks FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "checks_insert" ON completeness_checks FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

CREATE POLICY "nachbar_select" ON nachbar_beteiligung FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "nachbar_insert" ON nachbar_beteiligung FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());
CREATE POLICY "nachbar_update" ON nachbar_beteiligung FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (current_user_can_write());

CREATE POLICY "fristen_select" ON genehmigungsfristen FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "fristen_write" ON genehmigungsfristen FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

-- ---------------------------------------------------------------------
-- Aktenzeichen + Parallel Genehmigungen + Signaturen + Submissions + Komm
-- ---------------------------------------------------------------------
CREATE POLICY "aktenzeichen_select" ON aktenzeichen FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "aktenzeichen_write" ON aktenzeichen FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

CREATE POLICY "parallel_select" ON parallel_genehmigungen FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "parallel_write" ON parallel_genehmigungen FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

CREATE POLICY "signatures_select" ON signatures FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "signatures_write" ON signatures FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));

CREATE POLICY "submissions_select" ON submissions FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "submissions_insert" ON submissions FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

CREATE POLICY "bauamt_komm_select" ON bauamt_kommunikation FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "bauamt_komm_write" ON bauamt_kommunikation FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

CREATE POLICY "bautagebuch_select" ON bautagebuch_eintraege FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "bautagebuch_write" ON bautagebuch_eintraege FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

CREATE POLICY "geltungsdauer_select" ON geltungsdauer_alerts FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
-- writes via service role only

CREATE POLICY "abnahmen_select" ON abnahmen FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "abnahmen_write" ON abnahmen FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

-- ---------------------------------------------------------------------
-- Tasks + Briefkoepfe + HOAI + Korpus snapshots
-- ---------------------------------------------------------------------
CREATE POLICY "tasks_select" ON tasks FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "tasks_write" ON tasks FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

CREATE POLICY "briefkopf_select" ON mandanten_briefkoepfe FOR SELECT
  USING (org_id = current_user_org_id());
CREATE POLICY "briefkopf_write" ON mandanten_briefkoepfe FOR ALL
  USING (org_id = current_user_org_id())
  WITH CHECK (org_id = current_user_org_id() AND current_user_is_admin());

CREATE POLICY "hoai_select" ON hoai_honorare FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
CREATE POLICY "hoai_write" ON hoai_honorare FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id())
    AND current_user_can_write());

CREATE POLICY "snapshots_select" ON korpus_snapshots FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE org_id = current_user_org_id()));
-- writes via service role only

-- ---------------------------------------------------------------------
-- Q&A feedback + Invoices + Audit log + Public checks + Cookie consents + API keys
-- ---------------------------------------------------------------------
CREATE POLICY "qa_feedback_own" ON qa_feedback FOR SELECT
  USING (user_id = auth.uid() OR current_user_is_admin());
CREATE POLICY "qa_feedback_insert" ON qa_feedback FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "invoices_read_admin" ON invoices FOR SELECT
  USING (org_id = current_user_org_id() AND current_user_is_admin());
-- No INSERT/UPDATE policies, invoices written via service role.

CREATE POLICY "audit_read_org_admin" ON audit_log FOR SELECT
  USING (org_id = current_user_org_id() AND current_user_is_admin());
-- No INSERT/UPDATE/DELETE policies, audit_log written via service role
-- through the BEFORE INSERT trigger in 003_triggers_lifecycle.sql.

CREATE POLICY "public_checks_insert_anon" ON public_checks FOR INSERT WITH CHECK (true);
CREATE POLICY "public_checks_read_own" ON public_checks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "cookie_consents_own" ON cookie_consents FOR ALL
  USING (
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR (session_id IS NOT NULL AND session_id = current_setting('request.session_id', true))
  )
  WITH CHECK (
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR (session_id IS NOT NULL AND session_id = current_setting('request.session_id', true))
  );

CREATE POLICY "api_keys_admin" ON api_keys FOR ALL
  USING (org_id = current_user_org_id() AND current_user_is_admin())
  WITH CHECK (org_id = current_user_org_id() AND current_user_is_admin());

CREATE POLICY "api_audit_admin" ON api_audit_log FOR SELECT
  USING (org_id = current_user_org_id() AND current_user_is_admin());
