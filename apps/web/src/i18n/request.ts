import { getRequestConfig } from 'next-intl/server';

/**
 * Strota ships German as the primary locale. AT and CH variants follow in
 * Phase 26/27. Single-locale config keeps URLs clean (no /de/ prefix) and
 * lets messages flow through next-intl's RSC + client provider helpers.
 */
export const DEFAULT_LOCALE = 'de' as const;
export type Locale = typeof DEFAULT_LOCALE;

export default getRequestConfig(async () => {
  return {
    locale: DEFAULT_LOCALE,
    messages: (await import(`../../messages/${DEFAULT_LOCALE}.json`)).default,
  };
});
