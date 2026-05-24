import type { Metadata } from 'next';
import { LegalPage } from '../../components/legal-page';

export const metadata: Metadata = {
  title: 'Cookie-Erklärung',
  description: 'Welche Cookies und vergleichbaren Technologien Strota einsetzt.',
  robots: { index: true, follow: true },
};

export default function CookiesPage(): JSX.Element {
  return (
    <LegalPage
      title="Cookie-Erklärung"
      subtitle="Welche Cookies und vergleichbaren Technologien wir einsetzen, und wie Sie Ihre Einwilligung jederzeit anpassen können."
      lastUpdated="2026-05-24"
    >
      <h2>Wie Sie Ihre Einwilligung anpassen</h2>
      <p>
        Der Cookie-Banner unten auf der Seite erscheint automatisch beim
        ersten Besuch und jährlich erneut. Sie können dort jederzeit Ihre
        Auswahl ändern oder allen nicht-notwendigen Cookies widersprechen.
      </p>

      <h2>Kategorien</h2>

      <h3>Notwendig (immer aktiv)</h3>
      <table>
        <thead>
          <tr><th>Name</th><th>Zweck</th><th>Speicherdauer</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>strota_access</code></td>
            <td>Authentifizierte Sitzung (JWT)</td>
            <td>15 Minuten</td>
          </tr>
          <tr>
            <td><code>strota_refresh</code></td>
            <td>Sitzungs-Verlängerung (Refresh-Token)</td>
            <td>30 Tage</td>
          </tr>
          <tr>
            <td><code>strota.cookie.consent.v1</code></td>
            <td>Speichert Ihre Cookie-Auswahl (LocalStorage)</td>
            <td>12 Monate</td>
          </tr>
        </tbody>
      </table>
      <p>
        Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO und § 25 Abs. 2
        Nr. 2 TTDSG (technisch erforderlich).
      </p>

      <h3>Funktional (opt-in)</h3>
      <p>
        Bequemlichkeits-Einstellungen wie Dark-Mode oder Dichte. Aktuell
        nur clientseitig im LocalStorage; kein externer Anbieter.
      </p>

      <h3>Analyse (opt-in)</h3>
      <p>
        PostHog self-hosted in unserer Hetzner-Infrastruktur. Erfasst
        anonyme Funnel-Statistik (Klick-Pfade, Verweildauer pro Surface).
        Kein Cross-Site-Tracking. Verarbeitung erfolgt vollständig in
        Deutschland.
      </p>

      <h3>Marketing (opt-in)</h3>
      <p>Aktuell nicht aktiv. Sobald Marketing-Pixel eingesetzt werden, listen wir sie hier vollständig auf.</p>

      <h2 id="dsr">Ihre Rechte</h2>
      <p>
        Sie können Ihre Einwilligung jederzeit über den Cookie-Banner
        widerrufen. Bestehende Sitzungs-Cookies werden nicht
        zurückgesetzt; melden Sie sich ab, um auch diese zu löschen.
      </p>
      <p>
        Detaillierter Workflow für alle Betroffenenrechte (Auskunft,
        Berichtigung, Löschung, Portabilität, Widerspruch) im internen
        Dokument <a href="/datenschutz">Datenschutzerklärung</a>.
      </p>
    </LegalPage>
  );
}
