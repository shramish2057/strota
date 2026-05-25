'use client';

import { Button } from '@strota/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type ProjectType = { value: string; title: string };

type Citation = {
  norm: string;
  artikel: number;
  absatz?: number;
  nummer?: number;
  buchstabe?: string;
  zitiertext: string;
  quelle_url: string;
  effective_from: string;
};

type Verdict = {
  verdict:
    | 'verfahrensfrei'
    | 'verfahrensfrei_mit_anzeige'
    | 'antrag_erforderlich'
    | 'grenzfall'
    | 'sonderlage_trotz_verfahrensfreiheit';
  title: string;
  begruendung: string;
  citation: Citation | null;
  sonderlagen: Array<{ code: string; name: string; konsequenz: string; zustaendige_behoerde?: string | null }>;
  bauamt: { name: string; typ: string; regierungsbezirk: string } | null;
  cta: { label: string; href: string } | null;
  corpus_version: string;
  legal_disclaimer: string;
  requires_anzeige?: boolean;
};

type CheckResponse = {
  ags: { ags_8: string; bundesland: string; ort: string | null; plz: string | null; source: string };
  verdict: Verdict;
  rate_limit: { count_today: number; limit_per_day: number; bucket_date: string };
};

const FALLBACK_PROJECT_TYPES: ProjectType[] = [
  { value: 'garage', title: 'Garage / Carport' },
  { value: 'carport', title: 'Carport' },
  { value: 'terrassenueberdachung', title: 'Terrassenueberdachung' },
  { value: 'pergola', title: 'Pergola' },
  { value: 'gartenhuette', title: 'Gartenhuette / Schuppen' },
  { value: 'schuppen', title: 'Schuppen' },
  { value: 'nebengebaeude', title: 'Nebengebaeude' },
  { value: 'solaranlage_dach', title: 'Solaranlage / PV Dach' },
  { value: 'solaranlage_freiflaeche', title: 'Solar Freiflaeche' },
  { value: 'zaun', title: 'Zaun' },
  { value: 'mauer', title: 'Mauer / Stuetzmauer' },
  { value: 'einfriedung', title: 'Einfriedung' },
  { value: 'werbeanlage', title: 'Werbeanlage' },
  { value: 'schornstein', title: 'Schornstein' },
  { value: 'instandhaltung', title: 'Instandhaltung' },
  { value: 'neubau_wohngebaeude_efh', title: 'Neubau Einfamilienhaus' },
  { value: 'neubau_wohngebaeude_mfh', title: 'Neubau Mehrfamilienhaus' },
  { value: 'anbau', title: 'Anbau / Erweiterung' },
  { value: 'aufstockung', title: 'Aufstockung' },
  { value: 'wintergarten', title: 'Wintergarten' },
  { value: 'nutzungsaenderung', title: 'Nutzungsaenderung' },
  { value: 'umbau_innen', title: 'Umbau innen' },
  { value: 'dachausbau', title: 'Dachausbau' },
  { value: 'abbruch_klein', title: 'Abbruch (klein)' },
];

type FormState = {
  address: string;
  projectType: string;
  brutto_grundflaeche_m2: string;
  brutto_rauminhalt_m3: string;
  mittlere_wandhoehe_m: string;
  hoehe_m: string;
  hoehe_ueber_dach_m: string;
  tiefe_m: string;
  gesamtlaenge_m: string;
  ansichtsflaeche_m2: string;
  im_aussenbereich: boolean;
  hat_aufenthaltsraum: boolean;
  hat_toilette: boolean;
  hat_feuerstaette: boolean;
  ist_an_oder_auf_gebaeude: boolean;
  ist_hochhaus: boolean;
  ist_freistehend: boolean;
  ist_instandhaltung_ohne_eingriff: boolean;
  eingriff_in_tragende_teile: boolean;
  eingriff_in_brandschutz: boolean;
  veraenderung_aussenhuelle: boolean;
  denkmalschutz: boolean;
  ueberschwemmungsgebiet: boolean;
  naturschutz: boolean;
  sanierungsgebiet: boolean;
  erhaltungssatzung: boolean;
  gestaltungssatzung: boolean;
  consent: boolean;
};

