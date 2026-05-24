-- =====================================================================
-- 001_initial_schema.sql
-- Strota Phase 2 schema. All tables + indexes per v5.0 Bible Part 3.7.
-- DEFERRABLE INITIALLY DEFERRED FKs resolve the projects <-> personas
-- circular references (ADR-0034). RLS is enabled in 002_rls_policies.sql.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- pgvector is required in production for Strota Fragt (Phase 15.5). Not
-- present in plain Postgres 17, so guard with IF EXISTS.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'vector') THEN
    EXECUTE 'CREATE EXTENSION IF NOT EXISTS vector';
  END IF;
END $$;

-- auth.users is provided by Supabase. In standalone Postgres we stub it so
-- this migration can be smoke-tested in CI without Supabase.
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Stub auth.uid() so RLS policies compile in plain Postgres CI.
-- In production this is provided by Supabase Auth.
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

-- ---------------------------------------------------------------------
-- Organizations + Standorte
-- ---------------------------------------------------------------------
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text CHECK (type IN ('architekturbuero','bautraeger','planungsbuero','freiberufler','bauamt','enterprise')),
  primary_bundesland text,
  plan text DEFAULT 'freiberufler' CHECK (plan IN ('fachplaner_light','freiberufler','buero','bautraeger','enterprise','kommune')),
  stripe_customer_id text UNIQUE,
  stripe_mandate_id text,
  avv_signed_at timestamptz,
  avv_signed_by uuid,
  brief_kopf_template_path text,
  default_letterhead_logo_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE standorte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  adresse_strasse text,
  adresse_plz text,
  adresse_ort text,
  bundesland text,
  brief_kopf_template_path text,
  rechnungsadresse_overrides jsonb,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX standorte_org_idx ON standorte(org_id);

-- ---------------------------------------------------------------------
-- Users + Kammer-Eintragungen + Standorte mapping
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  org_id uuid REFERENCES organizations,
  role text DEFAULT 'member' CHECK (role IN ('owner','admin','member','viewer','fachplaner_light')),
  full_name text,
  email text,
  telefon text,
  bauvorlageberechtigung text DEFAULT 'keine'
    CHECK (bauvorlageberechtigung IN ('voll_architekt','voll_bauingenieur','voll_stadtplaner',
                                       'eingeschraenkt_innenarchitektur',
                                       'eingeschraenkt_klein_handwerk',
                                       'eu_dienstleister','keine')),
  primary_kammer_id uuid,
  stempel_asset_path text,
  theme text DEFAULT 'system' CHECK (theme IN ('light','dark','system')),
  locale text DEFAULT 'de-DE',
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX users_org_active_idx ON users(org_id) WHERE deleted_at IS NULL;

CREATE TABLE users_kammer_eintragungen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE CASCADE NOT NULL,
  bundesland text NOT NULL,
  kammer_typ text CHECK (kammer_typ IN ('architektenkammer','ingenieurkammer','stadtplanerkammer','innenarchitektenkammer')),
  kammer_name text,
  eintragsnummer text NOT NULL,
  eingetragen_seit date,
  eingetragen_bis date,
  validierungs_status text DEFAULT 'unverified'
    CHECK (validierungs_status IN ('unverified','verified_manual','verified_api','suspended')),
  last_verified_at timestamptz,
  validation_evidence_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, bundesland, kammer_typ)
);

CREATE TABLE users_standorte (
  user_id uuid REFERENCES users ON DELETE CASCADE,
  standort_id uuid REFERENCES standorte ON DELETE CASCADE,
  PRIMARY KEY (user_id, standort_id)
);

