import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a href="#main" className="skip-link">
            Zum Hauptinhalt springen
          </a>
          <main id="main">{children}</main>
          <SiteFooter />
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
