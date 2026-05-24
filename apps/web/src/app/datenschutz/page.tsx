import type { Metadata } from 'next';
import { LegalPage } from '../../components/legal-page';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description:
    'Datenschutzerklärung gemäß Art. 13/14 DSGVO. Welche personenbezogenen Daten Strota verarbeitet, auf welcher Rechtsgrundlage und welche Rechte Sie als Betroffener haben.',
  robots: { index: true, follow: true },
};

export default function DatenschutzPage(): JSX.Element {
  return (
    <LegalPage
      title="Datenschutzerklärung"
      subtitle="Information gemäß Art. 13/14 DSGVO."
      lastUpdated="2026-05-24"
    >
      <p className="text-sm italic">
        Hinweis: Diese Datenschutzerklärung wird anwaltlich finalisiert
        (Phase 2 Budget € 1.000-1.500). Die folgende Fassung dokumentiert
        unseren aktuellen Stand zur internen Abstimmung und gibt einen
        Überblick über die Verarbeitungen. Maßgeblich ist die anwaltlich
        finalisierte Fassung sobald diese vorliegt.
      </p>

      <h2>1. Verantwortlicher</h2>
      <p>
        Strota (in Gründung), vertreten durch den Gründer.
        <br />
        Kontakt: <a href="mailto:hallo@strota.de">hallo@strota.de</a>
        <br />
        Datenschutz: <a href="mailto:datenschutz@strota.de">datenschutz@strota.de</a>
      </p>

      <h2>2. Datenschutzbeauftragter</h2>
      <p>
        Externer Datenschutzbeauftragter wird mit Phase-2-Vertragsabschluss
        benannt; Kontakt dann via datenschutz@strota.de.
      </p>

      <h2>3. Welche Daten wir verarbeiten</h2>
      <p>
        Eine vollständige Übersicht aller Verarbeitungstätigkeiten finden
        Sie in unserem Verzeichnis der Verarbeitungstätigkeiten (Art. 30
        DSGVO). Die wichtigsten Verarbeitungen:
      </p>
      <h3>Bauantragsverwaltung (Kernfunktion)</h3>
      <ul>
        <li>Bauherr-Stammdaten (Name, Adresse, ggf. Geburtsdatum)</li>
        <li>Eigentümer-Daten (wenn ≠ Bauherr)</li>
        <li>Projekt-Adressdaten</li>
        <li>Bauantragsunterlagen (Pläne, Beschreibungen, Berechnungen)</li>
        <li>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung mit dem Architekturbüro)</li>
        <li>Aufbewahrung: 10 Jahre (HOAI § 14, AO § 147, HGB § 257)</li>
      </ul>
      <h3>Anmeldung und Sitzungsverwaltung</h3>
      <ul>
        <li>E-Mail, Passwort-Hash (argon2id), Session-Token (gehasht)</li>
        <li>IP-Hash (SHA-256 mit täglich rotierendem Salt; pseudonym)</li>
        <li>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO</li>
      </ul>
      <h3>Genehmigungsfrei-Prüfer (anonymer Public-Dienst)</h3>
      <ul>
        <li>IP-Hash, Bundesland, Projekttyp-Eingaben</li>
        <li>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse: Lead-Funnel)</li>
        <li>Aufbewahrung: 30 Tage als aggregierte Statistik</li>
      </ul>
      <h3>Cookie und Analyse</h3>
      <ul>
        <li>Technisch notwendige Cookies (Auth-Session, CSRF) ohne Einwilligung</li>
        <li>Analyse-Cookies (PostHog self-hosted) nur mit Einwilligung über Cookie-Banner; siehe <a href="/cookies">Cookie-Erklärung</a></li>
      </ul>

      <h2>4. Wer Daten von uns erhält (Empfänger)</h2>
      <p>
        Strota leitet personenbezogene Daten nur an folgende Kategorien
        von Empfängern weiter:
      </p>
      <ul>
        <li>
          Auftragsverarbeiter (siehe{' '}
          <a href="/sub-processors">Sub-Processor-Liste</a>): Hetzner,
          Cloudflare, Vercel, AWS Bedrock + Anthropic, Postmark, Stripe,
          D-Trust, BKG, Better Uptime
        </li>
        <li>Bauamt / Bauaufsichtsbehörde: nur auf Anweisung des Architekt-Auftraggebers</li>
        <li>Nachbarn: nur bei freiwilliger Beteiligung mit Zustimmung</li>
        <li>Steuerberater, Wirtschaftsprüfer, Rechtsanwälte: nach gesetzlicher Pflicht</li>
      </ul>

      <h2>5. Übermittlung in Drittländer</h2>
      <p>
        Keine. Alle Verarbeitungen finden in der EU oder mit gleichwertigen
        Standardvertragsklauseln statt. Anthropic-Verarbeitung erfolgt
        über AWS Bedrock EU-Frankfurt; AWS ist Sub-Processor mit
        EU-Datenresidenz.
      </p>

      <h2>6. Speicherdauer</h2>
      <p>
        Verarbeitungs-spezifisch (siehe Abschnitt 3). Längste Frist:
        10 Jahre für Bauantragsunterlagen und Rechnungen
        (berufsrechtlich + steuerlich). Audit-Log: 10 Jahre hot +
        Cold-Archive danach.
      </p>

      <h2>7. Ihre Rechte</h2>
      <p>Sie haben das Recht auf:</p>
      <ul>
        <li>Auskunft (Art. 15 DSGVO)</li>
        <li>Berichtigung (Art. 16 DSGVO)</li>
        <li>Löschung (Art. 17 DSGVO, unter Beachtung der Aufbewahrungspflichten)</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Widerspruch (Art. 21 DSGVO)</li>
        <li>Beschwerde bei der Aufsichtsbehörde (Art. 77 DSGVO)</li>
      </ul>
      <p>
        Anträge senden Sie bitte an{' '}
        <a href="mailto:betroffenenrechte@strota.de">betroffenenrechte@strota.de</a>.
        Detaillierter Workflow:{' '}
        <a href="/cookies#dsr">Data Subject Rights</a>.
      </p>

      <h2>8. Aufsichtsbehörde</h2>
      <p>
        Bayerisches Landesamt für Datenschutzaufsicht (BayLDA), Promenade
        18, 91522 Ansbach.
      </p>

      <h2>9. Automatisierte Entscheidungsfindung</h2>
      <p>
        Wir setzen KI-gestützte Vorgänge ein
        (Vollständigkeits-Prüfung, Verfahrens-Bestimmung,
        Baubeschreibungs-Generator) auf Basis von Art. 22 Abs. 2 lit. c
        DSGVO (ausdrückliche Einwilligung des Verantwortlichen).
        Jeder Ausgabe-Schritt ist überschreibbar; der bauvorlage-
        berechtigte Architekt entscheidet final. KI-Outputs sind
        beratend, keine bindende Verwaltungsentscheidung.
      </p>
      <p>
        Strota verwendet die personenbezogenen Daten unserer Kunden
        NIEMALS für das Training von KI-Modellen. Diese Zusicherung
        ist sowohl im AVV § 6 als auch in den Sub-Processor-Verträgen
        (insbesondere Anthropic + AWS Bedrock) festgehalten.
      </p>

      <h2>10. Berufsrechtliche Verschwiegenheit</h2>
      <p>
        Die durch Strota verarbeiteten Mandanten-Daten
        (Bauherr-Stammdaten, Bauunterlagen) unterliegen der
        berufsrechtlichen Verschwiegenheitspflicht des Architekten nach
        der Berufsordnung der jeweiligen Landes-Architektenkammer. Strota
        behandelt diese Daten als Berufsgeheimnis-Klasse (siehe
        unsere <a href="/toms">TOMs</a>).
      </p>

      <h2>11. Änderungen dieser Datenschutzerklärung</h2>
      <p>
        Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit
        sie stets den aktuellen rechtlichen Anforderungen entspricht oder
        um Änderungen unserer Leistungen umzusetzen. Änderungen werden
        unter dieser URL veröffentlicht. Bei wesentlichen Änderungen
        informieren wir aktiv per E-Mail.
      </p>
    </LegalPage>
  );
}
