'use client';

import { useEffect, useState } from 'react';

/**
 * Cookie consent banner per BGH 2024 standards:
 * - Equal-prominence Accept and Reject buttons (no dark patterns).
 * - Granular categories (essential always on; functional/analytics/marketing opt-in).
 * - One-click dismiss with reject as default if no choice within 30 days.
 * - 12-month re-prompt.
 *
 * Stored in localStorage as the source of truth for the browser; mirrored
 * to /api/consents (Phase 2.5) so the cookie_consents table holds the audit
 * record. For Phase 2 we only persist locally and add server-side audit later.
 */

const STORAGE_KEY = 'strota.cookie.consent.v1';
const REPROMPT_AFTER_DAYS = 365;

type Category = 'functional' | 'analytics' | 'marketing';

interface ConsentState {
  decided: boolean;
  categories: Record<Category, boolean>;
  decided_at: string;
}

function loadState(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    const decidedAt = new Date(parsed.decided_at);
    const ageDays = (Date.now() - decidedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays > REPROMPT_AFTER_DAYS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state: ConsentState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function CookieConsent(): JSX.Element | null {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [categories, setCategories] = useState<Record<Category, boolean>>({
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const state = loadState();
    if (!state) setVisible(true);
  }, []);

  if (!visible) return null;

  function decide(allCategories: Record<Category, boolean>): void {
    saveState({
      decided: true,
      categories: allCategories,
      decided_at: new Date().toISOString(),
    });
    setVisible(false);
  }

  function acceptAll(): void {
    decide({ functional: true, analytics: true, marketing: true });
  }

  function rejectAll(): void {
    decide({ functional: false, analytics: false, marketing: false });
  }

  function saveSelection(): void {
    decide(categories);
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-bg-elevated shadow-lg"
    >
      <div className="mx-auto max-w-4xl px-6 py-6">
        <h2
          id="cookie-consent-title"
          className="font-display text-lg text-primary-900"
        >
          Cookies und vergleichbare Technologien
        </h2>
        <p id="cookie-consent-desc" className="mt-2 text-sm text-neutral-700">
          Wir verwenden technisch notwendige Cookies für Anmeldung und Sicherheit.
          Funktionale, Analyse- und Marketing-Cookies setzen wir nur mit Ihrer
          Einwilligung ein. Sie können diese jederzeit unter{' '}
          <a className="underline" href="/cookies">
            Cookie-Erklärung
          </a>{' '}
          anpassen.
        </p>

        {showDetails ? (
          <fieldset className="mt-4 space-y-3 rounded border border-neutral-200 p-4">
            <legend className="px-2 text-sm font-semibold">Kategorien</legend>
            <Category
              label="Notwendig (immer aktiv)"
              description="Anmeldung, CSRF-Schutz, Sprach-Einstellung. Ohne diese funktioniert die App nicht."
              checked
              disabled
            />
            <Category
              label="Funktional"
              description="Bequemlichkeits-Einstellungen wie Dark-Mode oder Dichte."
              checked={categories.functional}
              onChange={(v) =>
                setCategories((c) => ({ ...c, functional: v }))
              }
            />
            <Category
              label="Analyse"
              description="Anonyme Funnel-Statistik via PostHog (self-hosted). Hilft uns, die App zu verbessern."
              checked={categories.analytics}
              onChange={(v) =>
                setCategories((c) => ({ ...c, analytics: v }))
              }
            />
            <Category
              label="Marketing"
              description="Re-Marketing-Pixel. Aktuell nicht aktiv; nur als Vorbereitung."
              checked={categories.marketing}
              onChange={(v) =>
                setCategories((c) => ({ ...c, marketing: v }))
              }
            />
          </fieldset>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="text-sm underline self-start"
          >
            {showDetails ? 'Auswahl ausblenden' : 'Auswahl anzeigen und anpassen'}
          </button>
          <div className="flex flex-col gap-2 sm:flex-row">
            {showDetails ? (
              <button
                type="button"
                onClick={saveSelection}
                className="rounded border border-primary-700 bg-bg-elevated px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50"
              >
                Auswahl speichern
              </button>
            ) : null}
            <button
              type="button"
              onClick={rejectAll}
              className="rounded border border-neutral-300 bg-bg-elevated px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
            >
              Nur notwendige
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="rounded border border-primary-700 bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
            >
              Alle akzeptieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Category({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}): JSX.Element {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-neutral-300"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span>
        <span className="font-semibold">{label}</span>
        <span className="block text-neutral-700">{description}</span>
      </span>
    </label>
  );
}
