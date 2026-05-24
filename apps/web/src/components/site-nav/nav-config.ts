/**
 * Strota site-nav, audience-first per bible §0.7 Precise ICP and §0.8 Funnel.
 * Top-level = who you are. Each dropdown shows the bible features + pricing
 * tier relevant to that audience. Free public surfaces (S1..S4) appear inside
 * the relevant audience menus instead of in their own dropdown.
 *
 * Tiers per bible §1.4 Pricing:
 *   Architekt:innen  -> Freiberufler 29 EUR/mo
 *   Buero            -> Buero 79 EUR/mo
 *   Bautraeger       -> Bautraeger 299 EUR/mo + Enterprise custom
 *   Behoerden        -> Strota Kommune 8.000-60.000 EUR/year
 */

export type NavBadge = 'Live' | 'Bayern' | 'Beta' | 'Roadmap' | 'Kostenlos' | 'KI';

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
/* Architekt:innen — Freiberufler tier (29 EUR/mo)                            */
/* -------------------------------------------------------------------------- */

export const ARCHITEKTEN: NavCategory = {
  label: 'Architekt:innen',
  href: '/fuer/architekten',
  intro: {
    eyebrow: 'Solo & Freiberufler',
    headline: 'Bauantraege in Stunden statt Wochen',
    body: 'Acht KI-gestuetzte Module von der Verfahrensbestimmung bis zur qeS-Einreichung. Ab 29 EUR pro Monat, Bayern heute live.',
  },
  groups: [
    {
      heading: 'Sofort kostenlos starten',
      items: [
        {
          title: 'Genehmigungsfrei-Pruefer',
          href: '/genehmigungsfrei',
          description: '30 Sekunden Verfahrensfreiheits-Check statt 45 Minuten LBO-Recherche.',
          badge: 'Kostenlos',
        },
        {
          title: 'Strota Fragt',
          href: '/fragen',
          description: 'Baurecht-Antworten mit Paragraph-Zitat. Keine Halluzination, jede Stelle verlinkt.',
          badge: 'KI',
        },
        {
          title: 'Dokument-Analyse',
          href: '/analyse',
          description: 'Nachforderungs-Brief oder B-Plan hochladen, in 60 Sekunden strukturiert verstehen.',
          badge: 'KI',
        },
      ],
    },
    {
      heading: 'Im Abo (ab 29 EUR/Monat)',
      items: [
        {
          title: 'Verfahrensbestimmung',
          href: '/plattform/verfahrensbestimmung',
          description: 'Genehmigungsfrei, Freistellung, vereinfacht, Voll- oder Sonderbau, deterministisch entschieden.',
          badge: 'Bayern',
        },
        {
          title: 'Vollstaendigkeits-Pruefer',
          href: '/plattform/vollstaendigkeit',
          description: 'Schicht 1 bis 4: Praesenz, Format, Inhalt, Fachpruefung. Confidence-Score pro Dokument.',
          badge: 'Bayern',
        },
        {
          title: 'Baubeschreibungs-Generator',
          href: '/plattform/baubeschreibung',
          description: 'KI schreibt, Sie pruefen. Streaming-Generierung, Architekt-Confirmation-Gate, paragraphengenau zitiert.',
          badge: 'KI',
        },
        {
          title: 'B-Plan-Analyzer',
          href: '/plattform/bplan-analyzer',
          description: 'GRZ, GFZ, Trauf-/Firsthoehe, §31-Abweichungen gegen den B-Plan abgeglichen.',
          badge: 'Bayern',
        },
        {
          title: 'qeS-Einreichung',
          href: '/plattform/qes',
          description: 'eIDAS-qualifiziert, PAdES-LTV, Mehrpersonen-Workflow fuer Bauherrengemeinschaften.',
          badge: 'Beta',
        },
        {
          title: 'Bibliothek',
          href: '/bibliothek',
          description: 'LBO, BauVorlV, DVO, Gemeinde-Satzungen. Strukturiert, zitierbar, stets aktuell.',
          badge: 'Bayern',
        },
      ],
    },
  ],
  cta: { label: 'Kostenlos starten', href: '/signup?tier=freiberufler' },
};

/* -------------------------------------------------------------------------- */
/* Buero — Buero tier (79 EUR/mo, 2-15 person offices)                        */
/* -------------------------------------------------------------------------- */

