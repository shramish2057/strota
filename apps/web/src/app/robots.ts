import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://strota.de';

export default function robots(): MetadataRoute.Robots {
  const allowIndex = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';
  if (!allowIndex) {
    // Staging / dev: lock everything out so we never end up indexed accidentally.
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/app/',
          '/login',
          '/signup',
          '/verify-email',
          '/magic-link',
          '/magic-login',
          '/passwort-zuruecksetzen',
          '/healthz',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
