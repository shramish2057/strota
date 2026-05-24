/**
 * JSON-LD structured data for SEO and rich results.
 * Rendered inline via <script type="application/ld+json">; safe because we
 * stringify with JSON.stringify (no XSS risk from arbitrary data).
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://strota.de';

export function OrganizationJsonLd(): JSX.Element {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Strota',
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
    sameAs: ['https://github.com/shramish2057/strota'],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'hallo@strota.de',
        areaServed: ['DE', 'AT', 'CH'],
        availableLanguage: ['de'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'security',
        email: 'security@strota.de',
        availableLanguage: ['de', 'en'],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function SoftwareApplicationJsonLd(): JSX.Element {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Strota',
    operatingSystem: 'Web',
    applicationCategory: 'BusinessApplication',
    inLanguage: 'de',
    description:
      'AI-native Bauantragsplattform für Architekten, Bauträger und Planungsbüros in der DACH-Region. Verfahrensbestimmung, Vollständigkeitsprüfung, qeS-Signatur.',
    url: SITE_URL,
    offers: [
      {
        '@type': 'Offer',
        name: 'Freiberufler',
        price: '29',
        priceCurrency: 'EUR',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '29',
          priceCurrency: 'EUR',
          unitText: 'Monat',
        },
      },
      {
        '@type': 'Offer',
        name: 'Büro',
        price: '79',
        priceCurrency: 'EUR',
      },
      {
        '@type': 'Offer',
        name: 'Bauträger',
        price: '299',
        priceCurrency: 'EUR',
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
