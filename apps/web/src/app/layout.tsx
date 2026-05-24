import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import type { ReactNode } from 'react';
import { OrganizationJsonLd } from '../components/seo/json-ld';
import { fontBody, fontDisplay, fontMono } from '../styles/fonts';
import '../styles/globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://strota.de';
const ALLOW_INDEXING = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';

export const metadata: Metadata = {
  title: {
    default: 'Strota - Bauanträge. Schneller. Vollständig. Eingereicht.',
    template: '%s | Strota',
  },
  description:
    'AI-native Bauantragsplattform für Architekten, Bauträger und Planungsbüros in der DACH-Region. Verfahrensbestimmung, Vollständigkeitsprüfung, qeS-Signatur.',
  metadataBase: new URL(SITE_URL),
  applicationName: 'Strota',
  authors: [{ name: 'Strota' }],
  creator: 'Strota',
  keywords: [
    'Bauantrag',
    'Bauantragsplattform',
    'Architekt',
    'Genehmigungsfreiheit',
    'Vollständigkeitsprüfung',
    'BayBO',
    'BauVorlV',
    'BauGB',
    'qeS',
    'XBau',
    'DACH',
  ],
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: SITE_URL,
    siteName: 'Strota',
    title: 'Strota - Bauanträge. Schneller. Vollständig. Eingereicht.',
    description:
      'AI-native Bauantragsplattform für Architekten, Bauträger und Planungsbüros in der DACH-Region.',
    images: [
      { url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Strota' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strota - Bauanträge. Schneller. Vollständig. Eingereicht.',
    description:
      'AI-native Bauantragsplattform für Architekten, Bauträger und Planungsbüros in der DACH-Region.',
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: SITE_URL,
    languages: { 'de-DE': SITE_URL },
  },
  robots: {
    index: ALLOW_INDEXING,
    follow: ALLOW_INDEXING,
    nocache: !ALLOW_INDEXING,
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
    >
      <body>
        <OrganizationJsonLd />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a href="#main" className="skip-link">
            Zum Hauptinhalt springen
          </a>
          <div id="main">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
