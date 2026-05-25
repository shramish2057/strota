'use client';

import { Button } from '@strota/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Hero entry-point form. Captures address + project type + minimum required
 * params and POSTs to /api/public/genehmigungsfrei/check.
 *
 * Renders the verdict inline. If the user wants to refine, deep-link to the
 * full /genehmigungsfrei surface which carries every parameter the engine
 * accepts plus sonderlagen toggles.
 */

type ProjectTypeOption = { value: string; title: string };

type Verdict = {
  verdict:
    | 'verfahrensfrei'
    | 'verfahrensfrei_mit_anzeige'
    | 'antrag_erforderlich'
    | 'grenzfall'
    | 'sonderlage_trotz_verfahrensfreiheit';
  title: string;
  begruendung: string;
  citation?: {
    norm: string;
    artikel: number;
    absatz?: number;
    nummer?: number;
    buchstabe?: string;
    zitiertext: string;
    quelle_url: string;
    effective_from: string;
  } | null;
  sonderlagen: Array<{ code: string; name: string; konsequenz: string }>;
  bauamt?: { name: string; typ: string; regierungsbezirk: string } | null;
  cta?: { label: string; href: string } | null;
  corpus_version: string;
  legal_disclaimer: string;
  requires_anzeige?: boolean;
};

type CheckResponse = {
  ags: { ags_8: string; bundesland: string; ort: string | null; plz: string | null; source: string };
  verdict: Verdict;
  rate_limit: { count_today: number; limit_per_day: number; bucket_date: string };
};

type ErrorResponse = { detail?: unknown };

const FALLBACK_PROJECT_TYPES: ProjectTypeOption[] = [
  { value: 'garage', title: 'Garage / Carport' },
  { value: 'terrassenueberdachung', title: 'Terrassenueberdachung' },
  { value: 'gartenhuette', title: 'Gartenhuette / Schuppen' },
  { value: 'solaranlage_dach', title: 'Solaranlage auf dem Dach' },
  { value: 'solaranlage_freiflaeche', title: 'Solar Freiflaeche' },
  { value: 'zaun', title: 'Zaun / Mauer' },
  { value: 'werbeanlage', title: 'Werbeanlage' },
  { value: 'wintergarten', title: 'Wintergarten' },
  { value: 'neubau_wohngebaeude_efh', title: 'Neubau Einfamilienhaus' },
  { value: 'anbau', title: 'Anbau / Aufstockung' },
  { value: 'nutzungsaenderung', title: 'Nutzungsaenderung' },
  { value: 'umbau_innen', title: 'Umbau innen' },
  { value: 'abbruch_klein', title: 'Abbruch (klein)' },
];

