/**
 * Strota typography (Part 2.3 of v5.0 Bible).
 *
 * Loaded via next/font so the runtime injects them with optimal CSS,
 * preloading, and self-hosting. CSS variables are wired into Tailwind's
 * `--font-display | --font-body | --font-mono` tokens in globals.css.
 */

import { DM_Serif_Display, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';

export const fontDisplay = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-display',
});

export const fontBody = IBM_Plex_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-body',
});

export const fontMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-mono',
});
