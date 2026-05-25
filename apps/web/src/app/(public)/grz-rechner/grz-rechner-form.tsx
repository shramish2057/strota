'use client';

import { Button } from '@strota/ui';
import { useState } from 'react';

type GrzResponse = {
  grz: number;
  grz_inkl_nebenanlagen: number;
  gfz: number;
  bmz: number | null;
  bplan_compliance: Record<
    string,
    { limit: number; actual: number; status: 'konform' | 'ueberschreitung'; delta: number }
  >;
  rechtsgrundlage: { grz: string; gfz: string; bmz: string; quelle_url: string };
};

export function GrzRechnerForm(): JSX.Element {
  const [form, setForm] = useState({
    grundstuecksflaeche_m2: '',
    grundflaeche_hauptanlage_m2: '',
    grundflaeche_nebenanlagen_m2: '',
    geschossflaeche_m2: '',
    bruttorauminhalt_m3: '',
    bplan_grz: '',
    bplan_gfz: '',
    bplan_bmz: '',
  });
  const [result, setResult] = useState<GrzResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string): void {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body = {
        grundstuecksflaeche_m2: Number(form.grundstuecksflaeche_m2),
        grundflaeche_hauptanlage_m2: Number(form.grundflaeche_hauptanlage_m2),
        grundflaeche_nebenanlagen_m2: form.grundflaeche_nebenanlagen_m2
          ? Number(form.grundflaeche_nebenanlagen_m2)
          : 0,
        geschossflaeche_m2: Number(form.geschossflaeche_m2),
        bruttorauminhalt_m3: form.bruttorauminhalt_m3 ? Number(form.bruttorauminhalt_m3) : undefined,
        bplan_grz: form.bplan_grz ? Number(form.bplan_grz) : undefined,
        bplan_gfz: form.bplan_gfz ? Number(form.bplan_gfz) : undefined,
        bplan_bmz: form.bplan_bmz ? Number(form.bplan_bmz) : undefined,
      };
      const r = await fetch('/api/public/grz-rechner', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await r.json()) as GrzResponse | { detail?: unknown };
      if (!r.ok) {
        const detail = (json as { detail?: unknown }).detail;
        setError(typeof detail === 'string' ? detail : `HTTP ${r.status}`);
        return;
      }
      setResult(json as GrzResponse);
    } catch (err) {
      setError(`Netzwerkfehler: ${String(err)}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-md border border-neutral-200 bg-bg-elevated p-6"
      >
        <fieldset className="space-y-3">
          <legend className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
            Grundstueck & Vorhaben
          </legend>
          <Field label="Grundstuecksflaeche (m2)" required>
            <input
              type="number"
              step="0.1"
              min={0.1}
              required
              value={form.grundstuecksflaeche_m2}
              onChange={(e) => set('grundstuecksflaeche_m2', e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Grundflaeche Hauptanlage (m2)" required>
            <input
              type="number"
              step="0.1"
              min={0}
              required
              value={form.grundflaeche_hauptanlage_m2}
              onChange={(e) => set('grundflaeche_hauptanlage_m2', e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Grundflaeche Nebenanlagen (m2)">
            <input
              type="number"
              step="0.1"
              min={0}
              value={form.grundflaeche_nebenanlagen_m2}
              onChange={(e) => set('grundflaeche_nebenanlagen_m2', e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Geschossflaeche gesamt (m2)" required>
            <input
              type="number"
              step="0.1"
              min={0}
              required
              value={form.geschossflaeche_m2}
              onChange={(e) => set('geschossflaeche_m2', e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Brutto-Rauminhalt (m3, optional fuer BMZ)">
            <input
              type="number"
              step="0.1"
              min={0}
              value={form.bruttorauminhalt_m3}
              onChange={(e) => set('bruttorauminhalt_m3', e.target.value)}
              className={inputCls}
            />
          </Field>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
            B-Plan-Festsetzungen (optional)
          </legend>
          <div className="grid grid-cols-3 gap-3">
            <Field label="GRZ max">
              <input
                type="number"
                step="0.01"
                min={0}
                max={1}
                value={form.bplan_grz}
                onChange={(e) => set('bplan_grz', e.target.value)}
                placeholder="z.B. 0.4"
                className={inputCls}
              />
            </Field>
            <Field label="GFZ max">
              <input
                type="number"
                step="0.01"
                min={0}
                max={3}
                value={form.bplan_gfz}
                onChange={(e) => set('bplan_gfz', e.target.value)}
                placeholder="z.B. 0.8"
                className={inputCls}
              />
            </Field>
            <Field label="BMZ max">
              <input
                type="number"
                step="0.1"
                min={0}
                value={form.bplan_bmz}
                onChange={(e) => set('bplan_bmz', e.target.value)}
                placeholder="optional"
                className={inputCls}
              />
            </Field>
          </div>
        </fieldset>

        {error ? (
          <p className="rounded-sm bg-error-100 px-3 py-2 text-sm text-error-700">{error}</p>
        ) : null}

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? 'Berechne...' : 'GRZ und GFZ berechnen'}
        </Button>
      </form>

      <aside className="rounded-md border border-neutral-200 bg-bg-elevated p-6">
        {result ? (
          <ResultPanel result={result} />
        ) : (
          <div className="text-sm text-neutral-700">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Ergebnis
            </p>
            <p className="mt-3">
              Geben Sie links die Grundstuecksdaten ein und optional die B-Plan-Festsetzungen.
              Strota berechnet GRZ, GFZ und (wenn Brutto-Rauminhalt angegeben) BMZ und prueft
              gegen die Festsetzungen.
            </p>
            <p className="mt-4 text-xs text-neutral-500">
              Rechtsgrundlage: §§ 17, 19, 20 BauNVO. Quelle: gesetze-im-internet.de.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

const inputCls =
  'mt-1 block w-full rounded-sm border border-neutral-300 bg-bg-elevated px-3 py-2 text-sm tabular-nums text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-neutral-700">
        {label}
        {required ? ' *' : ''}
      </span>
      {children}
    </label>
  );
}

function ResultPanel({ result }: { result: GrzResponse }): JSX.Element {
  return (
    <div>
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
        Ergebnis
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="GRZ" value={result.grz.toFixed(3)} />
        <Stat label="GRZ inkl. Nebenanlagen" value={result.grz_inkl_nebenanlagen.toFixed(3)} />
        <Stat label="GFZ" value={result.gfz.toFixed(3)} />
        {result.bmz !== null ? <Stat label="BMZ" value={result.bmz.toFixed(3)} /> : null}
      </dl>

      {Object.keys(result.bplan_compliance).length > 0 ? (
        <div className="mt-6">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            B-Plan-Abgleich
          </p>
          <ul className="mt-3 space-y-2">
            {Object.entries(result.bplan_compliance).map(([key, cmp]) => (
              <li
                key={key}
                className={`rounded-sm border px-3 py-2 text-sm ${
                  cmp.status === 'konform'
                    ? 'border-success-200 bg-success-100 text-success-700'
                    : 'border-error-200 bg-error-100 text-error-700'
                }`}
              >
                <span className="font-semibold uppercase">{key}</span>: {cmp.actual.toFixed(3)} vs.
                B-Plan {cmp.limit.toFixed(3)} ({cmp.status === 'konform' ? 'konform' : 'Ueberschreitung'}
                {' '}
                {cmp.delta >= 0 ? '+' : ''}
                {cmp.delta.toFixed(3)})
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-6 text-xs text-neutral-500">
        Rechtsgrundlage: {result.rechtsgrundlage.grz}. Quelle:{' '}
        <a
          href={result.rechtsgrundlage.quelle_url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary-700"
        >
          BauNVO bei gesetze-im-internet.de
        </a>
        .
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div>
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="font-display text-2xl tabular-nums text-primary-900">{value}</dd>
    </div>
  );
}