export function GenehmigungsfreiHeroForm(): JSX.Element {
  const [projectTypes, setProjectTypes] = useState<ProjectTypeOption[]>(FALLBACK_PROJECT_TYPES);
  const [address, setAddress] = useState('');
  const [projectType, setProjectType] = useState('');
  const [grundflaeche, setGrundflaeche] = useState('');
  const [wandhoehe, setWandhoehe] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      try {
        const r = await fetch('/api/public/genehmigungsfrei/project-types', { cache: 'no-store' });
        if (!r.ok) return;
        const data = (await r.json()) as { project_types: ProjectTypeOption[] };
        if (!cancelled && Array.isArray(data.project_types) && data.project_types.length > 0) {
          setProjectTypes(data.project_types);
        }
      } catch {
        // keep fallback list
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setResult(null);
    if (!consent) {
      setError('Bitte stimmen Sie der Verarbeitung zu, um die Pruefung zu starten.');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        address: { free_text: address.trim() },
        project_type: projectType,
        brutto_grundflaeche_m2: grundflaeche ? Number(grundflaeche) : undefined,
        mittlere_wandhoehe_m: wandhoehe ? Number(wandhoehe) : undefined,
        consent_data_processing: true,
      };
      const r = await fetch('/api/public/genehmigungsfrei/check', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const text = await r.text();
      let json: unknown = null;
      try {
        json = JSON.parse(text);
      } catch {
        json = { detail: text };
      }
      if (!r.ok) {
        const detail = (json as ErrorResponse).detail;
        setError(
          typeof detail === 'string'
            ? detail
            : `Pruefung fehlgeschlagen (HTTP ${r.status}). Bitte spaeter erneut versuchen.`,
        );
        return;
      }
      setResult(json as CheckResponse);
    } catch (err) {
      setError(`Netzwerkfehler: ${String(err)}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return <VerdictPanel response={result} onReset={() => setResult(null)} />;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-md bg-bg-elevated p-6 shadow-lg">
      <div>
        <label className="block text-sm font-semibold text-neutral-900" htmlFor="hero-address">
          Adresse
        </label>
        <p className="mt-1 text-xs text-neutral-500">Strasse und Hausnummer, Postleitzahl, Ort</p>
        <input
          id="hero-address"
          name="address"
          required
          placeholder="Musterstrasse 12, 80539 Muenchen"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="mt-2 block w-full rounded-sm border border-neutral-300 bg-bg-elevated px-3 py-2 text-sm text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-900" htmlFor="hero-project-type">
          Vorhaben
        </label>
        <select
          id="hero-project-type"
          name="project_type"
          required
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          className="mt-2 block w-full rounded-sm border border-neutral-300 bg-bg-elevated px-3 py-2 text-sm text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          <option value="">Bitte waehlen...</option>
          {projectTypes.map((p) => (
            <option key={p.value} value={p.value}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-neutral-700" htmlFor="hero-grundflaeche">
            Grundflaeche (m2)
          </label>
          <input
            id="hero-grundflaeche"
            type="number"
            step="0.1"
            min={0}
            placeholder="z.B. 24"
            value={grundflaeche}
            onChange={(e) => setGrundflaeche(e.target.value)}
            className="mt-1 block w-full rounded-sm border border-neutral-300 bg-bg-elevated px-3 py-2 text-sm text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-700" htmlFor="hero-wandhoehe">
            Wandhoehe (m)
          </label>
          <input
            id="hero-wandhoehe"
            type="number"
            step="0.01"
            min={0}
            placeholder="z.B. 2.85"
            value={wandhoehe}
            onChange={(e) => setWandhoehe(e.target.value)}
            className="mt-1 block w-full rounded-sm border border-neutral-300 bg-bg-elevated px-3 py-2 text-sm text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-neutral-200 bg-bg-base p-3 text-xs text-neutral-700">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded-sm border-neutral-300 text-primary-600 focus:ring-primary-500"
          required
        />
        <span>
          Ich stimme zu, dass Strota die Eingaben gegen den oeffentlichen Strota-Korpus prueft.
          Keine Speicherung personenbezogener Daten. Nur IP-Hash zum Missbrauchsschutz, taeglich rotierender Salt.
        </span>
      </label>

      {error ? (
        <p className="rounded-sm bg-error-100 px-3 py-2 text-sm text-error-700">{error}</p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" size="lg" disabled={submitting} className="flex-1">
          {submitting ? 'Pruefe...' : 'Kostenlos pruefen'}
        </Button>
        <Link
          href="/genehmigungsfrei"
          className="inline-flex items-center justify-center rounded-sm border border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
        >
          Mehr Parameter
        </Link>
      </div>
      <p className="text-xs text-neutral-500">
        Heute live fuer Bayern. Weitere Bundeslaender entlang der oeffentlichen Roadmap.
      </p>
    </form>
  );
}

function VerdictPanel({
  response,
  onReset,
}: {
  response: CheckResponse;
  onReset: () => void;
}): JSX.Element {
  const v = response.verdict;
  const tone =
    v.verdict === 'verfahrensfrei'
      ? 'bg-success-100 text-success-700 border-success-200'
      : v.verdict === 'verfahrensfrei_mit_anzeige'
        ? 'bg-warning-100 text-warning-700 border-warning-200'
        : v.verdict === 'sonderlage_trotz_verfahrensfreiheit'
          ? 'bg-warning-100 text-warning-700 border-warning-200'
          : v.verdict === 'grenzfall'
            ? 'bg-accent-100 text-accent-700 border-accent-100'
            : 'bg-error-100 text-error-700 border-error-200';
  return (
    <div className="space-y-4 rounded-md bg-bg-elevated p-6 shadow-lg">
      <div className={`rounded-sm border px-3 py-2 text-sm font-semibold ${tone}`}>
        {labelFor(v.verdict)}
      </div>
      <h3 className="font-display text-xl text-primary-900">{v.title}</h3>
      <p className="text-sm leading-relaxed text-neutral-800">{v.begruendung}</p>

      {v.citation ? (
        <div className="rounded-sm border border-primary-200 bg-primary-50 p-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary-700">
            {v.citation.norm} Art. {v.citation.artikel}
            {v.citation.absatz ? ` Abs. ${v.citation.absatz}` : ''}
            {v.citation.nummer ? ` Nr. ${v.citation.nummer}` : ''}
            {v.citation.buchstabe ? ` lit. ${v.citation.buchstabe}` : ''}
          </p>
          <p className="mt-2 text-sm italic text-neutral-800">&bdquo;{v.citation.zitiertext}&ldquo;</p>
          <a
            href={v.citation.quelle_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800"
          >
            Quelle oeffnen <span aria-hidden>{'↗'}</span>
          </a>
        </div>
      ) : null}

      {v.sonderlagen.length > 0 ? (
        <div className="rounded-sm border border-warning-200 bg-warning-100/40 p-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-warning-700">
            Sonderlagen pruefen
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-800">
            {v.sonderlagen.map((s) => (
              <li key={s.code}>
                <span className="font-semibold">{s.name}:</span> {s.konsequenz}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {v.bauamt ? (
        <div className="text-xs text-neutral-600">
          Zustaendige Bauaufsichtsbehoerde: <span className="font-semibold">{v.bauamt.name}</span>{' '}
          ({v.bauamt.regierungsbezirk}) · AGS {response.ags.ags_8} · Quelle {response.ags.source}
        </div>
      ) : null}

      <p className="text-xs text-neutral-500">{v.legal_disclaimer}</p>

      <div className="flex flex-col gap-2 sm:flex-row">
        {v.cta ? (
          <Link
            href={v.cta.href}
            className="inline-flex items-center justify-center rounded-sm bg-primary-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
          >
            {v.cta.label}
          </Link>
        ) : null}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center rounded-sm border border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
        >
          Andere Adresse pruefen
        </button>
      </div>
      <p className="text-[10px] text-neutral-400">
        Korpus-Version {v.corpus_version} · Tageskontingent {response.rate_limit.count_today}/
        {response.rate_limit.limit_per_day}
      </p>
    </div>
  );
}

function labelFor(verdict: Verdict['verdict']): string {
  switch (verdict) {
    case 'verfahrensfrei':
      return 'Verfahrensfrei';
    case 'verfahrensfrei_mit_anzeige':
      return 'Verfahrensfrei mit Anzeige';
    case 'antrag_erforderlich':
      return 'Antrag erforderlich';
    case 'grenzfall':
      return 'Grenzfall - Bauvoranfrage empfohlen';
    case 'sonderlage_trotz_verfahrensfreiheit':
      return 'Verfahrensfrei, aber Sonderlage beachten';
  }
}
