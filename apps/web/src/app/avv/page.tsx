import type { Metadata } from 'next';
import { LegalPage } from '../../components/legal-page';

export const metadata: Metadata = {
  title: 'AVV-Vorlage (Art. 28 DSGVO)',
  description:
    'Auftragsverarbeitungsvertrag-Vorlage zur Einsicht. Wird bei jedem ersten kostenpflichtigen Vertragsschluss signiert.',
  robots: { index: true, follow: true },
};

export default function AvvPage(): JSX.Element {
  return (
    <LegalPage
      title="Auftragsverarbeitungsvertrag (AVV)"
      subtitle="Vorlage gemäß Art. 28 DSGVO. Wird bei jedem ersten kostenpflichtigen Vertragsschluss zwischen dem Architekturbüro (Verantwortlicher) und Strota (Auftragsverarbeiter) signiert."
      lastUpdated="2026-05-24"
    >
      <p className="text-sm italic">
        Diese Seite zeigt die Vorlage zur Vorab-Einsicht. Verbindlich ist
        die signierte Fassung, die Sie bei Vertragsabschluss erhalten und
        in Ihrem Konto unter Einstellungen / Verträge wiederfinden.
        Die Vorlage wird in Phase 2 anwaltlich finalisiert (Budget €
        800-1.500).
      </p>

      <h2>Wer signiert?</h2>
      <p>
        <strong>Verantwortlicher</strong>: das Architekturbüro
        (Bauträger, Planungsbüro etc.).
        <br />
        <strong>Auftragsverarbeiter</strong>: Strota.
        <br />
        Der <strong>Bauherr</strong> ist die betroffene Person, kein
        Vertragspartner dieses AVV. Die Information des Bauherrn nach
        Art. 13 DSGVO erfolgt über den Bauherr-Guest-Link-Onboarding-Flow.
      </p>

      <h2>Zwölf Paragraphen im Überblick</h2>
      <ol>
        <li>Gegenstand und Dauer des Auftrags</li>
        <li>Art und Zweck der Verarbeitung</li>
        <li>Art der personenbezogenen Daten</li>
        <li>Kategorien betroffener Personen</li>
        <li>Pflichten und Rechte des Verantwortlichen</li>
        <li>Pflichten des Auftragsverarbeiters (inkl. KI-Trainings-Ausschluss)</li>
        <li>Technische und organisatorische Maßnahmen, referenziert auf <a href="/toms">strota.de/toms</a></li>
        <li>Unterauftragsverarbeiter, mit Anlage 1 als <a href="/sub-processors">Sub-Processor-Liste</a></li>
        <li>Rechte der Betroffenen</li>
        <li>Kontrollrechte des Verantwortlichen</li>
        <li>Datenrückgabe und Löschung bei Vertragsende</li>
        <li>Haftung und Versicherung (Mindestdeckung € 5 Mio.)</li>
      </ol>

      <h2>Volltext der Vorlage</h2>
      <p>
        Den Volltext der aktuellen Vorlage finden Sie als{' '}
        <a href="https://github.com/shramish2057/strota/blob/main/docs/legal/avv-template-de.md" target="_blank" rel="noopener noreferrer">
          Markdown-Datei im öffentlichen Repository
        </a>
        . Wir bevorzugen die signierte PDF-Fassung, die Sie über das
        Onboarding erhalten.
      </p>

      <h2>Wesentliche Zusicherungen</h2>
      <ul>
        <li>Kein KI-Training mit Ihren Daten.</li>
        <li>Berufsgeheimnis-Klasse für Bauherrendaten: Vier-Augen-Prinzip + Ticket + Audit-Log.</li>
        <li>Datenresidenz EU; Sub-Processor mit EU-Region oder Standardvertragsklauseln.</li>
        <li>30-Tage-Sub-Processor-Änderungsanzeige mit Widerspruchsrecht.</li>
        <li>72-Stunden-Meldung bei Verletzung des Schutzes personenbezogener Daten.</li>
        <li>Vollständige Datenrückgabe bei Vertragsende als ZIP innerhalb 30 Tagen.</li>
        <li>Berufshaftpflicht-/Cyber-Versicherung mit Mindestdeckung € 5 Mio.</li>
      </ul>
    </LegalPage>
  );
}
