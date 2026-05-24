/**
 * Top-nav information architecture for Strota's marketing site.
 * Organized around the three German Bauantrags-Lebenszyklen: Planen, Sanieren,
 * Umbauen. Every label and item description is written in Strota's own voice;
 * scope claims are kept honest (Bayern live; other Länder are roadmap).
 */

export type NavItem = {
  title: string;
  href: string;
  description: string;
  badge?: 'Live' | 'Bayern' | 'Beta' | 'Roadmap';
};

export type NavCategory = {
  label: string;
  href: string;
  intro: {
    eyebrow: string;
    headline: string;
    body: string;
  };
  groups: { heading: string; items: NavItem[] }[];
  cta: { label: string; href: string };
};

export const PLANEN: NavCategory = {
  label: 'Planen',
  href: '/planen',
  intro: {
    eyebrow: 'Neubau und Erstprojekte',
    headline: 'Vom Grundstück bis zur Einreichung',
    body: 'Verfahren bestimmen, Unterlagen prüfen, qeS-signiert einreichen. Heute live für Bayern.',
  },
  groups: [
    {
      heading: 'Werkzeuge',
      items: [
        {
          title: 'Genehmigungsfrei-Prüfer',
          href: '/planen/genehmigungsfrei',
          description: 'In 60 Sekunden klären, ob Ihr Vorhaben überhaupt einen Antrag braucht.',
          badge: 'Live',
        },
        {
          title: 'Verfahrensbestimmung',
          href: '/planen/verfahren',
          description: 'Vereinfacht, Genehmigungsfrei oder Voll: deterministisch entschieden.',
          badge: 'Bayern',
        },
        {
          title: 'Vollständigkeitsprüfung',
          href: '/planen/vollstaendigkeit',
          description: 'Jedes Pflicht-Dokument der BauVorlV im Blick, bevor Sie einreichen.',
          badge: 'Bayern',
        },
        {
          title: 'Dokument-Analyse',
          href: '/planen/analyse',
          description: 'Pläne, Berechnungen, Nachweise: KI prüft auf Schlüssigkeit.',
          badge: 'Beta',
        },
      ],
    },
    {
      heading: 'Einreichung',
      items: [
        {
          title: 'qeS-Signatur',
          href: '/planen/qes',
          description: 'Qualifiziert elektronisch signieren, kompatibel mit eIDAS.',
          badge: 'Live',
        },
        {
          title: 'Digitaler Bauantrag',
          href: '/planen/einreichung',
          description: 'Direkt an den BayernPortal-Workflow oder XBau-Schnittstelle.',
          badge: 'Bayern',
        },
        {
          title: 'Bauvorlageberechtigung',
          href: '/planen/bvb-check',
          description: 'Prüfung gegen Listen der Architekten- und Ingenieurkammern.',
        },
      ],
    },
  ],
  cta: { label: 'Projekt anlegen', href: '/signup' },
};

export const SANIEREN: NavCategory = {
  label: 'Sanieren',
  href: '/sanieren',
  intro: {
    eyebrow: 'Bestand, Energie, Denkmal',
    headline: 'Sanierungspflichten klar beantwortet',
    body: 'GEG, Denkmalschutz, Förderprogramme: aufeinander abgestimmt geprüft.',
  },
  groups: [
    {
      heading: 'Pflichten erkennen',
      items: [
        {
          title: 'GEG-Sanierungspflicht-Check',
          href: '/sanieren/geg',
          description: 'Welche Modernisierungspflichten greifen bei Eigentümerwechsel oder Umbau?',
          badge: 'Roadmap',
        },
        {
          title: 'Denkmalschutz-Hinweis',
          href: '/sanieren/denkmal',
          description: 'Liegt Ihr Objekt im Denkmalbestand oder Ensemble? Was bedeutet das?',
          badge: 'Roadmap',
        },
        {
          title: 'Energieausweis-Pflicht',
          href: '/sanieren/energieausweis',
          description: 'Klarheit, wann ein Energieausweis verpflichtend wird.',
          badge: 'Roadmap',
        },
      ],
    },
    {
      heading: 'Förderung und Partner',
      items: [
        {
          title: 'Förderprogramm-Finder',
          href: '/sanieren/foerderung',
          description: 'BEG, KfW, Länderprogramme: für Ihr konkretes Vorhaben gefiltert.',
          badge: 'Roadmap',
        },
        {
          title: 'Energieberater-Verzeichnis',
          href: '/sanieren/energieberater',
          description: 'Zertifizierte Beraterinnen und Berater in Ihrer Region.',
          badge: 'Roadmap',
        },
      ],
    },
  ],
  cta: { label: 'Frühen Zugang anfragen', href: '/signup?intent=sanieren' },
};

