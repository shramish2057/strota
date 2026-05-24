import type { ReactNode } from 'react';
import { CookieConsent } from '../../components/cookie-consent';
import { SiteFooter } from '../../components/site-footer';
import { SiteNav } from '../../components/site-nav';

/**
 * Public marketing + legal layout. Wraps the homepage and the six legal pages
 * with SiteNav (sticky top), SiteFooter (Pflicht-Links + 16 Bundeslaender) and
 * the BGH-2024-compliant cookie banner. Auth pages and /app routes use their
 * own layouts and do NOT render this.
 */
export default function PublicLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <>
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
      <CookieConsent />
    </>
  );
}
