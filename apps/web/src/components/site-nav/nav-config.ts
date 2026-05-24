/**
 * Strota site-nav information architecture, derived from the v5.0 Product Bible.
 * Top-level axis = customer lifecycle (Planen / Sanieren / Umbauen). Each
 * dropdown lists the actual product surfaces (S1..S4) and workflow modules
 * (M0..M8) the bible defines, scoped to the lifecycle where they are most
 * load-bearing. A separate Tools dropdown surfaces the four free public
 * surfaces regardless of lifecycle. Behoerden lives inside Ressourcen.
 *
 * Status discipline: every item carries a status badge derived from the
 * phase-plan. Live = Phase 3.5 ready in Bayern. Bayern = corpus-complete for
 * Bayern only. Beta = behind feature flag. Roadmap = not yet shipped.
 */

export type NavBadge = 'Live' | 'Bayern' | 'Beta' | 'Roadmap' | 'Kostenlos';

export type NavItem = {
  title: string;
  href: string;
  description: string;
  badge?: NavBadge;
};

export type NavGroup = {
  heading: string;
  items: NavItem[];
};

export type NavCategory = {
  label: string;
  href: string;
  intro: {
    eyebrow: string;
    headline: string;
    body: string;
  };
  groups: NavGroup[];
  cta: { label: string; href: string };
};

/* -------------------------------------------------------------------------- */
/* PLANEN — Neubau, EFH/MFH, Gewerbe, Sonderbau                               */
/* -------------------------------------------------------------------------- */

export const PLANEN: NavCategory = {
  label: 'Planen',
  href: '/planen',
  intro: {
    eyebrow: 'Neubau & Erstprojekte',
    headline: 'Vom Grundstueck bis zur qeS-Einreichung',
    body: 'EFH, MFH, Gewerbe, Sonderbau. Strota fuehrt das gesamte Verfahren von der Standortfrage bis zur signierten Einreichung.',
  },
  groups: [
    {
      heading: 'Vor der Antragstellung',
      items: [
        {
          title: 'Genehmigungsfrei-Pruefer',
          href: '/genehmigungsfrei',
          description: 'In 30 Sekunden klaeren, ob das Vorhaben antragspflichtig ist.',
          badge: 'Kostenlos',
        },
        {
          title: 'Verfahrensbestimmung',
          href: '/plattform/verfahrensbestimmung',
          description: 'Genehmigungsfreistellung, vereinfachtes, volles oder Sonderbauverfahren, deterministisch entschieden.',
          badge: 'Bayern',
        },
        {
          title: 'B-Plan-Analyzer',
          href: '/plattform/bplan-analyzer',
          description: 'GRZ, GFZ, Trauf- und Firsthoehe, Abstandsflaechen gegen den B-Plan abgleichen.',
          badge: 'Bayern',
        },
        {
          title: 'Anforderungs-Mapper',
          href: '/plattform/anforderungs-mapper',
          description: 'Pflicht-Dokumente aus BauVorlV und Land-Spezifika fuer Ihr Vorhaben ableiten.',
          badge: 'Bayern',
        },
      ],
    },
    {
      heading: 'Antrag erstellen & einreichen',
      items: [
        {
          title: 'Baubeschreibungs-Generator',
          href: '/plattform/baubeschreibung',
          description: 'KI-gestuetzt, paragraphengenau zitiert, mit Architekten-Confirmation-Gate.',
          badge: 'Beta',
        },
        {
          title: 'Vollstaendigkeitspruefer',
          href: '/plattform/vollstaendigkeit',
          description: 'Schicht 1 bis 4: Praesenz, Format, Inhalt, Fachpruefung. Confidence Score pro Dokument.',
          badge: 'Bayern',
        },
        {
          title: 'qeS-Einreichung',
          href: '/plattform/qes',
          description: 'eIDAS-qualifiziert, PAdES-LTV, Mehrpersonen-Workflow fuer Bauherrengemeinschaft.',
          badge: 'Beta',
        },
        {
          title: 'Kalkulationen & Baugebuehren',
          href: '/plattform/kalkulationen',
          description: 'HOAI-Honorar, Baugebuehren je Bauamt, Stellplatzabloese, Baulastenauskunft.',
          badge: 'Roadmap',
        },
      ],
    },
  ],
  cta: { label: 'Neubau-Projekt anlegen', href: '/signup?intent=planen' },
};

/* -------------------------------------------------------------------------- */
/* SANIEREN — Bestand, Energie, Denkmal                                       */
/* -------------------------------------------------------------------------- */