CREATE TABLE versicherungsnachweise (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE CASCADE,
  org_id uuid REFERENCES organizations ON DELETE CASCADE,
  versicherung_typ text CHECK (versicherung_typ IN ('berufshaftpflicht','cyber','vermoegen','sachschaden')),
  versicherer text,
  policennummer text,
  gueltig_von date,
  gueltig_bis date NOT NULL,
  deckungssumme_cents bigint,
  nachweis_file_id uuid,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX versicherung_expiry_idx ON versicherungsnachweise(gueltig_bis);

-- ---------------------------------------------------------------------
-- Persona tables (forward-referenced from projects via DEFERRABLE FKs)
-- ---------------------------------------------------------------------
CREATE TABLE bauherren (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  person_type text NOT NULL CHECK (person_type IN (
    'natuerlich','juristisch','gbr','ehepaar','bauherrengemeinschaft',
    'erbengemeinschaft','weg_sondereigentuemer','erbbauberechtigt','sonstige_juristisch')),
  name text NOT NULL,
  vertretungsberechtigter text,
  adresse_strasse text NOT NULL,
  adresse_hausnummer text,
  adresse_plz text NOT NULL,
  adresse_ort text NOT NULL,
  adresse_land text DEFAULT 'DE',
  geburtsdatum date,
  nationalitaet text,
  email text,
  telefon text,
  eigentuemer_ist_bauherr boolean DEFAULT true,
  vollmacht_file_id uuid,
  bevollmaechtigt_durch text,
  signature_status text DEFAULT 'ausstehend'
    CHECK (signature_status IN ('ausstehend','signiert','verweigert','vertreten_durch_vollmacht')),
  signature_order int DEFAULT 1,
  art13_info_delivered_at timestamptz,
  art13_info_delivery_method text,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX bauherren_project_idx ON bauherren(project_id);

CREATE TABLE eigentuemer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  name text NOT NULL,
  person_type text NOT NULL CHECK (person_type IN (
    'natuerlich','juristisch','gbr','ehepaar','weg','sonstige_juristisch')),
  adresse_strasse text,
  adresse_plz text,
  adresse_ort text,
  grundbuchblatt text,
  zustimmungserklaerung_file_id uuid,
  weg_beschluss_file_id uuid,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX eigentuemer_project_idx ON eigentuemer(project_id);

CREATE TABLE bauleiter (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  name text NOT NULL,
  qualifikation text NOT NULL,
  qualifikationsnachweis_file_id uuid,
  anzeigeschreiben_file_id uuid,
  zusatzqualifikation_brandschutz boolean DEFAULT false,
  versicherung_id uuid REFERENCES versicherungsnachweise,
  appointed_at timestamptz,
  active boolean DEFAULT true,
  ended_at timestamptz,
  ended_reason text,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX bauleiter_project_active_idx ON bauleiter(project_id) WHERE active = true;

CREATE TABLE fachplaner (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  disziplin text NOT NULL CHECK (disziplin IN (
    'statik','energie','brandschutz','schallschutz','vermessung','geotechnik',
    'lueftung','hygiene','schadstoffe','elektrotechnik','sonstige')),
  name text NOT NULL,
  organisation text,
  qualifikation text NOT NULL,
  listen_eintragsnummer text,
  listen_typ text,
  email text,
  telefon text,
  adresse text,
  vorlagentyp text,
  beauftragt_am date,
  signature_status text DEFAULT 'ausstehend'
    CHECK (signature_status IN ('ausstehend','signiert','verweigert')),
  guest_link_token text,
  guest_link_expires timestamptz,
  external_user_id uuid REFERENCES users,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX fachplaner_project_idx ON fachplaner(project_id) WHERE deleted_at IS NULL;
CREATE INDEX fachplaner_guest_token_idx ON fachplaner(guest_link_token) WHERE guest_link_token IS NOT NULL;

CREATE TABLE weg_beschluesse (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  beschluss_datum date NOT NULL,
  beschluss_typ text CHECK (beschluss_typ IN (
    'einfache_mehrheit','qualifizierte_mehrheit','einstimmig','allstimmig')),
  beschluss_text text,
  beschluss_protokoll_file_id uuid,
  beschluss_genehmigung text CHECK (beschluss_genehmigung IN (
    'erteilt','abgelehnt','vertagt')),
  verwalter text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE projekt_eigentuemer (
  project_id uuid NOT NULL,
  eigentuemer_id uuid REFERENCES eigentuemer ON DELETE CASCADE,
  anteil_promille int CHECK (anteil_promille BETWEEN 0 AND 1000),
  zustimmung_status text DEFAULT 'ausstehend',
  PRIMARY KEY (project_id, eigentuemer_id)
);

-- ---------------------------------------------------------------------
-- Projects (the central table)
-- ---------------------------------------------------------------------
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations NOT NULL,
  standort_id uuid REFERENCES standorte,
  name text NOT NULL,
  adresse_strasse text,
  adresse_hausnummer text,
  adresse_plz text,
  adresse_ort text,
  ags_code char(8),
  gemeinde text,
  landkreis text,
  bundesland text NOT NULL,
  intent text DEFAULT 'bauantrag'
    CHECK (intent IN ('bauantrag','vorbescheid','tekturantrag','abweichungsantrag',
                      'genehmigungsfreistellung','kenntnisgabe','abbruch',
                      'nachgenehmigung','nutzungsaenderung_anzeige','bauleiteranzeige',
                      'werbeanlage','widerspruch')),
  project_type text,
  nutzungsart text,
  gebaeudeklasse text CHECK (gebaeudeklasse IN ('GK1','GK2','GK3','GK4','GK5')),
  is_sonderbau boolean DEFAULT false,
  sonderbau_land_ref text,
  plot_situation text CHECK (plot_situation IN (
      'bplan_qualifiziert_30_1','bplan_einfach_30_3','vorhabenbezogen_12',
      'innenbereich_34','innenbereich_34_4_satzung','aussenbereich_35',
      'aussenbereich_35_privilegiert_abs1','aussenbereich_35_sonstig_abs2',
      'aussenbereich_35_teilprivilegiert_abs4','unknown')),
  vorhaben_nach_29_baugb boolean DEFAULT true,
  bplan_id text,
  bplan_wirksamkeit_fraglich boolean DEFAULT false,
  bestand_vor_1995 boolean DEFAULT false,
  eigentums_situation text CHECK (eigentums_situation IN (
      'bauherr_alleineigentuemer','bauherrengemeinschaft_alle_eigentuemer',
      'erbengemeinschaft','weg_sondereigentuemer','mieter','erbbauberechtigt',
      'juristische_person')),
  height_wandhoehe_m numeric(6,2),
  height_firsthoehe_m numeric(6,2),
  hoehen_bezugspunkt text CHECK (hoehen_bezugspunkt IN ('gok_gewachsen','gok_vorhanden','okfb','sonstig')),
  anzahl_wohneinheiten integer,
  anzahl_nutzungseinheiten integer,
  bruttogeschossflaeche_m2 numeric(10,2),
  bruttorauminhalt_m3 numeric(12,2),
  anbau_oder_erweiterung boolean DEFAULT false,
  nutzungsaenderung boolean DEFAULT false,
  verfahrensart text CHECK (verfahrensart IN (
      'verfahrensfrei','verfahrensfrei_anzeige','freistellung','kenntnisgabe_bw',
      'anzeigeverfahren','vereinfacht','genehmigung','sonderbau',
      'abweichung_isoliert','nachgenehmigung')),
  verfahrensart_legal_basis text,
  verfahrensart_legal_basis_effective_date date,
  verfahrensart_overridden boolean DEFAULT false,
  verfahrensart_override_reason text,
  pruefer_required jsonb DEFAULT '{}'::jsonb,
  pruefer_name text,
  behoerde_typ text CHECK (behoerde_typ IN (
      'bauamt_gemeinde','bauaufsichtsbehoerde_landratsamt',
      'bauaufsichtsbehoerde_kreisfreie_stadt','sonderzustaendig')),
  behoerde_name text,
  behoerde_adresse text,
  bauleiter_id uuid,
  bauamt_aktenzeichen text,
  status text DEFAULT 'in_vorbereitung'
    CHECK (status IN ('in_vorbereitung','einreichungsbereit','eingereicht',
                      'in_bearbeitung_bauamt','nachforderung_offen','genehmigt',
                      'abgelehnt','zurueckgezogen','genehmigung_erloschen',
                      'sperrfrist_laeuft','freigestellt','archiviert')),
  submission_date date,
  bescheid_datum date,
  geltungsdauer_baugenehmigung date,
  confidence_score integer CHECK (confidence_score BETWEEN 0 AND 100),
  genehmigungsfiktion_gilt boolean DEFAULT false,
  genehmigungsfiktion_date date,
  fiktion_frist_tage int,
  fiktion_basis text,
  corpus_version_used text,
  norm_effective_dates_snapshot jsonb,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES users,
  archived_at timestamptz,
  created_by uuid REFERENCES users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX projects_org_active_idx ON projects(org_id) WHERE deleted_at IS NULL;
CREATE INDEX projects_geltungsdauer_idx ON projects(geltungsdauer_baugenehmigung)
  WHERE status = 'genehmigt' AND geltungsdauer_baugenehmigung IS NOT NULL;
CREATE INDEX projects_ags_idx ON projects(ags_code) WHERE deleted_at IS NULL;
CREATE INDEX projects_status_idx ON projects(status) WHERE deleted_at IS NULL;

-- Resolve circular references with DEFERRABLE FKs (ADR-0034).
ALTER TABLE bauherren ADD CONSTRAINT bauherren_project_fk
  FOREIGN KEY (project_id) REFERENCES projects ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE eigentuemer ADD CONSTRAINT eigentuemer_project_fk
  FOREIGN KEY (project_id) REFERENCES projects ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE bauleiter ADD CONSTRAINT bauleiter_project_fk
  FOREIGN KEY (project_id) REFERENCES projects ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE fachplaner ADD CONSTRAINT fachplaner_project_fk
  FOREIGN KEY (project_id) REFERENCES projects ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE weg_beschluesse ADD CONSTRAINT weg_project_fk
  FOREIGN KEY (project_id) REFERENCES projects ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE projekt_eigentuemer ADD CONSTRAINT pe_project_fk
  FOREIGN KEY (project_id) REFERENCES projects ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE projects ADD CONSTRAINT projects_bauleiter_fk
  FOREIGN KEY (bauleiter_id) REFERENCES bauleiter DEFERRABLE INITIALLY DEFERRED;

-- ---------------------------------------------------------------------
-- Required documents + Files + File versions + Generated documents
-- ---------------------------------------------------------------------
CREATE TABLE required_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE,
  document_type text NOT NULL,
  name_de text NOT NULL,
  lbo_reference text,
  is_required boolean DEFAULT true,
  sourcing_type text CHECK (sourcing_type IN ('architect','external_specialist','authority','strota_generated')),
  sourcing_note text,
  submission_track text DEFAULT 'bauamt' CHECK (submission_track IN ('bauamt','psv','both')),
  status text DEFAULT 'ausstehend',
  sort_order integer,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX reqdocs_project_idx ON required_documents(project_id);

CREATE TABLE files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE NOT NULL,
  required_doc_id uuid REFERENCES required_documents,
  name text NOT NULL,
  storage_path text NOT NULL,
  storage_bucket text DEFAULT 'strota-documents-prod',
  size_bytes bigint,
  content_type text,
  version integer DEFAULT 1,
  validation_status text DEFAULT 'pending'
    CHECK (validation_status IN ('pending','validated','rejected','quarantined')),
  validation_errors jsonb,
  last_av_scan_signature_date date,
  text_content text,
  text_search tsvector
    GENERATED ALWAYS AS (to_tsvector('german', coalesce(text_content, ''))) STORED,
  uploaded_by uuid REFERENCES users,
  deleted_at timestamptz,
  uploaded_at timestamptz DEFAULT now()
);
CREATE INDEX files_text_search_idx ON files USING GIN(text_search);
CREATE INDEX files_project_active_idx ON files(project_id) WHERE deleted_at IS NULL;

CREATE TABLE file_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid REFERENCES files ON DELETE CASCADE NOT NULL,
  version integer NOT NULL,
  storage_path text NOT NULL,
  size_bytes bigint,
  content_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users,
  UNIQUE (file_id, version)
);

CREATE TABLE generated_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL,
  content_markdown text,
  content_pdf_path text,
  model_version text,
  prompt_hash text,
  input_parameters jsonb,
  generated_at timestamptz DEFAULT now(),
  last_edited_at timestamptz,
  last_edited_by uuid REFERENCES users,
  text_search tsvector
    GENERATED ALWAYS AS (to_tsvector('german', coalesce(content_markdown, ''))) STORED
);
CREATE INDEX gendocs_project_idx ON generated_documents(project_id);
CREATE INDEX gendocs_text_search_idx ON generated_documents USING GIN(text_search);

-- ---------------------------------------------------------------------
-- B-Plan analyses + Completeness checks + Nachbarbeteiligung
-- ---------------------------------------------------------------------
CREATE TABLE bplan_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE,
  bplan_file_id uuid REFERENCES files,
  analysis_mode text CHECK (analysis_mode IN ('bplan_30','innenbereich_34','aussenbereich_35')),
  extracted_parameters jsonb,
  compliance_matrix jsonb,
  ausnahme_items jsonb,
  befreiung_items jsonb,
  abstandsflaechenproblem boolean DEFAULT false,
  nachbar_34_documentation jsonb,
  analyzed_at timestamptz DEFAULT now()
);

CREATE TABLE completeness_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE,
  score integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  layer1_results jsonb,
  layer2_results jsonb,
  layer3_results jsonb,
  layer4_results jsonb,
  architect_override boolean DEFAULT false,
  override_declaration text,
  checked_at timestamptz DEFAULT now(),
  checked_by uuid REFERENCES users
);
CREATE INDEX completeness_project_idx ON completeness_checks(project_id, checked_at DESC);

