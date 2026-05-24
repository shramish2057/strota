import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { CookieConsent } from '../components/cookie-consent';
import { SiteFooter } from '../components/site-footer';
import { fontBody, fontDisplay, fontMono } from '../styles/fonts';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Strota - Bauanträge. Schneller. Vollständig. Eingereicht.',
    template: '%s | Strota',
  },
  description:
    'AI-native Bauantragsplattform für Architekten, Bauträger und Planungsbüros in der DACH-Region. Verfahrensbestimmung, Vollständigkeitsprüfung, qeS-Signatur.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://strota.de'),
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://strota.de',
    siteName: 'Strota',
  },
  robots: {
    index: process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true',
    follow: process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">
          Zum Hauptinhalt springen
        </a>
        <main id="main">{children}</main>
        <SiteFooter />
        <CookieConsent />
      </body>
    </html>
  );
}
