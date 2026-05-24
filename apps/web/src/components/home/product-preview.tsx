/**
 * Inline SVG mock of a Strota verdict card. Designed as a single self-contained
 * SVG so it ships zero KB beyond the markup and never breaks if a CDN photo
 * URL goes stale. Replace with a real product screenshot when the
 * Genehmigungsfrei-Pruefer ships (Phase 3.5+).
 */
export function ProductPreview(): JSX.Element {
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-2xl bg-primary-100/60 blur-2xl" aria-hidden />
      <svg
        viewBox="0 0 640 460"
        role="img"
        aria-labelledby="strota-preview-title strota-preview-desc"
        className="w-full rounded-md border border-neutral-200 bg-bg-elevated shadow-xl"
      >
        <title id="strota-preview-title">Strota Genehmigungsfrei-Pruefer Ergebnis</title>
        <desc id="strota-preview-desc">
          Beispielhafte Darstellung einer Verfahrensbestimmung mit grunem Live-Status,
          Adresse, Vorhabenstyp, Verdikt und drei Pflichtnachweisen.
        </desc>

        {/* Window chrome */}
        <rect x="0" y="0" width="640" height="36" rx="8" fill="#f1efe9" />
        <circle cx="18" cy="18" r="5" fill="#e5e7eb" />
        <circle cx="36" cy="18" r="5" fill="#e5e7eb" />
        <circle cx="54" cy="18" r="5" fill="#e5e7eb" />
        <rect x="80" y="10" width="380" height="16" rx="4" fill="#ffffff" stroke="#e5e7eb" />
        <text x="92" y="22" fontFamily="ui-monospace, monospace" fontSize="11" fill="#6b7280">
          app.strota.de/projekte/p-2412/verfahren
        </text>

        {/* Card body */}
        <rect x="20" y="60" width="600" height="380" rx="10" fill="#ffffff" stroke="#e5e7eb" />

        {/* Top eyebrow */}
        <text x="40" y="92" fontFamily="ui-monospace, monospace" fontSize="10" fill="#117c78"
              letterSpacing="2">
          VERFAHRENSBESTIMMUNG · BAYERN
        </text>

        {/* Headline */}
        <text x="40" y="124" fontFamily="Georgia, serif" fontSize="22" fill="#062e2c">
          Anbau Carport, Musterstrasse 12, Muenchen
        </text>

        {/* Verdict pill */}
        <rect x="40" y="148" width="178" height="32" rx="6" fill="#dcfce7" />
        <circle cx="58" cy="164" r="5" fill="#166534" />
        <text x="72" y="168" fontFamily="ui-sans-serif, sans-serif" fontSize="13" fontWeight="600"
              fill="#14532d">
          Genehmigungsfreie Anlage
        </text>

        {/* Quick facts */}
        <g fontFamily="ui-sans-serif, sans-serif" fontSize="11" fill="#374151">
          <text x="40" y="208" fill="#6b7280">Grundflaeche</text>
          <text x="40" y="226" fontWeight="600" fontSize="14" fill="#111827">29.4 m²</text>

          <text x="160" y="208" fill="#6b7280">Wandhoehe</text>
          <text x="160" y="226" fontWeight="600" fontSize="14" fill="#111827">2.85 m</text>

          <text x="280" y="208" fill="#6b7280">Grenzabstand</text>
          <text x="280" y="226" fontWeight="600" fontSize="14" fill="#111827">3.10 m</text>

          <text x="420" y="208" fill="#6b7280">Rechtsgrundlage</text>
          <text x="420" y="226" fontWeight="600" fontSize="14" fill="#111827">Art. 57 BayBO</text>
        </g>

        {/* Divider */}
        <line x1="40" y1="252" x2="600" y2="252" stroke="#e5e7eb" />

        {/* Checklist heading */}
        <text x="40" y="278" fontFamily="ui-mono, monospace" fontSize="10" fill="#117c78"
              letterSpacing="2">
          PFLICHTNACHWEISE · 3 OFFEN
        </text>

        {/* Checklist rows */}
        <g fontFamily="ui-sans-serif, sans-serif" fontSize="12">
          <rect x="40" y="294" width="560" height="40" rx="6" fill="#f1efe9" />
          <circle cx="60" cy="314" r="7" fill="#ffffff" stroke="#34b1a8" strokeWidth="2" />
          <text x="80" y="318" fill="#111827" fontWeight="600">Lageplan 1:500 mit Eintragung des Anbaus</text>
          <text x="540" y="318" fill="#117c78" fontWeight="600">Hochladen</text>

          <rect x="40" y="342" width="560" height="40" rx="6" fill="#f1efe9" />
          <circle cx="60" cy="362" r="7" fill="#ffffff" stroke="#34b1a8" strokeWidth="2" />
          <text x="80" y="366" fill="#111827" fontWeight="600">Grundrisszeichnung Carport, M 1:100</text>
          <text x="540" y="366" fill="#117c78" fontWeight="600">Hochladen</text>

          <rect x="40" y="390" width="560" height="40" rx="6" fill="#f1efe9" />
          <circle cx="60" cy="410" r="7" fill="#ffffff" stroke="#34b1a8" strokeWidth="2" />
          <text x="80" y="414" fill="#111827" fontWeight="600">Nachbarunterschriften (3 Anlieger)</text>
          <text x="540" y="414" fill="#117c78" fontWeight="600">Vorlage oeffnen</text>
        </g>
      </svg>
    </div>
  );
}
