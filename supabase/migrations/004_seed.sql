-- =====================================================================
-- 004_seed.sql
-- Seed for local development and CI smoke tests.
-- 2 orgs, 3 users, 5 projects (Bayern Neubau focus), Bayern requirement-matrix sample.
-- Idempotent: uses fixed UUIDs + ON CONFLICT DO NOTHING.
-- =====================================================================

-- Bootstrap auth.users (Supabase manages this in production; standalone DB needs it).
INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'owner@example-architekten.de'),
  ('22222222-2222-2222-2222-222222222222', 'member@example-architekten.de'),
  ('33333333-3333-3333-3333-333333333333', 'admin@example-bautraeger.de')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- Organizations
-- ---------------------------------------------------------------------
INSERT INTO organizations (id, name, type, primary_bundesland, plan) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001',
   'Beispiel Architekten Muenchen GmbH', 'architekturbuero', 'Bayern', 'buero'),
  ('aaaaaaaa-0000-0000-0000-000000000002',
   'Beispiel Bautraeger Nordbayern AG', 'bautraeger', 'Bayern', 'bautraeger')
ON CONFLICT (id) DO NOTHING;

INSERT INTO standorte (id, org_id, name, adresse_strasse, adresse_plz, adresse_ort, bundesland, is_primary) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'Hauptstandort Muenchen', 'Maximilianstrasse 1', '80539', 'Muenchen', 'Bayern', true),
  ('bbbbbbbb-0000-0000-0000-000000000002',
   'aaaaaaaa-0000-0000-0000-000000000002',
   'Hauptsitz Nuernberg', 'Lorenzer Strasse 14', '90402', 'Nuernberg', 'Bayern', true)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------
INSERT INTO users (id, org_id, role, full_name, email, bauvorlageberechtigung) VALUES
  ('11111111-1111-1111-1111-111111111111',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'owner', 'Beispiel Architektin', 'owner@example-architekten.de',
   'voll_architekt'),
  ('22222222-2222-2222-2222-222222222222',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'member', 'Beispiel Mitarbeiter', 'member@example-architekten.de',
   'keine'),
  ('33333333-3333-3333-3333-333333333333',
   'aaaaaaaa-0000-0000-0000-000000000002',
   'admin', 'Beispiel Bauleitung', 'admin@example-bautraeger.de',
   'voll_bauingenieur')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users_kammer_eintragungen
  (user_id, bundesland, kammer_typ, kammer_name, eintragsnummer, eingetragen_seit, validierungs_status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Bayern', 'architektenkammer',
   'Bayerische Architektenkammer', 'BAYAK-12345', '2015-04-01', 'verified_manual'),
  ('33333333-3333-3333-3333-333333333333', 'Bayern', 'ingenieurkammer',
   'Bayerische Ingenieurekammer-Bau', 'BAYIK-98765', '2010-07-15', 'verified_manual')
ON CONFLICT (user_id, bundesland, kammer_typ) DO NOTHING;

INSERT INTO users_standorte (user_id, standort_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-0000-0000-0000-000000000001'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000001'),
  ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-0000-0000-0000-000000000002')