CREATE TABLE nachbar_beteiligung (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE,
  nachbar_address text NOT NULL,
  nachbar_name text,
  plot_number text,
  status text DEFAULT 'ausstehend'
    CHECK (status IN ('ausstehend','unterschrieben','abgelehnt','nicht_erreichbar')),
  signed_at timestamptz,
  signature_file_id uuid REFERENCES files,
  notes text
);

-- ---------------------------------------------------------------------
-- Aktenzeichen + Parallel Genehmigungen + Genehmigungsfristen
-- ---------------------------------------------------------------------
CREATE TABLE aktenzeichen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE NOT NULL,
  verfahren_typ text NOT NULL,
  aktenzeichen text NOT NULL,
  behoerde text NOT NULL,
  assigned_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE parallel_genehmigungen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE NOT NULL,
  genehmigung_typ text NOT NULL,
  behoerde text NOT NULL,
  aktenzeichen text,
  status text DEFAULT 'in_vorbereitung'
    CHECK (status IN ('in_vorbereitung','eingereicht','in_bearbeitung','genehmigt','abgelehnt','widerspruch')),
  frist date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE genehmigungsfristen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE UNIQUE,
  submission_vollstaendig_date date,
  fiktion_deadline date,
  fiktion_triggered boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------
-- Signatures (qeS + Mehrpersonen + TSA + LTV)
-- ---------------------------------------------------------------------
CREATE TABLE signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE NOT NULL,
  document_id uuid,
  document_kind text CHECK (document_kind IN ('file','generated_document')),
  signer_role text NOT NULL
    CHECK (signer_role IN ('bauherr','entwurfsverfasser','bauleiter','pruefer','bauamt',
                           'fachplaner_statik','fachplaner_energie','fachplaner_brandschutz',
                           'fachplaner_schall','fachplaner_oebvi','fachplaner_sonstige',
                           'eigentuemer','weg_verwalter')),
  signer_user_id uuid REFERENCES users,
  signer_bauherr_id uuid REFERENCES bauherren,
  signer_fachplaner_id uuid REFERENCES fachplaner,
  signer_eigentuemer_id uuid REFERENCES eigentuemer,
  CONSTRAINT signature_exactly_one_signer CHECK (
    (signer_user_id IS NOT NULL)::int +
    (signer_bauherr_id IS NOT NULL)::int +
    (signer_fachplaner_id IS NOT NULL)::int +
    (signer_eigentuemer_id IS NOT NULL)::int = 1
  ),
  signed_at timestamptz NOT NULL,
  certificate_serial text,
  certificate_issuer text,
  document_hash text NOT NULL,
  signature_method text NOT NULL
    CHECK (signature_method IN ('qeS_eIDAS','at_handysignatur','at_id_austria',
                                 'ch_suisseID','ch_swissID','bayernID','elster',
                                 'servicekonto','bundID','hessen_id','bremen_konto',
                                 'handschriftlich_scan')),
  tsa_token bytea,
  tsa_issuer text,
  tsa_timestamp timestamptz,
  revocation_check_status text CHECK (revocation_check_status IN ('ok','revoked','unknown','not_required')),
  revocation_check_at timestamptz,
  multi_signature_group_id uuid,
  verification_result jsonb,
  pades_ltv_embedded boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX signatures_project_role_idx ON signatures(project_id, signer_role);
