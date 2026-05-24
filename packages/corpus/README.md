# @strota/corpus

Regulatorischer Korpus für Strota. Phase-1-Skeleton der Verzeichnisstruktur. Inhalte folgen mit Phase 4 (Bayern), Phase 18 (NRW + BW) etc.

## Struktur (v5.0 §3.6)

```
data/
  bundeslaender/[land]/
    metadata.json                       Version, Stand, Quelle, Lizenz
    verfahrensart_rules.json            Modul 0 Determination (10 Werte v5.0)
    verfahrensfreie_vorhaben_rules.json Public Genehmigungsfrei-Prüfer
    lbo.json                            LBO Schlüssel-Sektionen
    bauvorlv.json                       BauVorlV / BauPrüfVO / LBOVVO
    bauvorlv_sections.json              Section-Catalog für Modul 2
    sonderbau_katalog.json              Pro-Land Sonderbau-Katalog
    sonderbauvo/                        VStättVO, VkV, KhBauV, BetrVO, GarStellV
    requirement_matrix.json
    special_conditions.json
    pruefpflicht_statik.json
    brandschutz_ersteller.json          Pro-Land Ersteller-Berechtigung
    pruefer_matrix.json
    abstandsflaechen.json
    vollgeschoss_definition.json        Pro-Land (kritisch für GFZ-Rechner)
    baugebuehren_formel.json            Pro-Land (BayKG / BauGebO NRW / etc.)
    baulastenauskunft_kosten.json
    stellplatz_defaults.json
    kinderspielplatz_rules.json
    bauamt_directory.json
    fiktion_rules.json
    geltungsdauer_baugenehmigung.json   Pro-Land Erlöschen-Frist (4y BY, 3y NRW+BW)
    vorverfahren_status.json
    frist_verlaengerung_zulaessig.json
    bvb_klein_zulaessig.json
    score_weights.json                  Per-Verfahrensart Score-Gewichte
    bplan_wirksamkeitsbedenken.json
    bplan_regional_conventions.json
    nutzungsaenderung_rules.json
    bauamt_papier_konventionen.json
    geg_ausstellungsberechtigt.json
    form_templates/                     Amtliche Bauantragsformulare PDF + field_mapping
  gemeinden/[AGS_8digit]/
    special_conditions.json
    stellplatzsatzung.json
    stellplatzabloese_saetze.json
    bplan_index.json
    bplan_pdfs/                         Mit lizenz_status flag
    efa_portal.json
    anschlussbeitraege_kag.json
  federal/                              Bundesweit identische Normen
  terminology/[bundesland]/             PSV vs. Prüfingenieur vs. Sachverständiger
  feiertage/[bundesland].json           Feiertags-Kalender (jährlich gepflegt)
  kammerlisten/[bundesland]/            Architekten, Ingenieure, Sachverständige Brandschutz
  oebvi/[landkreis].json                ÖbVI-Listen pro Landkreis
  behoerden_idp/[bundesland].json       BayernID, ELSTER, BundID OIDC Endpoints
  cad_test_exports/                     Revit/Allplan/ArchiCAD/Vectorworks/AutoCAD PDFs
  test_cases/[bundesland]/              ≥150 fixtures (Bayern); ≥50 (NRW/BW)
```

## Datei-Pflichtfelder

Jeder Korpus-Eintrag trägt:

```json
{
  "quelle_url": "...",
  "quelle_typ": "gesetzesblatt|behoerden_webseite|kammer_publikation|expert_attestation",
  "effective_from": "YYYY-MM-DD",
  "effective_until": "YYYY-MM-DD or null",
  "last_verified_at": "ISO timestamp",
  "kuratiert_durch": "Name oder Team",
  "lizenz_status": "public_domain|gemeinde_freigabe|verweis_nur|unklar"
}
```

`lizenz_status: unklar` blockiert Ingest bis Klärung.

## Konflikt-Auflösung

Bei Widersprüchen (Kommentar vs. Wortlaut vs. Behörden-Praxis) entscheidet der Domain-Lead per ADR. Beide Positionen werden im Eintrag dokumentiert.

## Tests

`packages/corpus/data/test_cases/[land]/`:
- Concrete fixtures pro Verfahrensart × GK × Sonderbau × Eigentumssituation.
- Property-based generators (Hypothesis-Stil, Phase 4+).
- Historische anonymisierte Bauanträge (NDA-geschützt, lokal nur im NDA-Bucket; siehe Phase 4.5).

CI-Test: `pnpm run test:corpus:[land]`. Regressionen blockieren Deployment.