export const UMBAUEN: NavCategory = {
  label: 'Umbauen',
  href: '/umbauen',
  intro: {
    eyebrow: 'Anbau, Aufstockung, Nutzungsänderung',
    headline: 'Bestehende Gebäude weiterdenken',
    body: 'Klärung, ob ein Bauantrag nötig wird, welche Auflagen greifen und welche Nachweise fehlen.',
  },
  groups: [
    {
      heading: 'Vorhaben prüfen',
      items: [
        {
          title: 'Nutzungsänderung-Prüfer',
          href: '/umbauen/nutzungsaenderung',
          description: 'Vom Büro zur Wohnung, von Lager zu Werkstatt: Folgen aus BauO und BauNVO.',
          badge: 'Roadmap',
        },
        {
          title: 'Anbau und Aufstockung',
          href: '/umbauen/anbau',
          description: 'Maße, Grenzabstände, Statik-Voranzeige.',
          badge: 'Roadmap',
        },
        {
          title: 'Innen-Umbau',
          href: '/umbauen/innen',
          description: 'Wann tragender Eingriff, wann genehmigungsfrei?',
          badge: 'Roadmap',
        },
      ],
    },
    {
      heading: 'Pflichtnachweise',
      items: [
        {
          title: 'Brandschutz-Anforderungen',
          href: '/umbauen/brandschutz',
          description: 'F-90, Rettungswege, Brandwand: was Ihr Vorhaben auslöst.',
          badge: 'Roadmap',
        },
        {
          title: 'Statik-Voranzeige',
          href: '/umbauen/statik',
          description: 'Wann ein Standsicherheitsnachweis verpflichtend wird.',
          badge: 'Roadmap',
        },
      ],
    },
  ],
  cta: { label: 'Frühen Zugang anfragen', href: '/signup?intent=umbauen' },
};

export const RESSOURCEN: NavCategory = {
  label: 'Ressourcen',
  href: '/ressourcen',
  intro: {
    eyebrow: 'Wissen und Werkzeuge',
    headline: 'Bauantragswissen für die Praxis',
    body: 'Bibliothek, Blog, Vorlagen und Webinare: für Architektinnen, Planer und Behörden.',
  },
  groups: [
    {
      heading: 'Bibliothek',
      items: [
        {
          title: 'BauO-Bibliothek',
          href: '/ressourcen/bibliothek',
          description: 'Volltext-Suche über Landesbauordnungen, DVO und Satzungen.',
          badge: 'Bayern',
        },
        {
          title: 'Vorlagen und Checklisten',
          href: '/ressourcen/vorlagen',
          description: 'Pflichtdokumente, Antragsformulare, Bauvorlagen.',
        },
        {
          title: 'Glossar',
          href: '/ressourcen/glossar',
          description: 'Bauantrags-Begriffe verständlich erklärt.',
        },
      ],
    },
    {
      heading: 'Lesen und lernen',
      items: [
        {
          title: 'Blog',
          href: '/ressourcen/blog',
          description: 'Praxisberichte, Gesetzesänderungen, Best Practices.',
        },
        {
          title: 'Webinare',
          href: '/ressourcen/webinare',
          description: 'Aufzeichnungen und Live-Termine, ohne Anmeldepflicht.',
        },
        {
          title: 'Roadmap',
          href: '/ressourcen/roadmap',
          description: 'Was wir wann freischalten, transparent dokumentiert.',
        },
      ],
    },
  ],
  cta: { label: 'Newsletter abonnieren', href: '/ressourcen/newsletter' },
};

export const CATEGORIES: NavCategory[] = [PLANEN, SANIEREN, UMBAUEN, RESSOURCEN];

export const PRIMARY_LINKS: { label: string; href: string }[] = [{ label: 'Preise', href: '/preise' }];
