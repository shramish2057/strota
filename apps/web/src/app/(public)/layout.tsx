import type { ReactNode } from 'react';
import { CookieConsent } from '../../components/cookie-consent';
import { SiteFooter } from '../../components/site-footer';

/**
 * Public marketing + legal layout. Wraps the homepage and the six legal pages
 * with the SiteFooter (Pflicht-Links) and the BGH-2024-compliant cookie banner.
 * Auth pages and /app routes use their own layouts and do NOT render this.
 */
export default function PublicLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <>
      <main>{children}</main>
      <SiteFooter />
      <CookieConsent />
    </>
  );
}