CREATE INDEX signatures_msg_idx ON signatures(multi_signature_group_id) WHERE multi_signature_group_id IS NOT NULL;

-- ---------------------------------------------------------------------
-- Submissions + Bauamt-Kommunikation + Bautagebuch + Abnahmen + Geltungsdauer alerts
-- ---------------------------------------------------------------------
CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE NOT NULL,
  submission_typ text NOT NULL CHECK (submission_typ IN (
    'bauantrag','nachforderung_antwort','tektur','vorbescheid','widerspruch',
    'baubeginn','rohbau','fertigstellung','schlussabnahme','abbruch',
    'bauleiteranzeige','bauunterbrechung','bauleiter_wechsel','bauherr_wechsel',
    'entwurfsverfasser_wechsel','anhoerung_stellungnahme','wiedereinsetzung',
    'untaetigkeitsklage','aufschiebende_wirkung_antrag','genehmigung_verlaengerung')),
  submitted_at timestamptz NOT NULL,
  submitted_to text NOT NULL,
  channel text CHECK (channel IN ('post','email','portal_manual','xbau_submit','einschreiben_rueckschein')),
  file_version_ids uuid[],
  versand_tracking_nr text,
  empfangsbestaetigung_file_id uuid,
  empfangsbestaetigung_datum date,
  rueckschein_datum date,
  bauamt_eingangs_aktenzeichen text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE bauamt_kommunikation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE NOT NULL,
  kommunikations_typ text CHECK (kommunikations_typ IN (
    'vorbesprechung','telefonat','email_eingehend','email_ausgehend',
    'schreiben_eingehend','schreiben_ausgehend','besichtigung','sonstiges')),
  datum timestamptz NOT NULL,
  teilnehmer text[],
  thema text,
  protokoll_md text,
  anhaenge_file_ids uuid[],
  created_by uuid REFERENCES users,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE bautagebuch_eintraege (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE NOT NULL,
  bauleiter_id uuid REFERENCES bauleiter,
  eintrag_datum date NOT NULL,
  witterung text,
  anwesende text[],
  arbeiten_durchgefuehrt text,
  abnahmen text,
  vorkommnisse text,
  vorgaben_vom_pruefer text,
  fotos_file_ids uuid[],
  beilagen_file_ids uuid[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE geltungsdauer_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE NOT NULL,
  alert_typ text CHECK (alert_typ IN ('12_monate','6_monate','3_monate','1_monat','erloschen')),
  scheduled_for date NOT NULL,
  sent_at timestamptz,
  recipient_user_ids uuid[],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE abnahmen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE NOT NULL,
  abnahme_typ text CHECK (abnahme_typ IN (
    'rohbau','schluss','aufzug','heizung','lueftung','schornstein','elektro','sonstige')),
  abnahme_datum date,
  abnehmende_stelle text,
  ergebnis text CHECK (ergebnis IN ('ok','mit_mangeln','abgelehnt','offen')),
  maengelliste_md text,
  protokoll_file_id uuid,
  created_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------
-- Tasks + Briefkoepfe + HOAI + Korpus snapshots + API keys / audit
-- ---------------------------------------------------------------------
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE NOT NULL,
  titel text NOT NULL,
  beschreibung text,
  assignee_user_id uuid REFERENCES users,
  faellig_am date,
  status text DEFAULT 'offen' CHECK (status IN ('offen','in_arbeit','blockiert','erledigt','verworfen')),
  blocker_on_task_id uuid REFERENCES tasks,
  reminder_sent_at timestamptz,
  created_by uuid REFERENCES users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX tasks_assignee_faellig_idx ON tasks(assignee_user_id, faellig_am) WHERE status != 'erledigt';

CREATE TABLE mandanten_briefkoepfe (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations ON DELETE CASCADE NOT NULL,
  standort_id uuid REFERENCES standorte,
  name text NOT NULL,
  logo_path text,
  header_html text,
  footer_html text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE hoai_honorare (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE NOT NULL,
  anrechenbare_kosten_cents bigint NOT NULL,
  honorarzone text CHECK (honorarzone IN ('I','II','III','IV','V')),
  honorarsatz text CHECK (honorarsatz IN ('mindest','mittel','hoechst','pauschal')),
  leistungsphasen int[] NOT NULL,
  prozentsatz_pro_lph jsonb,
  honorar_total_netto_cents bigint NOT NULL,
  nebenkosten_pauschal_cents bigint,
  ust_satz numeric(4,2) DEFAULT 19,
  honorar_total_brutto_cents bigint NOT NULL,
  berechnung_datum date DEFAULT current_date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE korpus_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES submissions ON DELETE CASCADE,
  project_id uuid REFERENCES projects ON DELETE CASCADE,
  korpus_version text NOT NULL,
  korpus_files_hash text NOT NULL,
  effective_dates jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations ON DELETE CASCADE NOT NULL,
  key_hash text NOT NULL,
  name text NOT NULL,
  scopes text[] NOT NULL,
  created_by uuid REFERENCES users,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE api_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL,
  org_id uuid REFERENCES organizations,
  method text NOT NULL,
  path text NOT NULL,
  status_code int,
  request_size_bytes int,
  response_size_bytes int,
  duration_ms int,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX api_audit_org_created_idx ON api_audit_log(org_id, created_at DESC);

-- ---------------------------------------------------------------------
-- Q&A cache + feedback + public checks + cookie consents
-- ---------------------------------------------------------------------
CREATE TABLE baurecht_qa_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_hash text UNIQUE NOT NULL,
  question_text text,
  answer_markdown text,
  citations jsonb,
  bundeslaender text[],
  created_at timestamptz DEFAULT now(),
  cache_valid_until timestamptz DEFAULT (now() + interval '24 hours')
);

CREATE TABLE qa_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qa_cache_id uuid REFERENCES baurecht_qa_cache,
  user_id uuid REFERENCES users,
  helpful boolean NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations NOT NULL,
  rechnungsnummer text UNIQUE NOT NULL,
  stripe_invoice_id text UNIQUE,
  leistungszeitraum_von date NOT NULL,
  leistungszeitraum_bis date NOT NULL,
  betrag_netto_cents integer NOT NULL,
  ust_satz numeric(4,2),
  betrag_brutto_cents integer NOT NULL,
  reverse_charge boolean DEFAULT false,
  pdf_path text,
  xrechnung_xml text,
  zugferd_pdf_path text,
  issued_at timestamptz DEFAULT now()
);

CREATE TABLE public_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type text CHECK (check_type IN ('genehmigungsfrei','dokument_analyse','q_and_a','grz_rechner')),
  session_id text,
  user_id uuid REFERENCES users,
  ip_hash text,
  bundesland text,
  ags_code text,
  result_verdict text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX public_checks_created_idx ON public_checks(created_at DESC);

CREATE TABLE cookie_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  consented boolean NOT NULL,
  consented_at timestamptz DEFAULT now(),
  ip_hash text
);

-- ---------------------------------------------------------------------
-- Audit log with monotonic sequence_no (race-safe via advisory lock in 003)
-- ---------------------------------------------------------------------
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid,
  user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  prev_hash text NOT NULL,
  entry_hash text NOT NULL,
  sequence_no bigint NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT audit_log_has_anchor CHECK (org_id IS NOT NULL OR entity_id IS NOT NULL)
);
CREATE INDEX audit_log_org_created_idx ON audit_log(org_id, created_at DESC) WHERE org_id IS NOT NULL;
CREATE INDEX audit_log_entity_idx ON audit_log(entity_type, entity_id);
CREATE UNIQUE INDEX audit_log_seq_unique ON audit_log(sequence_no);
CREATE RULE audit_log_no_update AS ON UPDATE TO audit_log DO INSTEAD NOTHING;
CREATE RULE audit_log_no_delete AS ON DELETE TO audit_log DO INSTEAD NOTHING;