ON CONFLICT (user_id, standort_id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 5 sample projects (Bayern, Neubau focus)
-- ---------------------------------------------------------------------
INSERT INTO projects
  (id, org_id, standort_id, name,
   adresse_strasse, adresse_plz, adresse_ort, ags_code, gemeinde, landkreis, bundesland,
   intent, project_type, nutzungsart, gebaeudeklasse, is_sonderbau,
   plot_situation, eigentums_situation,
   height_wandhoehe_m, height_firsthoehe_m, hoehen_bezugspunkt,
   anzahl_wohneinheiten, bruttogeschossflaeche_m2,
   verfahrensart, verfahrensart_legal_basis, behoerde_typ, behoerde_name, status,
   corpus_version_used, created_by)
VALUES
  ('cccccccc-0000-0000-0000-000000000001',
   'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001',
   'Neubau EFH Musterstrasse 12',
   'Musterstrasse 12', '81675', 'Muenchen', '09162000', 'Muenchen', 'Stadt Muenchen', 'Bayern',
   'bauantrag', 'neubau_wohngebaeude', 'wohnbaulich', 'GK2', false,
   'bplan_qualifiziert_30_1', 'bauherr_alleineigentuemer',
   6.50, 9.80, 'gok_gewachsen',
   1, 240.00,
   'vereinfacht', 'Art. 59 BayBO', 'bauamt_gemeinde',
   'Lokalbaukommission Muenchen', 'in_vorbereitung',
   '0.1.0-phase1-skeleton', '11111111-1111-1111-1111-111111111111'),

  ('cccccccc-0000-0000-0000-000000000002',
   'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001',
   'Anbau Carport Musterweg 7',
   'Musterweg 7', '85716', 'Unterschleissheim', '09184152', 'Unterschleissheim', 'Landkreis Muenchen', 'Bayern',
   'bauantrag', 'carport', 'wohnbaulich', 'GK1', false,
   'innenbereich_34', 'bauherr_alleineigentuemer',
   2.50, 2.80, 'gok_gewachsen',
   NULL, 35.00,
   'verfahrensfrei', 'Art. 57 Abs. 1 Nr. 1 lit. b BayBO', 'bauamt_gemeinde',
   'Bauamt Unterschleissheim', 'in_vorbereitung',
   '0.1.0-phase1-skeleton', '11111111-1111-1111-1111-111111111111'),

  ('cccccccc-0000-0000-0000-000000000003',
   'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001',
   'Sanierung MFH Beispielstrasse 4',
   'Beispielstrasse 4', '80331', 'Muenchen', '09162000', 'Muenchen', 'Stadt Muenchen', 'Bayern',
   'tekturantrag', 'sanierung_mfh', 'wohnbaulich', 'GK3', false,
   'bplan_qualifiziert_30_1', 'weg_sondereigentuemer',
   12.30, 16.80, 'gok_gewachsen',
   8, 720.00,
   'genehmigung', 'Art. 60 BayBO', 'bauamt_gemeinde',
   'Lokalbaukommission Muenchen', 'eingereicht',
   '0.1.0-phase1-skeleton', '11111111-1111-1111-1111-111111111111'),

  ('cccccccc-0000-0000-0000-000000000004',
   'aaaaaaaa-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000002',
   'Neubau Wohnanlage Nordstadt',
   'Nordring 22', '90419', 'Nuernberg', '09564000', 'Nuernberg', 'Stadt Nuernberg', 'Bayern',
   'bauantrag', 'neubau_mfh', 'wohnbaulich', 'GK4', false,
   'bplan_qualifiziert_30_1', 'juristische_person',
   16.80, 19.20, 'gok_gewachsen',
   24, 2400.00,
   'genehmigung', 'Art. 60 BayBO', 'bauaufsichtsbehoerde_kreisfreie_stadt',
   'Bauaufsichtsamt Nuernberg', 'in_vorbereitung',
   '0.1.0-phase1-skeleton', '33333333-3333-3333-3333-333333333333'),

  ('cccccccc-0000-0000-0000-000000000005',
   'aaaaaaaa-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000002',
   'Neubau Kita Sonderbau Erlangen',
   'Spielplatzweg 9', '91054', 'Erlangen', '09562000', 'Erlangen', 'Stadt Erlangen', 'Bayern',
   'bauantrag', 'sonderbau_kita', 'gewerblich', 'GK3', true,
   'bplan_qualifiziert_30_1', 'juristische_person',
   8.50, 11.20, 'gok_gewachsen',
   NULL, 850.00,
   'sonderbau', 'Art. 60 BayBO i.V.m. Art. 2 Abs. 4 Nr. 11 BayBO', 'bauaufsichtsbehoerde_kreisfreie_stadt',
   'Bauaufsichtsamt Erlangen', 'in_vorbereitung',
   '0.1.0-phase1-skeleton', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- Sample Bauherren for the 5 projects
-- ---------------------------------------------------------------------
INSERT INTO bauherren
  (id, project_id, person_type, name,
   adresse_strasse, adresse_plz, adresse_ort,
   email, eigentuemer_ist_bauherr, signature_status)
VALUES
  ('dddddddd-0000-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000001', 'natuerlich', 'Anna Beispiel',
   'Musterstrasse 12', '81675', 'Muenchen', 'anna@example-bauherr.de', true, 'ausstehend'),
  ('dddddddd-0000-0000-0000-000000000002',
   'cccccccc-0000-0000-0000-000000000002', 'natuerlich', 'Bertram Beispiel',
   'Musterweg 7', '85716', 'Unterschleissheim', 'bertram@example-bauherr.de', true, 'ausstehend'),
  ('dddddddd-0000-0000-0000-000000000003',
   'cccccccc-0000-0000-0000-000000000003', 'weg_sondereigentuemer',
   'WEG Beispielstrasse 4 vertreten durch Verwalter Mueller',
   'Beispielstrasse 4', '80331', 'Muenchen', 'verwalter@example-weg.de', false, 'ausstehend'),
  ('dddddddd-0000-0000-0000-000000000004',
   'cccccccc-0000-0000-0000-000000000004', 'juristisch', 'Beispiel Wohnen Nord GmbH',
   'Geschaeftsstrasse 8', '90402', 'Nuernberg', 'projekt@beispiel-wohnen.de', true, 'ausstehend'),
  ('dddddddd-0000-0000-0000-000000000005',
   'cccccccc-0000-0000-0000-000000000005', 'juristisch', 'Stadt Erlangen Eigenbetrieb Kita',
   'Rathausplatz 1', '91052', 'Erlangen', 'kita@erlangen.de', true, 'ausstehend')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- Sample required_documents for Bayern Neubau (project 1, vereinfacht)
-- ---------------------------------------------------------------------
INSERT INTO required_documents
  (id, project_id, document_type, name_de, lbo_reference, is_required, sourcing_type,
   sourcing_note, submission_track, status, sort_order)
VALUES
  (gen_random_uuid(), 'cccccccc-0000-0000-0000-000000000001', 'bauantragsformular',
   'Bauantragsformular (amtlicher Vordruck)',
   'Art. 64 Abs. 1 BayBO', true, 'strota_generated',
   'AcroForm-Fill aus aktueller Vorlage Oberste Baubehoerde', 'bauamt', 'ausstehend', 1),
  (gen_random_uuid(), 'cccccccc-0000-0000-0000-000000000001', 'lageplan_qualifiziert',
   'Lageplan qualifiziert',
   '§ 3 BauVorlV Bayern', true, 'external_specialist',
   'OebVI oder Vermessungsamt erforderlich. Massstab 1:500, Nordpfeil, Hoehenbezug. Turnaround 2-6 Wochen.',
   'bauamt', 'ausstehend', 2),
  (gen_random_uuid(), 'cccccccc-0000-0000-0000-000000000001', 'grundrisse',
   'Grundrisse aller Geschosse',
   '§ 5 BauVorlV Bayern', true, 'architect',
   'Massstab 1:100, alle Geschosse inkl. Keller- und Dachgeschoss', 'bauamt', 'ausstehend', 3),
  (gen_random_uuid(), 'cccccccc-0000-0000-0000-000000000001', 'schnitte',
   'Schnitte',
   '§ 5 BauVorlV Bayern', true, 'architect',
   'Mindestens 2 Schnitte, einer mit Bezug zum gewachsenen Gelaende', 'bauamt', 'ausstehend', 4),
  (gen_random_uuid(), 'cccccccc-0000-0000-0000-000000000001', 'ansichten',
   'Ansichten',
   '§ 5 BauVorlV Bayern', true, 'architect',
   'Alle Fassaden mit Bemassung', 'bauamt', 'ausstehend', 5),
  (gen_random_uuid(), 'cccccccc-0000-0000-0000-000000000001', 'baubeschreibung',
   'Baubeschreibung',
   '§§ 3-7 BauVorlV Bayern', true, 'strota_generated',
   'Automatische Generierung aus Projektdaten (Modul 2)', 'bauamt', 'ausstehend', 6),
  (gen_random_uuid(), 'cccccccc-0000-0000-0000-000000000001', 'flaechenberechnung',
   'Flaechenberechnung',
   'DIN 277:2021-08 + WoFlV', true, 'architect',
   'BGF/NRF/KF + Wohnflaeche', 'bauamt', 'ausstehend', 7),
  (gen_random_uuid(), 'cccccccc-0000-0000-0000-000000000001', 'abstandsflaechenplan',
   'Abstandsflaechenplan',
   'Art. 6 BayBO', true, 'architect',
   '0,4 H, mindestens 3 m', 'bauamt', 'ausstehend', 8),
  (gen_random_uuid(), 'cccccccc-0000-0000-0000-000000000001', 'geg_nachweis',
   'GEG-Nachweis',
   'GEG 2024 §§ 15ff., § 16', true, 'external_specialist',
   'Erforderlich bei Neubau. Durch § 88 GEG ausstellungsberechtigte Person.',
   'bauamt', 'ausstehend', 9),
  (gen_random_uuid(), 'cccccccc-0000-0000-0000-000000000001', 'stellplatznachweis',
   'Stellplatznachweis (KFZ + Fahrrad + E-Lade)',
   'Bayerische Stellplatzverordnung + Stellplatzsatzung Muenchen', true, 'architect',
   'KFZ + Fahrrad separat. E-Lade-Infrastruktur per GEIG.',
   'bauamt', 'ausstehend', 10),
  (gen_random_uuid(), 'cccccccc-0000-0000-0000-000000000001', 'baukostenberechnung',
   'Baukostenberechnung',
   'DIN 276:2018-12 KG 100-700', true, 'architect',
   'Grundlage fuer Baugebuehr-Bemessung in Bayern', 'bauamt', 'ausstehend', 11),
  (gen_random_uuid(), 'cccccccc-0000-0000-0000-000000000001', 'grundbuchauszug',
   'Grundbuchauszug',
   'Art. 64 Abs. 2 Nr. 1 BayBO', true, 'authority',
   'Eigentumsnachweis Bauherr. Maximal 3 Monate alt.', 'bauamt', 'ausstehend', 12);