export const SANIEREN: NavCategory = {
  label: 'Sanieren',
  href: '/sanieren',
  intro: {
    eyebrow: 'Bestand, Energie, Denkmal',
    headline: 'Sanierungspflichten ohne Ueberraschungen',
    body: 'GEG, Denkmalschutz, BEG-Foerderung: aufeinander abgestimmt geprueft, bevor Sie ein Angebot abgeben.',
  },
  groups: [
    {
      heading: 'Pflichten erkennen',
      items: [
        {
          title: 'Genehmigungsfrei-Pruefer',
          href: '/genehmigungsfrei?intent=sanieren',
          description: 'Viele Sanierungsmassnahmen sind verfahrensfrei. Strota klaert es in 30 Sekunden.',
          badge: 'Kostenlos',
        },
        {
          title: 'Dokument-Analyse',
          href: '/analyse',
          description: 'Alte Baugenehmigung, GEG-Bescheid oder Energieausweis hochladen, Strota liest.',
          badge: 'Kostenlos',
        },
        {
          title: 'GEG-Sanierungspflicht-Check',
          href: '/sanieren/geg',
          description: 'Welche Modernisierungspflichten greifen nach Eigentuemerwechsel oder Umbau?',
          badge: 'Roadmap',
        },
        {
          title: 'Begleitende Genehmigungen',
          href: '/plattform/begleitende-genehmigungen',
          description: 'Denkmalschutz, Wasserrecht, Naturschutz: parallele Verfahren sichtbar machen.',
          badge: 'Bayern',
        },
      ],
    },
    {
      heading: 'Planen, foerdern, dokumentieren',
      items: [
        {
          title: 'Vollstaendigkeitspruefer',
          href: '/plattform/vollstaendigkeit?intent=sanieren',
          description: 'GEG-Nachweise, EnEV-Berechnungen, Bestandsdokumentation auf Vollstaendigkeit.',
          badge: 'Bayern',
        },
        {
          title: 'Foerderprogramm-Finder',
          href: '/sanieren/foerderung',
          description: 'BEG, KfW, Laender-Programme: nach Ihrem Vorhaben gefiltert, mit Antragspfad.',
          badge: 'Roadmap',
        },
        {
          title: 'Post-Approval & Bautagebuch',
          href: '/plattform/post-approval',
          description: 'Geltungsdauer-Countdowns, Foerderbescheid-Fristen, Tekturplan.',
          badge: 'Roadmap',
        },
        {
          title: 'Standardschreiben & Nachbarbeteiligung',
          href: '/plattform/standardschreiben',
          description: 'Geruestaufbau-Anzeige, Nachbar-Zustimmung, Bauamt-Korrespondenz.',
          badge: 'Roadmap',
        },
      ],
    },
  ],
  cta: { label: 'Sanierungs-Projekt anlegen', href: '/signup?intent=sanieren' },
};

/* -------------------------------------------------------------------------- */
/* UMBAUEN — Anbau, Aufstockung, Nutzungsaenderung, Abbruch                   */
/* -------------------------------------------------------------------------- */

export const UMBAUEN: NavCategory = {
  label: 'Umbauen',
  href: '/umbauen',
  intro: {
    eyebrow: 'Anbau, Aufstockung, Nutzungsaenderung',
    headline: 'Bestandsgebaeude weiterdenken',
    body: 'Klarheit, ob ueberhaupt ein Antrag noetig wird, welche Auflagen greifen, welche Nachweise fehlen.',
  },
  groups: [
    {
      heading: 'Vorhaben einordnen',
      items: [
        {
          title: 'Genehmigungsfrei-Pruefer',
          href: '/genehmigungsfrei?intent=umbauen',
          description: 'Anbau, Garage, Carport, Wintergarten: oft verfahrensfrei unter Schwellenwerten.',
          badge: 'Kostenlos',
        },
        {
          title: 'Verfahrensbestimmung mit Nutzungsaenderung',
          href: '/plattform/verfahrensbestimmung?intent=umbauen',
          description: 'Nutzungsaenderung Buero zu Wohnen kann Sonderbau ausloesen. Strota erkennt das.',
          badge: 'Bayern',
        },
        {
          title: 'B-Plan-Analyzer mit §31 Abweichung',
          href: '/plattform/bplan-analyzer?modus=abweichung',
          description: 'Befreiung versus Ausnahme nach §31 BauGB, sauber getrennt.',
          badge: 'Bayern',
        },
        {
          title: 'Dokument-Analyse',
          href: '/analyse?intent=umbauen',
          description: 'Alte Baugenehmigung interpretieren, bevor Sie in den Bestand eingreifen.',
          badge: 'Kostenlos',
        },
      ],
    },
    {
      heading: 'Auflagen und Nachbarn',
      items: [
        {
          title: 'Vollstaendigkeitspruefer fuer Umbau',
          href: '/plattform/vollstaendigkeit?intent=umbauen',
          description: 'Brandschutzkonzept, Statik-Voranzeige, Bestandsplaene: was bei Eingriff noetig wird.',
          badge: 'Bayern',
        },
        {
          title: 'Standardschreiben & Nachbarbeteiligung',
          href: '/plattform/standardschreiben',
          description: 'Nachbar-Unterschriftensammlung, Anhoerungsbriefe, Vorbescheids-Antrag §71.',
          badge: 'Roadmap',
        },
        {
          title: 'Baubeschreibungs-Generator',
          href: '/plattform/baubeschreibung?intent=umbauen',
          description: 'Beschreibung der Aenderung mit Bezug auf Bestandsdokumentation.',
          badge: 'Beta',
        },
        {
          title: 'Begleitende Genehmigungen',
          href: '/plattform/begleitende-genehmigungen?intent=umbauen',
          description: 'Wasserrecht beim Abbruch, Naturschutz bei Aufstockung, Immissionsschutz.',
          badge: 'Bayern',
        },
      ],
    },
  ],
  cta: { label: 'Umbau-Projekt anlegen', href: '/signup?intent=umbauen' },
};

