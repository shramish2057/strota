/**
 * Server-side auth helper. Used by /app routes to enforce login.
 *
 * fetchCurrentUser() forwards the incoming cookies to FastAPI's /api/auth/me.
 * If the access cookie is missing or invalid, returns null; the layout
 * then redirects to /login.
 */

import { cookies } from 'next/headers';
import { callFastapi } from './api';

export interface CurrentUser {
  id: string;
  email: string;
  full_name?: string | null;
  role: string;
  org_id?: string | null;
  bauvorlageberechtigung: string;
  theme: 'light' | 'dark' | 'system';
  locale: string;
  email_verified: boolean;
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
  const resp = await callFastapi<CurrentUser | { detail?: { code?: string } }>({
    method: 'GET',
    path: '/api/auth/me',
    cookieHeader,
    skipHmac: true,
  });
  if (!resp.ok) return null;
  return resp.data as CurrentUser;
}
