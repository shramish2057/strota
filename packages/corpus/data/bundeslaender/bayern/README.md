# Korpus Bayern

Phase-1-Skeleton. Inhalte werden in Phase 4 (Bayern Foundation) gefüllt.

## Geplante Dateien (siehe `metadata.json` für vollständige Liste)

- `verfahrensart_rules.json` - Modul 0 Determinations-Logik (10 Verfahrensarten v5.0).
- `verfahrensfreie_vorhaben_rules.json` - Public Genehmigungsfrei-Prüfer Regeln.
- `lbo.json` - BayBO Schlüssel-Sektionen strukturiert.
- `bauvorlv.json` - Bauvorlagenverordnung Bayern.
- `bauvorlv_sections.json` - Section-Catalog für Modul 2 Baubeschreibungs-Generator.
- `sonderbau_katalog.json` - Art. 2 Abs. 4 BayBO Nrn. 1-20.
- `sonderbauvo/` - VStättVO, VkV, KhBauV, BetrVO, GarStellV, MIndustrieBauR.
- `pruefpflicht_statik.json` - GK-Schwellen Bayern (ab GK3 Prüfung Art. 62 BayBO).
- `vollgeschoss_definition.json` - Art. 2 Abs. 5 BayBO (kritisch für GFZ-Rechner).
- `baugebuehren_formel.json` - BayKG + Bauaufsichtsgebührenverordnung.
- `geltungsdauer_baugenehmigung.json` - Art. 69 BayBO 4-Jahres-Frist.
- `bauamt_directory.json` - AGS → Bauamt für alle 2.056 bayerischen Gemeinden.
- Weitere siehe `metadata.json`.

## Quellen

- gesetze-bayern.de (BayBO, BauVorlV).
- Veröffentlichungen Bayerische Staatsregierung.
- Bayerische Architektenkammer (Listen-Daten).
- Bauamt-Verzeichnis: kommunal.de + LRA-Websites.

## Lizenz-Status

`lizenz_status`-Feld pro Eintrag erforderlich:
- `public_domain` - amtliches Werk § 5 UrhG (Gesetze, Verordnungen).
- `gemeinde_freigabe` - Gemeinde hat schriftlich freigegeben.
- `verweis_nur` - nicht hosten, nur auf Original verlinken.
- `unklar` - blockiert Ingest bis geklärt.

## Tests

`packages/corpus/data/test_cases/bayern/` enthält:
- ≥150 fixture cases (concrete).
- Property-based generators (Hypothesis-Stil, ab Phase 4).
- ≥200 historische anonymisierte Anträge (NDA-geschützt, nicht im Repo - siehe Phase 4.5).
