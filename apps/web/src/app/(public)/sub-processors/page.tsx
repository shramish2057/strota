import type { Metadata } from 'next';
import { LegalPage } from '../../../components/legal-page';

export const metadata: Metadata = {
  title: 'Sub-Processor-Liste',
  description:
    'Liste der von Strota eingesetzten Sub-Auftragsverarbeiter gemäß Art. 28 DSGVO. 30-Tage-Änderungsanzeige mit Widerspruchsrecht.',
  robots: { index: true, follow: true },
};

const ROWS = [
  ['Hetzner Online GmbH', 'Compute, Object Storage, Private Network', 'DE (NUE + FAL) + FI (HEL Backup)', 'signed'],
  ['Cloudflare Inc.', 'DDoS, WAF, Tunnel, CDN', 'global mit EU-Terminierung', 'signed + SCC'],
  ['Vercel Inc.', 'Edge Functions, Web-Hosting', 'EU-Frankfurt', 'signed'],
  ['AWS (Amazon Web Services)', 'Bedrock-Hosting für Anthropic', 'eu-central-1 Frankfurt', 'signed (AWS DPA + SCC)'],
  ['Anthropic PBC', 'Claude AI (via Bedrock pass-through)', 'EU-Frankfurt', 'signed + KI-Trainings-Ausschluss'],
  ['Postmark', 'Transactional Email', 'EU', 'signed'],
  ['Stripe Payments Europe Ltd.', 'Payment processing', 'EU entity', 'signed + SCC'],
  ['Sentry (self-hosted)', 'Error tracking', 'DE (Hetzner)', 'n/a (self-hosted)'],
  ['PostHog (self-hosted)', 'Product analytics (consent-gated)', 'DE (Hetzner)', 'n/a (self-hosted)'],
  ['HashiCorp Vault (self-hosted)', 'Secrets management', 'DE (Hetzner)', 'n/a (self-hosted)'],
  ['Consentmanager.net oder Usercentrics', 'Cookie consent management (Phase 2+ Auswahl)', 'DE', 'signed'],
  ['D-Trust GmbH (Bundesdruckerei)', 'qeS Signatur Primary', 'DE', 'signed'],
  ['Bundesdruckerei', 'qeS Signatur Failover', 'DE', 'signed'],
  ['A-Trust', 'AT Handysignatur / ID Austria (Phase 26+)', 'AT', 'signed'],
  ['SwissSign', 'CH SuisseID / SwissID (Phase 27+)', 'CH', 'signed'],
  ['BKG Bundesamt für Kartographie', 'Adresse-zu-AGS-Code', 'DE (federal)', 'Nutzungsbedingungen'],
  ['Better Uptime', 'Uptime monitoring + status page', 'EU', 'signed'],
  ['Chatwoot (self-hosted)', 'Customer Support', 'DE (Hetzner)', 'n/a (self-hosted)'],
  ['Intigriti EU oder YesWeHack EU', 'Bug-Bounty (Phase 25+)', 'EU', 'signed'],
  ['PagerDuty', 'Incident Alerting', 'EU', 'signed'],
  ['DATEV / Lexware', 'Steuerberater-Export-Format', 'DE', 'Nutzungsbedingungen'],
];

export default function SubProcessorsPage(): JSX.Element {
  return (
    <LegalPage
      title="Sub-Processor-Liste"
      subtitle="Sub-Auftragsverarbeiter nach Art. 28 DSGVO. Wir kündigen Änderungen 30 Tage im Voraus an; Sie haben ein Widerspruchsrecht."
      lastUpdated="2026-05-24"
    >
      <p>
        Die nachfolgende Liste ist die verbindliche Anlage 1 zu unserem
        <a href="/avv"> Auftragsverarbeitungsvertrag</a>. Änderungen
        werden hier veröffentlicht und Bestandskunden parallel per E-Mail
        mitgeteilt (30-Tage-Frist nach Art. 28 Abs. 2 DSGVO).
      </p>

      <table>
        <thead>
          <tr>
            <th>Sub-Processor</th>
            <th>Zweck</th>
            <th>Region</th>
            <th>DPA-Status</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([name, purpose, region, dpa]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{purpose}</td>
              <td>{region}</td>
              <td>{dpa}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Widerspruchsrecht</h2>
      <p>
        Sie können binnen 30 Tagen ab Bekanntgabe einer Änderung
        widersprechen. Schreiben Sie an{' '}
        <a href="mailto:datenschutz@strota.de">datenschutz@strota.de</a>{' '}
        mit Betreff &quot;Sub-Processor-Widerspruch&quot;. Wir prüfen Alternativen
        oder bieten ggf. eine außerordentliche Kündigung an.
      </p>

      <h2>Trainings-Ausschluss</h2>
      <p>
        Anthropic und alle anderen Sub-Processor verarbeiten Ihre Daten
        ausschließlich zur Erbringung des Dienstes. KI-Training (auch
        Re-Training oder Fine-Tuning) mit unseren Kunden-Daten ist
        vertraglich ausgeschlossen, siehe AVV § 6 sowie das
        Anthropic-Bedrock-Vertrags-Addendum.
      </p>
    </LegalPage>
  );
}
