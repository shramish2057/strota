/**
 * Strota typography (post-rebrand): a single grotesk face across the whole
 * surface. Geist Sans for everything visible to the user (display + body),
 * Geist Mono for code, citations, numeric tables.
 *
 * Geist ships preconfigured as next/font assets via the `geist` package, so
 * we just re-export the CSS-variable handles for use by Tailwind tokens and
 * the root <html> className.
 */

import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

export const fontDisplay = GeistSans;
export const fontBody = GeistSans;
export const fontMono = GeistMono;
