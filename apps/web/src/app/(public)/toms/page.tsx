import type { Metadata } from 'next';
import { LegalPage } from '../../../components/legal-page';

export const metadata: Metadata = {
  title: 'Technische und organisatorische Maßnahmen',
  description:
    'Auszug aus den TOMs (Art. 32 DSGVO). Wie Strota Verschlüsselung, Zugriffskontrolle, Audit-Trails und Wiederherstellung umsetzt.',
  robots: { index: true, follow: true },
};

export default function TomsPage(): JSX.Element {
  return (
    <LegalPage
      title="Technische und organisatorische Maßnahmen (Auszug)"
      subtitle="Diese Seite zeigt Auszüge unserer vollständigen TOMs nach Art. 32 DSGVO. Die vollständigen TOMs werden im AVV § 7 referenziert und auf Anfrage als Anlage zur Verfügung gestellt."
      lastUpdated="2026-05-24"
    >
      <h2>Verschlüsselung</h2>
      <ul>
        <li>In transit: TLS 1.3+ überall. mTLS zwischen Cloudflare-Tunnel und unserem Backend (siehe ADR-0002).</li>
        <li>At rest: AES-256 für Object Storage. Postgres-Volume verschlüsselt.</li>
        <li>Passwörter: argon2id mit OWASP-2025-Baseline (time_cost=2, memory=19 MiB).</li>
        <li>Token at rest: SHA-256 (Refresh-Token, Magic-Link, Password-Reset). Plaintext nur im Email-Body, nie geloggt.</li>
      </ul>

      <h2>Vertraulichkeit</h2>
      <ul>
        <li>Datacenter: Hetzner DCs Nürnberg + Falkenstein + Helsinki (ISO 27001 zertifiziert).</li>
        <li>MFA-Pflicht für alle Strota-Mitarbeiter.</li>
        <li>Postgres Row-Level Security auf jeder Tabelle. Tenant-Isolation per Org.</li>
        <li>Berufsgeheimnis-Klasse für Bauherrendaten: Vier-Augen-Prinzip + Ticket + Audit-Log bei jeder privilegierten Lesung.</li>
      </ul>

      <h2>Integrität</h2>
      <ul>
        <li>Audit-Log mit race-safe Hash-Chain auf Postgres-Ebene (pg_advisory_xact_lock + monotonic sequence_no).</li>
        <li>Tägliches verify_audit_chain Cron zur Tamper-Detection.</li>
        <li>qeS-Signaturen mit PAdES-LTV für 10-Jahres-Archivierung. TSA (RFC 3161) per D-Trust.</li>
      </ul>

      <h2>Verfügbarkeit</h2>
      <ul>
        <li>Hourly pgbackrest snapshots, weekly cross-region zur Helsinki-Region.</li>
        <li>PITR 30-Tage-Window.</li>
        <li>Semi-annual Disaster-Recovery Drills (RTO 4h, RPO 24h).</li>
        <li>Status-Page status.strota.de mit Subscribable-Email-Alerts.</li>
      </ul>

      <h2>Auftragskontrolle</h2>
      <ul>
        <li>Aktuelle Sub-Processor-Liste unter <a href="/sub-processors">strota.de/sub-processors</a>.</li>
        <li>30-Tage-Änderungsanzeige mit Widerspruchsrecht.</li>
        <li>AVV mit jedem Sub-Processor signiert; Standardvertragsklauseln wo nötig.</li>
        <li>Expliziter Trainings-Ausschluss in AVV § 6 (auch durchgereicht in Anthropic-Bedrock-DPA).</li>
      </ul>

      <h2>Sicherheits-Audit</h2>
      <ul>
        <li>Jährlicher Pen-Test durch TÜV-zertifiziertes Firma (ab Phase 25).</li>
        <li>Bug-Bounty-Program (ab Phase 25, Intigriti EU oder YesWeHack EU).</li>
        <li>ISO 27001 + 27701 Zertifizierung Roadmap (Year 3).</li>
        <li>SOC 2 Type II Beobachtungszeitraum ab Phase 25.</li>
        <li>BSI C5 Type-2 für Strota Kommune.</li>
      </ul>
    </LegalPage>
  );
}