const INITIAL: FormState = {
  address: '',
  projectType: '',
  brutto_grundflaeche_m2: '',
  brutto_rauminhalt_m3: '',
  mittlere_wandhoehe_m: '',
  hoehe_m: '',
  hoehe_ueber_dach_m: '',
  tiefe_m: '',
  gesamtlaenge_m: '',
  ansichtsflaeche_m2: '',
  im_aussenbereich: false,
  hat_aufenthaltsraum: false,
  hat_toilette: false,
  hat_feuerstaette: false,
  ist_an_oder_auf_gebaeude: false,
  ist_hochhaus: false,
  ist_freistehend: false,
  ist_instandhaltung_ohne_eingriff: false,
  eingriff_in_tragende_teile: false,
  eingriff_in_brandschutz: false,
  veraenderung_aussenhuelle: false,
  denkmalschutz: false,
  ueberschwemmungsgebiet: false,
  naturschutz: false,
  sanierungsgebiet: false,
  erhaltungssatzung: false,
  gestaltungssatzung: false,
  consent: false,
};

const inputCls =
  'mt-1 block w-full rounded-sm border border-neutral-300 bg-bg-elevated px-3 py-2 text-sm tabular-nums text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500';

export function GenehmigungsfreiFullForm(): JSX.Element {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>(FALLBACK_PROJECT_TYPES);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      try {
        const r = await fetch('/api/public/genehmigungsfrei/project-types', { cache: 'no-store' });
        if (!r.ok) return;
        const data = (await r.json()) as { project_types: ProjectType[] };
        if (!cancelled && data.project_types?.length > 0) {
          setProjectTypes(data.project_types);
        }
      } catch {
        // keep fallback
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]): void {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setResult(null);
    if (!form.consent) {
      setError('Bitte stimmen Sie der Verarbeitung zu, um die Pruefung zu starten.');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        address: { free_text: form.address.trim() },
        project_type: form.projectType,
        brutto_grundflaeche_m2: numOrUndefined(form.brutto_grundflaeche_m2),
        brutto_rauminhalt_m3: numOrUndefined(form.brutto_rauminhalt_m3),
        mittlere_wandhoehe_m: numOrUndefined(form.mittlere_wandhoehe_m),
        hoehe_m: numOrUndefined(form.hoehe_m),
        hoehe_ueber_dach_m: numOrUndefined(form.hoehe_ueber_dach_m),
        tiefe_m: numOrUndefined(form.tiefe_m),
        gesamtlaenge_m: numOrUndefined(form.gesamtlaenge_m),
        ansichtsflaeche_m2: numOrUndefined(form.ansichtsflaeche_m2),
        im_aussenbereich: form.im_aussenbereich,
        hat_aufenthaltsraum: form.hat_aufenthaltsraum,
        hat_toilette: form.hat_toilette,
        hat_feuerstaette: form.hat_feuerstaette,
        ist_an_oder_auf_gebaeude: form.ist_an_oder_auf_gebaeude,
        ist_hochhaus: form.ist_hochhaus,
        ist_freistehend: form.ist_freistehend,
        ist_instandhaltung_ohne_eingriff: form.ist_instandhaltung_ohne_eingriff,
        eingriff_in_tragende_teile: form.eingriff_in_tragende_teile,
        eingriff_in_brandschutz: form.eingriff_in_brandschutz,
        veraenderung_aussenhuelle: form.veraenderung_aussenhuelle,
        denkmalschutz: form.denkmalschutz,
        ueberschwemmungsgebiet: form.ueberschwemmungsgebiet,
        naturschutz: form.naturschutz,
        sanierungsgebiet: form.sanierungsgebiet,
        erhaltungssatzung: form.erhaltungssatzung,
        gestaltungssatzung: form.gestaltungssatzung,
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
        const detail = (json as { detail?: unknown }).detail;
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

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <form onSubmit={onSubmit} className="space-y-6 rounded-md border border-neutral-200 bg-bg-elevated p-6">
        <fieldset className="space-y-3">
          <legend className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
            Adresse und Vorhaben
          </legend>
          <Field label="Adresse" required hint="Strasse, PLZ, Ort">
            <input
              type="text"
              required
              placeholder="Musterstrasse 12, 80539 Muenchen"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              className={inputCls}
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
          <Field label="Vorhabens-Typ" required>
            <select
              required
              value={form.projectType}
              onChange={(e) => update('projectType', e.target.value)}
              className={inputCls}
            >
              <option value="">Bitte waehlen...</option>
              {projectTypes.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.title}
                </option>
              ))}
            </select>
          </Field>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
            Masse (relevant je nach Vorhabens-Typ)
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Grundflaeche (m2)">
              <input type="number" step="0.1" min={0} value={form.brutto_grundflaeche_m2}
                onChange={(e) => update('brutto_grundflaeche_m2', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Brutto-Rauminhalt (m3)">
              <input type="number" step="0.1" min={0} value={form.brutto_rauminhalt_m3}
                onChange={(e) => update('brutto_rauminhalt_m3', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Mittlere Wandhoehe (m)">
              <input type="number" step="0.01" min={0} value={form.mittlere_wandhoehe_m}
                onChange={(e) => update('mittlere_wandhoehe_m', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Hoehe (m, allgemein)">
              <input type="number" step="0.01" min={0} value={form.hoehe_m}
                onChange={(e) => update('hoehe_m', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Hoehe ueber Dach (m, Schornstein)">
              <input type="number" step="0.01" min={0} value={form.hoehe_ueber_dach_m}
                onChange={(e) => update('hoehe_ueber_dach_m', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Tiefe (m, Terrassenueberdachung)">
              <input type="number" step="0.01" min={0} value={form.tiefe_m}
                onChange={(e) => update('tiefe_m', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Gesamtlaenge (m, Freiflaechen-PV)">
              <input type="number" step="0.01" min={0} value={form.gesamtlaenge_m}
                onChange={(e) => update('gesamtlaenge_m', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Ansichtsflaeche (m2, Werbeanlage)">
              <input type="number" step="0.01" min={0} value={form.ansichtsflaeche_m2}
                onChange={(e) => update('ansichtsflaeche_m2', e.target.value)} className={inputCls} />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
            Eigenschaften des Vorhabens
          </legend>
          <CheckRow label="Aussenbereich (Paragraph 35 BauGB)" value={form.im_aussenbereich}
            onChange={(v) => update('im_aussenbereich', v)} />
          <CheckRow label="Hat Aufenthaltsraeume" value={form.hat_aufenthaltsraum}
            onChange={(v) => update('hat_aufenthaltsraum', v)} />
          <CheckRow label="Hat Toilette" value={form.hat_toilette}
            onChange={(v) => update('hat_toilette', v)} />
          <CheckRow label="Hat Feuerstaette" value={form.hat_feuerstaette}
            onChange={(v) => update('hat_feuerstaette', v)} />
          <CheckRow label="Solaranlage an/auf Gebaeude (nicht freistehend)" value={form.ist_an_oder_auf_gebaeude}
            onChange={(v) => update('ist_an_oder_auf_gebaeude', v)} />
          <CheckRow label="Ist Hochhaus (ueber 22 m)" value={form.ist_hochhaus}
            onChange={(v) => update('ist_hochhaus', v)} />
          <CheckRow label="Freistehend (Abbruch)" value={form.ist_freistehend}
            onChange={(v) => update('ist_freistehend', v)} />
          <CheckRow label="Reine Instandhaltung ohne Eingriff" value={form.ist_instandhaltung_ohne_eingriff}
            onChange={(v) => update('ist_instandhaltung_ohne_eingriff', v)} />
          <CheckRow label="Eingriff in tragende Teile" value={form.eingriff_in_tragende_teile}
            onChange={(v) => update('eingriff_in_tragende_teile', v)} />
          <CheckRow label="Eingriff in Brandschutz" value={form.eingriff_in_brandschutz}
            onChange={(v) => update('eingriff_in_brandschutz', v)} />
          <CheckRow label="Veraenderung Aussenhuelle" value={form.veraenderung_aussenhuelle}
            onChange={(v) => update('veraenderung_aussenhuelle', v)} />
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
            Sonderlagen (loesen parallele Erlaubnisse aus)
          </legend>
          <CheckRow label="Denkmalschutzgebiet oder Einzeldenkmal" value={form.denkmalschutz}
            onChange={(v) => update('denkmalschutz', v)} />
          <CheckRow label="Festgesetztes Ueberschwemmungsgebiet" value={form.ueberschwemmungsgebiet}
            onChange={(v) => update('ueberschwemmungsgebiet', v)} />
          <CheckRow label="Naturschutzgebiet oder Natura-2000" value={form.naturschutz}
            onChange={(v) => update('naturschutz', v)} />
          <CheckRow label="Sanierungsgebiet (Paragraph 142 BauGB)" value={form.sanierungsgebiet}
            onChange={(v) => update('sanierungsgebiet', v)} />
          <CheckRow label="Erhaltungssatzung (Paragraph 172 BauGB)" value={form.erhaltungssatzung}
            onChange={(v) => update('erhaltungssatzung', v)} />
          <CheckRow label="Oertliche Gestaltungssatzung" value={form.gestaltungssatzung}
            onChange={(v) => update('gestaltungssatzung', v)} />
        </fieldset>

        <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-neutral-200 bg-bg-base p-3 text-xs text-neutral-700">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => update('consent', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded-sm border-neutral-300 text-primary-600 focus:ring-primary-500"
            required
          />
          <span>
            Ich stimme zu, dass Strota meine Eingaben deterministisch gegen den oeffentlichen
            Strota-Korpus prueft. Keine Speicherung personenbezogener Daten. IP-Hash mit
            taeglicher Salt-Rotation als einziger Missbrauchsschutz.
          </span>
        </label>

        {error ? (
          <p className="rounded-sm bg-error-100 px-3 py-2 text-sm text-error-700">{error}</p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" size="lg" disabled={submitting} className="flex-1">
            {submitting ? 'Pruefe...' : 'Pruefung starten'}
          </Button>
          <button
            type="button"
            onClick={() => setForm(INITIAL)}
            className="rounded-sm border border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
          >
            Formular zuruecksetzen
          </button>
        </div>
      </form>

      <aside className="rounded-md border border-neutral-200 bg-bg-elevated p-6">
        {result ? (
          <VerdictPanel response={result} />
        ) : (
          <div className="space-y-3 text-sm text-neutral-700">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
              Ergebnis
            </p>
            <p>
              Geben Sie links Adresse, Vorhabens-Typ und die relevanten Masse ein. Strota
              prueft deterministisch gegen Art. 57 BayBO und liefert eines von fuenf Verdikten.
            </p>
            <p className="text-xs text-neutral-500">
              Antwortzeit p95 unter 500 Millisekunden. Pure Postgres und JSON-Korpus, keine
              KI-Anfrage fuer diese Pruefung.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-neutral-700">
        {label}
        {required ? ' *' : ''}
      </span>
      {hint ? <span className="ml-2 text-[10px] text-neutral-500">{hint}</span> : null}
      {children}
    </label>
  );
}

function CheckRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}): JSX.Element {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-800">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded-sm border-neutral-300 text-primary-600 focus:ring-primary-500"
      />
      {label}
    </label>
  );
}

function VerdictPanel({ response }: { response: CheckResponse }): JSX.Element {
  const v = response.verdict;
  const tone =
    v.verdict === 'verfahrensfrei'
      ? 'border-success-200 bg-success-100 text-success-700'
      : v.verdict === 'verfahrensfrei_mit_anzeige' || v.verdict === 'sonderlage_trotz_verfahrensfreiheit'
        ? 'border-warning-200 bg-warning-100 text-warning-700'
        : v.verdict === 'grenzfall'
          ? 'border-accent-100 bg-accent-100 text-accent-700'
          : 'border-error-200 bg-error-100 text-error-700';
  return (
    <div className="space-y-4">
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
        <p className="text-xs text-neutral-600">
          Zustaendige Bauaufsichtsbehoerde: <span className="font-semibold">{v.bauamt.name}</span>{' '}
          ({v.bauamt.regierungsbezirk}) · AGS {response.ags.ags_8} · Quelle {response.ags.source}
        </p>
      ) : null}

      <p className="text-xs text-neutral-500">{v.legal_disclaimer}</p>

      {v.cta ? (
        <Link
          href={v.cta.href}
          className="inline-flex items-center justify-center rounded-sm bg-primary-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
        >
          {v.cta.label}
        </Link>
      ) : null}

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

function numOrUndefined(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
