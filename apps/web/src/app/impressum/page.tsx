import type { Metadata } from 'next';
import { LegalPage } from '../../components/legal-page';

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Anbieterkennzeichnung gemäß § 5 TMG.',
  robots: { index: true, follow: true },
};

export default function ImpressumPage(): JSX.Element {
  return (
    <LegalPage
      title="Impressum"
      subtitle="Anbieterkennzeichnung gemäß § 5 TMG."
      lastUpdated="2026-05-24"
    >
      <h2>Anbieter</h2>
      <p>
        Strota (in Gründung)
        <br />
        Anschrift folgt mit Eintragung der GmbH
        <br />
        Deutschland
      </p>

      <h2>Kontakt</h2>
      <p>
        Email: <a href="mailto:hallo@strota.de">hallo@strota.de</a>
        <br />
        Datenschutz: <a href="mailto:datenschutz@strota.de">datenschutz@strota.de</a>
        <br />
        Sicherheits-Disclosure: <a href="mailto:security@strota.de">security@strota.de</a>
        <br />
        Betroffenenrechte: <a href="mailto:betroffenenrechte@strota.de">betroffenenrechte@strota.de</a>
      </p>

      <h2>Vertretungsberechtigt</h2>
      <p>
        Vertretungsberechtigter Gründer (Eintragung GmbH-Register folgt
        mit Phase 14).
      </p>

      <h2>Umsatzsteuer-Identifikationsnummer</h2>
      <p>USt-IdNr. wird nach Steuer-Registrierung ergänzt.</p>

      <h2>Berufshaftpflicht / Cyber-Versicherung</h2>
      <p>
        Mindestdeckung € 5 Mio. für Vermögensschäden und € 5 Mio. für
        Personen-/Sach-Schäden. Erhöhte Deckung € 10 Mio. für
        Strota-Kommune-Verträge (Phase 30+). Versicherungsnachweis auf
        Anfrage.
      </p>

      <h2>Streitschlichtung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur
        Online-Streitbeilegung (OS) bereit:{' '}
        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
          https://ec.europa.eu/consumers/odr/
        </a>
        . Wir sind nicht bereit oder verpflichtet, an
        Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
        teilzunehmen.
      </p>

      <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
      <p>Strota Gründungsteam, Anschrift wie oben.</p>

      <h2>Haftungsausschluss</h2>
      <h3>Haftung für Inhalte</h3>
      <p>
        Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt.
        Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
        können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter
        sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen
        Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8
        bis 10 TMG sind wir als Diensteanbieter jedoch nicht
        verpflichtet, übermittelte oder gespeicherte fremde Informationen
        zu überwachen oder nach Umständen zu forschen, die auf eine
        rechtswidrige Tätigkeit hinweisen.
      </p>
      <h3>Haftung für Links</h3>
      <p>
        Unser Angebot enthält Links zu externen Webseiten Dritter, auf
        deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
        diese fremden Inhalte auch keine Gewähr übernehmen.
      </p>
      <h3>Urheberrecht</h3>
      <p>
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
        diesen Seiten unterliegen dem deutschen Urheberrecht.
        Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
        Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der
        schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
      </p>

      <p className="text-xs text-neutral-500">
        Dieses Impressum gilt auch für die Strota-Profile auf folgenden
        Plattformen (sofern aktiv): LinkedIn, GitHub
        (github.com/shramish2057/strota), X.
      </p>
    </LegalPage>
  );
}