export const BUEROS: NavCategory = {
  label: 'Büros',
  href: '/fuer/bueros',
  intro: {
    eyebrow: '2 bis 15 Personen',
    headline: 'Die ganze Bauantragsorganisation in einem System',
    body: 'Team-Collaboration, Fachplaner-Anbindung, Multi-Standort, Statistik. Ab 79 EUR pro Monat fuer das gesamte Buero.',
  },
  groups: [
    {
      heading: 'Zusammenarbeit',
      items: [
        {
          title: 'Team-Collaboration',
          href: '/fuer/bueros/team',
          description: 'Rollen Owner / Admin / Member / Viewer, Activity-Feed, @mention-Kommentare, Aufgabenverwaltung.',
        },
        {
          title: 'Fachplaner-Anbindung',
          href: '/fuer/bueros/fachplaner',
          description: 'Tragwerksplaner, Energieberater, Brandschutz, OebVI per Guest-Link oder Light-Konto eingebunden.',
        },
        {
          title: 'Bauherr-Self-Service',
          href: '/fuer/bueros/bauherr',
          description: 'Bauherr fuellt eigene Stammdaten und laedt Eigentumsnachweise hoch. DE/EN/TR/RU/AR.',
        },
        {
          title: 'Multi-Standort-Verwaltung',
          href: '/fuer/bueros/standorte',
          description: 'Niederlassungen Muenchen, Berlin, Hamburg getrennt mit eigenen Briefkoepfen und Stempeln.',
        },
      ],
    },
    {
      heading: 'Effizienz und Belege',
      items: [
        {
          title: 'Alle 8 Plattform-Module',
          href: '/plattform',
          description: 'Verfahrensbestimmung bis qeS-Einreichung, alles inklusive.',
          badge: 'Bayern',
        },
        {
          title: 'Statistik-Dashboard',
          href: '/fuer/bueros/statistik',
          description: 'Antraege pro Quartal, Erfolgs-Quote, Nachforderungs-Quote, HOAI-Tracking, CSV-Export.',
        },
        {
          title: 'Custom Briefkopf & Stempel',
          href: '/fuer/bueros/branding',
          description: 'BVB-Stempel, Architektenstempel, Logo. Briefe und Bauantraege im Buero-Branding rendern.',
        },
        {
          title: 'Versicherungs-Verwaltung',
          href: '/fuer/bueros/versicherung',
          description: 'Berufshaftpflicht und Vermoegensschaden zentral; Ablauf-Alert 30 und 7 Tage vorher.',
        },
      ],
    },
  ],
  cta: { label: 'Buero-Demo buchen', href: '/demo?tier=buero' },
};

/* -------------------------------------------------------------------------- */
/* Bautraeger — Bautraeger tier (299 EUR/mo) + Enterprise custom              */
/* -------------------------------------------------------------------------- */

export const BAUTRAEGER: NavCategory = {
  label: 'Bauträger',
  href: '/fuer/bautraeger',
  intro: {
    eyebrow: 'Bauträger & Enterprise',
    headline: 'Pipelines im Dutzend, API ueberall',
    body: 'REST-API, XBau-Submit, dedizierter Customer-Success. Ab 299 EUR pro Monat; Enterprise-Optionen mit Single-Tenant und BSI-C5 auf Anfrage.',
  },
  groups: [
    {
      heading: 'Pipeline-Skalierung',
      items: [
        {
          title: 'Unbegrenzte Projekte & Sitze',
          href: '/fuer/bautraeger#projekte',
          description: 'Komplette Bauantragsorganisation in einer Instanz, jede Niederlassung mit eigenen Standorten.',
        },
        {
          title: 'Public REST API',
          href: '/fuer/bautraeger/api',
          description: 'OpenAPI v3.1, OAuth2 + API-Keys, Rate-Limit und Quota-Policy, semver mit Deprecation-Window.',
          badge: 'Beta',
        },
        {
          title: 'XBau-Submit-Schnittstelle',
          href: '/fuer/bautraeger/xbau',
          description: 'XBau 2.x XML-Generierung, Portal-Submit (Bayern, NRW, HH, Berlin), Bestaetigungs-Tracking.',
          badge: 'Beta',
        },
        {
          title: 'Prüfer-Track-UI',
          href: '/fuer/bautraeger/pruefer',
          description: 'Statik-, Brandschutz-, Sachverstaendigen-Workflow integriert.',
          badge: 'Roadmap',
        },
      ],
    },
    {
      heading: 'Enterprise-Optionen',
      items: [
        {
          title: 'Dedizierte Mandanten-Instanz',
          href: '/fuer/bautraeger/enterprise#single-tenant',
          description: 'Eigene Postgres, eigener qeS-Pool, eigene Backup-Region auf Hetzner.',
          badge: 'Roadmap',
        },
        {
          title: 'On-Premise-Deployment',
          href: '/fuer/bautraeger/enterprise#on-prem',
          description: 'Container-Deployment auf Ihrer Infrastruktur fuer maximale Datensouveraenitaet.',
          badge: 'Roadmap',
        },
        {
          title: 'BSI-C5-Type-2-Attestierung',
          href: '/fuer/bautraeger/enterprise#bsi',
          description: 'Geplant Phase 25+. Status auf der Roadmap-Seite transparent dokumentiert.',
          badge: 'Roadmap',
        },
        {
          title: 'SLA 99,9 % + 24/7-Hotline',
          href: '/fuer/bautraeger/sla',
          description: 'Dediziertes Customer-Success-Team plus Site-Reliability-Bereitschaft.',
          badge: 'Roadmap',
        },
      ],
    },
  ],
  cta: { label: 'Sales kontaktieren', href: '/kontakt?tier=bautraeger' },
};

