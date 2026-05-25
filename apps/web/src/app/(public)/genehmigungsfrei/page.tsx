import type { Metadata } from 'next';
import { GenehmigungsfreiFullForm } from './genehmigungsfrei-full-form';

export const metadata: Metadata = {
  title: 'Genehmigungsfrei-Pruefer | Strota',
  description:
    'In 30 Sekunden klaeren ob Ihr Vorhaben einen Bauantrag braucht. Deterministisch gegen BayBO Art. 57 geprueft, mit verlinkter Rechtsquelle. Heute live fuer Bayern.',
  alternates: { canonical: '/genehmigungsfrei' },
};

export default function GenehmigungsfreiPage(): JSX.Element {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 lg:px-8 lg:py-20">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary-600">
        Kostenloses Werkzeug · Bayern Live
      </p>
      <h1 className="mt-3 font-display text-5xl text-primary-900 sm:text-6xl">
        Brauche ich einen Bauantrag?
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-700">
        Adresse, Vorhabens-Typ und ein paar Eckdaten eingeben. Strota prueft deterministisch
        gegen Art. 57 BayBO, ob Ihr Vorhaben verfahrensfrei ist. Sie bekommen in 30 Sekunden
        eines von fuenf Ergebnissen mit verlinkter Rechtsquelle.
      </p>

      <div className="mt-10">
        <GenehmigungsfreiFullForm />
      </div>

      <section className="mt-16 grid gap-6 rounded-md border border-neutral-200 bg-bg-subtle p-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary-600">
            Die fuenf moeglichen Verdikte
          </p>
          <p className="mt-3 text-sm text-neutral-700">
            Strota gibt eines dieser fuenf Ergebnisse zurueck, jeweils mit Begruendung,
            Zitat-Quelle und Folge-Hinweisen.
          </p>
        </div>
        <ul className="space-y-3 lg:col-span-3">
          <Verdict tone="success" title="Verfahrensfrei" body="Kein Antrag, keine Anzeige noetig. Rechtsgrundlage: Art. 57 BayBO." />
          <Verdict tone="warning" title="Verfahrensfrei mit Anzeige" body="Keine Genehmigung, aber Anzeige beim Bauamt mindestens einen Monat vor Beginn (z.B. bei Abbruch)." />
          <Verdict tone="warning" title="Verfahrensfrei, aber Sonderlage beachten" body="Vorhaben grundsaetzlich verfahrensfrei, aber Denkmalschutz, Ueberschwemmungsgebiet o.ae. erfordert eigene Erlaubnis." />
          <Verdict tone="accent" title="Grenzfall - Bauvoranfrage empfohlen" body="Schwellenwerte werden nicht eindeutig erfuellt oder Vorhabens-Typ uneindeutig. Bauvoranfrage nach Art. 71 BayBO empfohlen." />
          <Verdict tone="error" title="Antrag erforderlich" body="Vorhaben ist nicht verfahrensfrei. Strota bestimmt nach Login das exakte Verfahren (Freistellung, vereinfacht, Voll, Sonderbau)." />
        </ul>
      </section>

      <section className="mt-12 rounded-md border border-neutral-200 bg-bg-elevated p-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary-600">
          Wie wir Ihre Daten behandeln
        </p>
        <ul className="mt-4 space-y-2 text-sm text-neutral-800">
          <li>Adresse und Eingaben werden ausschliesslich fuer die Pruefung verarbeitet, nicht gespeichert.</li>
          <li>Tageslimit 10 Pruefungen pro IP gegen Missbrauch. IP wird als SHA-256-Hash mit taeglich rotierender Salt gespeichert, der Klartext nie.</li>
          <li>Hosting in Deutschland (Hetzner Falkenstein und Nuernberg). Keine Verarbeitung in Drittstaaten.</li>
          <li>Strota ist kein Rechtsdienstleister iSd RDG. Die Pruefung ersetzt keine Auskunft des Bauaufsichtsamts.</li>
        </ul>
      </section>
    </main>
  );
}

function Verdict({
  tone,
  title,
  body,
}: {
  tone: 'success' | 'warning' | 'accent' | 'error';
  title: string;
  body: string;
}): JSX.Element {
  const toneClass =
    tone === 'success'
      ? 'border-success-200 bg-success-100'
      : tone === 'warning'
        ? 'border-warning-200 bg-warning-100'
        : tone === 'accent'
          ? 'border-accent-100 bg-accent-100'
          : 'border-error-200 bg-error-100';
  return (
    <li className={`rounded-sm border px-4 py-3 ${toneClass}`}>
      <p className="font-display text-base text-primary-900">{title}</p>
      <p className="mt-1 text-sm text-neutral-800">{body}</p>
    </li>
  );
}