/* -------------------------------------------------------------------------- */
/* TOOLS — die vier freien public surfaces (S1..S4) plus Bibliothek + Q&A     */
/* -------------------------------------------------------------------------- */

export const TOOLS: NavCategory = {
  label: 'Tools',
  href: '/tools',
  intro: {
    eyebrow: 'Kostenlose Werkzeuge',
    headline: 'Vier oeffentliche Werkzeuge, kein Konto noetig',
    body: 'Strota-Hauptfunktionen als oeffentliche Surfaces. Reichen fuer 80 % der Fragen, die in Architekturbueros taeglich aufschlagen.',
  },
  groups: [
    {
      heading: 'Pruefen & analysieren',
      items: [
        {
          title: 'Genehmigungsfrei-Pruefer',
          href: '/genehmigungsfrei',
          description: 'Adresse plus Vorhaben: in 30 Sekunden Verfahrensfreiheit klaeren.',
          badge: 'Kostenlos',
        },
        {
          title: 'Strota Fragt',
          href: '/fragen',
          description: 'Baurechts-Fragen mit Paragraph-Zitat. Keine Halluzination, jede Antwort verlinkt.',
          badge: 'Beta',
        },
        {
          title: 'Dokument-Analyse',
          href: '/analyse',
          description: 'Nachforderungsschreiben, B-Plan, Satzung hochladen: Strota analysiert.',
          badge: 'Kostenlos',
        },
      ],
    },
    {
      heading: 'Wissen & Bibliothek',
      items: [
        {
          title: 'Bibliothek',
          href: '/bibliothek',
          description: 'LBO, BauVorlV, Satzungen je Gemeinde. Strukturiert, zitierbar, mit Stand-Datum.',
          badge: 'Bayern',
        },
        {
          title: 'Vorlagen & Checklisten',
          href: '/bibliothek/vorlagen',
          description: 'Antragsformulare, Pflichtdokumente, Stempel- und Briefkopf-Templates.',
          badge: 'Roadmap',
        },
        {
          title: 'Glossar',
          href: '/bibliothek/glossar',
          description: 'GRZ, GFZ, Vollgeschoss, qeS: Bauantrags-Begriffe nuechtern erklaert.',
          badge: 'Roadmap',
        },
      ],
    },
  ],
  cta: { label: 'Alle Tools ansehen', href: '/tools' },
};

/* -------------------------------------------------------------------------- */
/* RESSOURCEN — Blog, Webinare, Roadmap, Strota Kommune (B2G), Status         */
/* -------------------------------------------------------------------------- */

export const RESSOURCEN: NavCategory = {
  label: 'Ressourcen',
  href: '/ressourcen',
  intro: {
    eyebrow: 'Lesen, lernen, integrieren',
    headline: 'Bauantragswissen fuer die Praxis',
    body: 'Blog, Webinare, Produkt-Roadmap, Status-Seite. Plus Strota Kommune fuer Bauaufsichtsbehoerden.',
  },
  groups: [
    {
      heading: 'Lernen',
      items: [
        {
          title: 'Blog',
          href: '/ressourcen/blog',
          description: 'Gesetzesaenderungen, Best Practices, Fallberichte.',
        },
        {
          title: 'Webinare',
          href: '/ressourcen/webinare',
          description: 'Aufzeichnungen und Live-Termine. Keine Anmeldepflicht fuer Aufzeichnungen.',
        },
        {
          title: 'FAQ',
          href: '/ressourcen/faq',
          description: 'Antworten auf die haeufigsten Fragen aus Architekturbueros.',
        },
      ],
    },
    {
      heading: 'Bauen mit uns',
      items: [
        {
          title: 'Strota Kommune',
          href: '/kommune',
          description: 'B2G-Produkt fuer Bauaufsichtsbehoerden: Buerger-Chat, Eingangs-Screening, Wissensassistent.',
          badge: 'Roadmap',
        },
        {
          title: 'Roadmap',
          href: '/ressourcen/roadmap',
          description: 'Was wir wann freischalten, transparent dokumentiert.',
        },
        {
          title: 'Status',
          href: '/status',
          description: 'Live-Verfuegbarkeit aller Services. Auto-Update.',
        },
        {
          title: 'Entwickler-API',
          href: '/ressourcen/api',
          description: 'OpenAPI v3.1, OAuth2, XBau-Submit. Bauträger-Plan und Enterprise.',
          badge: 'Roadmap',
        },
      ],
    },
  ],
  cta: { label: 'Newsletter abonnieren', href: '/ressourcen/newsletter' },
};

export const CATEGORIES: NavCategory[] = [PLANEN, SANIEREN, UMBAUEN, TOOLS, RESSOURCEN];

export const PRIMARY_LINKS: { label: string; href: string }[] = [
  { label: 'Preise', href: '/preise' },
];
