# TOMs - Technische und organisatorische Massnahmen (Art. 32 DSGVO)

Living document. Jaehrliche Pflicht-Review. Im AVV § 7 referenziert. Auszuege oeffentlich unter `strota.de/toms`.

**Stand**: 2026-05-24

## Pseudonymisierung / Verschluesselung (Art. 32 Abs. 1 lit. a)

- **In transit**: TLS 1.3+ ueberall. Cloudflare terminiert public TLS; mTLS Cloudflare-zu-Hetzner (ADR-0002). FastAPI-zu-Postgres ueber Loopback (kein Netzwerk-Egress, kein TLS-Overhead noetig).
- **At rest**: AES-256 (Hetzner Object Storage Default; CMK optional fuer Enterprise). Postgres-Volume auf Hetzner verschluesselt.
- **Pseudonymisierung**: IP-Adressen werden vor Speicherung mit taeglich rotierendem Salt SHA-256-gehasht (Erw.-Grund 26). Email-Klartext nur im Auth-Stack; alle Token sind sha256(plaintext) at rest.
- **Passwoerter**: argon2id mit OWASP-2025-Baseline (time_cost=2, memory=19 MiB, parallelism=1). needs_rehash-Check bei jedem Login fuer automatisches Upgrade alter Hashes.

## Vertraulichkeit (Art. 32 Abs. 1 lit. b, Abs. 2)

| TOM | Massnahme |
|-----|-----------|
| TOM-1 Zutrittskontrolle | Hetzner DCs Nuremberg + Falkenstein + Helsinki sind ISO-27001-zertifiziert. Kein eigener physischer Zugang Strota-Mitarbeiter |
| TOM-2 Zugangskontrolle | MFA-Pflicht alle Strota-Mitarbeiter (GitHub, Vault, Cloud-Provider). SSO via internem IdP ab Phase 16. Vault-managed Secrets. Quarterly Access-Reviews. Least-Privilege als Default |
| TOM-3 Zugriffskontrolle | Postgres Row-Level Security auf jeder Tabelle (db/migrations/002_rls_policies.sql). auth.uid() = request.jwt.claim.sub per-Connection. Org-Tenant-Isolation. Audit-Log jeder priviligierten PII-Lesung |
| TOM-4 Weitergabekontrolle | TLS 1.3+ extern; mTLS inter-service (ADR-0002); HMAC-SHA256 mit 60s-Skew + Replay-Nonce (ADR-0035) |

## Integritaet (Art. 32 Abs. 1 lit. b)

| TOM | Massnahme |
|-----|-----------|
| TOM-5 Eingabekontrolle | Audit-Log jeder schreibenden Operation mit Hash-Chain (sequence_no + pg_advisory_xact_lock race-safe). Tamper-Detection via verify_audit_chain(); taegliches Cron |
| TOM-6 Auftragskontrolle | Sub-Processor-Liste public (strota.de/sub-processors). Jaehrliche AVV-Reviews. 30-Tage-Sub-Processor-Aenderungs-Notification mit Widerspruchsrecht (Art. 28 Abs. 2). Keine Verarbeitung ohne AVV |

## Verfuegbarkeit (Art. 32 Abs. 1 lit. b)

| TOM | Massnahme |
|-----|-----------|
| TOM-7 Verfuegbarkeitskontrolle | Hourly pgbackrest snapshots + weekly cross-region (Helsinki). PITR 30-Tage-Window. Semi-annual DR-Drill (RTO 4 h, RPO 24 h - dokumentiert in docs/ops/dr-drill-template.md). Better-Uptime + public status.strota.de |

## Trennung (Art. 32 Abs. 1 lit. b)

| TOM | Massnahme |
|-----|-----------|
| TOM-8 Trennungskontrolle | Org-Tenant-Isolation via RLS auf jeder Tabelle. Getrennte Buckets pro Mandant (Enterprise-Tier). Separate Encryption-Keys auf Anfrage (Enterprise) |

## Organisatorische Massnahmen (Art. 32 Abs. 4, Berufsordnung)

- Vertraulichkeitsverpflichtung jedes Strota-Mitarbeiters bei Onboarding (NDA + Berufsordnungs-Bezugnahme).
- Quarterly Security-Schulung (Phishing-Drill, Secret-Hygiene, DSGVO-Refresher).
- Pen-Test jaehrlich (TUEV-zertifiziertes Firma; € 5-8k Budget).
- Bug-Bounty-Program ab Phase 25 (Intigriti EU oder YesWeHack EU).
- ISO 27001 + 27701 Gap-Analyse Phase 25; Zertifizierung Year 3.
- SOC 2 Type II Beobachtungszeitraum ab Phase 25.

## TOM-Mapping zu ROPA-Verarbeitungstaetigkeiten

Siehe ropa.md - jede V-Nr. referenziert die einschlaegigen TOMs.

## Aenderungsprotokoll

| Datum | Aenderung | Autor |
|-------|-----------|-------|
| 2026-05-24 | Erstanlage (v1.0) | Eng-Lead |
