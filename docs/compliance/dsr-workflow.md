# Data Subject Rights Workflow (Art. 15-21 DSGVO)

Living document. Pflicht-Review jaehrlich oder bei UI-Aenderung des Self-Service-Exports.

**Stand**: 2026-05-24
**Frist**: 1 Monat ab Eingang (Art. 12 Abs. 3 DSGVO; verlaengerbar um 2 Monate)
**Kontakt**: betroffenenrechte@strota.de (Phase 2)

## Wer ist Verantwortlicher fuer welche Daten?

- **Architekt-Stammdaten** (Strota-Login, Org-Settings, Kammer-Eintragungen): Strota ist Verantwortlicher.
- **Bauherr- + Eigentuemer- + Nachbar-Daten innerhalb eines Projekts**: das Architekturbuero ist Verantwortlicher; Strota ist Auftragsverarbeiter (Art. 28 DSGVO, AVV).

DSR-Anfragen zu Architekt-Daten beantwortet Strota direkt. DSR-Anfragen zu Bauherr-Daten leitet Strota an das Architekturbuero weiter und unterstuetzt nach AVV §6.

## Recht-spezifischer Workflow

### Art. 15 - Auskunft

| Schritt | Owner | SLA |
|---------|-------|-----|
| Anfrage eingegangen | Customer Success | T+0 |
| Identitaet pruefen (Auth-Cookie + 6-stellige Email-Bestaetigung) | Customer Success | <= 3 Werktage |
| Export generieren (ZIP mit Stammdaten + Projekte + Audit-Log-Auszug + alle Token-Eintraege) | Eng (CLI-Skript `scripts/dsr_export.py`, Phase 16) | <= 14 Werktage |
| Ausgabe verschluesselt (passwort + separate Channel-Uebermittlung) | Customer Success | <= 28 Tage Gesamtfrist |

Architekten haben ausserdem **Self-Service-Export** unter `/app/einstellungen/datenexport` (Phase 19), der dieselbe ZIP-Struktur produziert.

### Art. 16 - Berichtigung

- Self-Service via `/app/einstellungen` (Profil) und `/app/projekte/[id]/bauherr` (fuer Bauherrendaten als Architekt)
- Bei technisch nicht moeglich: Support-Ticket-Workflow via Chatwoot (Phase 16)
- Frist: 1 Monat

### Art. 17 - Loeschung

- Self-Service Soft-Delete: Account-Loeschen-Button unter `/app/einstellungen/konto`. Setzt `users.deleted_at = now()`; Cascade-Soft-Delete auf Projekte des Org-Owners
- Hard-Delete nach 10 Jahren (HOAI §14 + AO §147 + HGB §257) via `enforce_10y_retention()` Cron (db/migrations/003_triggers_lifecycle.sql)
- Bauherr-Loeschung initiiert das Architekturbuero; Strota fuehrt aus
- Sonderfall: Wenn ein Bauherr direkt Loeschung verlangt obwohl der Architekt-Vertrag noch laeuft - Architekt wird informiert und entscheidet (er ist Verantwortlicher); Strota loescht nicht autonom

### Art. 18 - Einschraenkung der Verarbeitung

- Internes Flag pro Datensatz (`processing_restricted_at timestamptz`, NULL bei normal) - Phase 17 hinzufuegen
- Schreibsperre via RLS-Policy-Variante fuer eingeschraenkte Datensaetze
- Reverse via Customer-Success-Workflow

### Art. 20 - Datenuebertragbarkeit

- JSON-Export aller maschinenlesbaren Daten via Self-Service oder DSR-CLI-Skript
- Format: dokumentiert in `/docs/compliance/dsr-export-schema.md` (Phase 16)
- Beinhaltet: users, users_kammer_eintragungen, projects, bauherren (als Architekt-Verantwortlicher), files-Metadata + signierte URLs (24 h gueltig)

### Art. 21 - Widerspruch

| Widerspruch gegen ... | Reaktion | Wirkung |
|-----------------------|----------|---------|
| Newsletter | Sofort-Unsubscribe (One-Click + Backend) | Postmark-Suppression aktualisiert binnen Sekunden |
| PostHog-Analytics | Cookie-Banner -> Marketing-Kategorie abwaehlen | wirkt sofort fuer alle naechsten Sessions |
| Verarbeitung im Rahmen von Vertragserfuellung (V1, V5) | Hinweis auf Vertrags- und Aufbewahrungspflicht; keine Loeschung waehrend Vertrag + Aufbewahrung | Erlaeuterung schriftlich binnen 1 Monat |

## Self-Service vs. Manuell

| Recht | Self-Service-UI | Manuelle Bearbeitung |
|-------|----------------|---------------------|
| Art. 15 | ja (Phase 19+ /einstellungen/datenexport) | Phase 1-18: CLI-Skript + Anfrage per E-Mail |
| Art. 16 | ja (Profil-Edit) | bei technisch unmoeglich |
| Art. 17 | ja (Account-Delete) | manuell falls aktive Vertraege |
| Art. 18 | nein (Phase 17+ geplant) | ja |
| Art. 20 | ja (selbe UI wie Art. 15) | CLI-Skript |
| Art. 21 | Newsletter ja; PostHog via Cookie-Banner; Vertragserfuellung manuell | manuell |

## DSR-Audit

Jede DSR-Anfrage und Beantwortung wird im audit_log mit `action='dsr.processed'` und `entity_type='auth.users'` festgehalten - mit Hash-Chain wie alle Audit-Eintraege.

## Aenderungsprotokoll

| Datum | Aenderung | Autor |
|-------|-----------|-------|
| 2026-05-24 | Erstanlage (v1.0) | Customer Success + Legal |