/* -------------------------------------------------------------------------- */
/* Behoerden — Strota Kommune (8.000 - 60.000 EUR/year)                       */
/* -------------------------------------------------------------------------- */

export const BEHOERDEN: NavCategory = {
  label: 'Behörden',
  href: '/kommune',
  intro: {
    eyebrow: 'Strota Kommune · B2G',
    headline: 'Buergeranfragen halbieren, Eingaenge vorpruefen',
    body: 'Bauaufsichtsbehoerden bekommen einen Buerger-Chat, ein Eingangs-Screening und einen internen Wissensassistenten. EVB-IT-konform, DSGVO und BSI auf Pfad.',
  },
  groups: [
    {
      heading: 'Buergerseite',
      items: [
        {
          title: 'Buerger-Chat',
          href: '/kommune/buerger-chat',
          description: 'Vorqualifizierende KI auf Ihrer Behoerden-Website. Reduziert einfache Anfragen um 60 bis 75 Prozent.',
          badge: 'KI',
        },
        {
          title: 'Eingangs-Screening',
          href: '/kommune/eingangs-screening',
          description: 'Pre-Check eingehender Antraege auf offensichtliche Unvollstaendigkeit, bevor der Sachbearbeiter sie sieht.',
          badge: 'Roadmap',
        },
      ],
    },
    {
      heading: 'Behoerdenseite & Integration',
      items: [
        {
          title: 'Interner Wissensassistent',
          href: '/kommune/wissensassistent',
          description: 'LBO-Fragen mit Paragraph-Zitat fuer Sachbearbeiter, beschleunigt Bescheid-Recherche.',
          badge: 'KI',
        },
        {
          title: 'Standardantworten-Bibliothek',
          href: '/kommune/standardantworten',
          description: 'Vorgefertigte zitierte Antworten fuer die haeufigsten Anfragen, im Behoerden-Briefkopf.',
        },
        {
          title: 'XBau-Empfangsschnittstelle',
          href: '/kommune/xbau',
          description: 'Strukturierte Antragsdaten aus jedem Portal, einheitlich konvertiert.',
          badge: 'Roadmap',
        },
        {
          title: 'EVB-IT-Cloud-Vertrag',
          href: '/kommune/evb-it',
          description: 'Standardvertrag des Bundes plus DSGVO-AVV, Sub-Processor-Anlage, BSI-C5-Pfad.',
        },
      ],
    },
  ],
  cta: { label: 'Pilot anfragen (kostenfrei 90 Tage)', href: '/kontakt?tier=kommune' },
};

/* -------------------------------------------------------------------------- */
/* Ressourcen                                                                 */
/* -------------------------------------------------------------------------- */

export const RESSOURCEN: NavCategory = {
  label: 'Ressourcen',
  href: '/ressourcen',
  intro: {
    eyebrow: 'Lesen, lernen, integrieren',
    headline: 'Bauantragswissen offen dokumentiert',
    body: 'Bibliothek, Blog, Webinare, Status-Seite, Roadmap und Entwickler-API.',
  },
  groups: [
    {
      heading: 'Wissen',
      items: [
        {
          title: 'Bibliothek',
          href: '/bibliothek',
          description: 'LBO, BauVorlV, DVO, Satzungen, Erlasse. Volltext, strukturiert, mit Stand-Datum.',
          badge: 'Bayern',
        },
        {
          title: 'Blog',
          href: '/ressourcen/blog',
          description: 'Gesetzesaenderungen, Best Practices, Fallberichte aus der Pilotphase.',
        },
        {
          title: 'Webinare',
          href: '/ressourcen/webinare',
          description: 'Live-Termine und Aufzeichnungen, ohne Anmeldepflicht.',
        },
        {
          title: 'FAQ',
          href: '/ressourcen/faq',
          description: 'Die haeufigsten Fragen aus Architekturbueros zur Strota-Plattform.',
        },
      ],
    },
    {
      heading: 'Transparenz & Integration',
      items: [
        {
          title: 'Roadmap',
          href: '/ressourcen/roadmap',
          description: 'Was wir wann freischalten, offen dokumentiert. Pro Bundesland und pro Modul.',
        },
        {
          title: 'Status',
          href: '/status',
          description: 'Live-Verfuegbarkeit aller Strota-Services. Auto-Update.',
        },
        {
          title: 'Entwickler-API',
          href: '/ressourcen/api',
          description: 'OpenAPI v3.1, OAuth2, XBau-Submit. Bautraeger-Plan und Enterprise.',
          badge: 'Beta',
        },
        {
          title: 'Strota Kommune',
          href: '/kommune',
          description: 'B2G-Produkt fuer Bauaufsichtsbehoerden. Im Buergerinnen-Kontakt einsetzbar.',
        },
      ],
    },
  ],
  cta: { label: 'Newsletter abonnieren', href: '/ressourcen/newsletter' },
};

export const CATEGORIES: NavCategory[] = [ARCHITEKTEN, BUEROS, BAUTRAEGER, BEHOERDEN, RESSOURCEN];

export const PRIMARY_LINKS: { label: string; href: string }[] = [
  { label: 'Preise', href: '/preise' },
];
