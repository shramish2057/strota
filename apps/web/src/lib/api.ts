/**
 * Server-side helper for calling the FastAPI backend with HMAC-signed
 * requests. Used by Next.js route handlers in src/app/api/* that proxy
 * client requests, and by RSC code paths that fetch user data.
 *
 * For Phase 3 we keep the HMAC step pluggable. In production FASTAPI_HMAC_SECRET
 * is set; in local dev pointing at FastAPI on 8000, the auth middleware skips
 * /api/auth/* by prefix, so the proxy works without HMAC for those routes.
 */

import { signRequest } from '@strota/shared/hmac';

const FASTAPI_URL = process.env.FASTAPI_URL ?? 'http://127.0.0.1:8000';
const HMAC_SECRET = process.env.FASTAPI_HMAC_SECRET ?? '';

export interface FastapiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  cookieHeader?: string;
  bearerToken?: string;
  forwardedFor?: string;
  userAgent?: string;
  skipHmac?: boolean;
}

export interface FastapiResponse<T = unknown> {
  status: number;
  ok: boolean;
  data: T;
  setCookie: string[];
}

/** Forward a request from Next.js to FastAPI, optionally with HMAC. */
export async function callFastapi<T = unknown>(req: FastapiRequest): Promise<FastapiResponse<T>> {
  const bodyStr = req.body !== undefined ? JSON.stringify(req.body) : '';
  const headers: Record<string, string> = {
    accept: 'application/json',
    'content-type': 'application/json',
  };

  if (!req.skipHmac && HMAC_SECRET.length >= 32) {
    const signed = await signRequest({ secret: HMAC_SECRET, body: bodyStr });
    Object.assign(headers, signed);
  }
  if (req.cookieHeader) headers.cookie = req.cookieHeader;
  if (req.bearerToken) headers.authorization = `Bearer ${req.bearerToken}`;
  if (req.forwardedFor) headers['x-forwarded-for'] = req.forwardedFor;
  if (req.userAgent) headers['user-agent'] = req.userAgent;

  const resp = await fetch(`${FASTAPI_URL}${req.path}`, {
    method: req.method,
    headers,
    body: req.method === 'GET' ? undefined : bodyStr || undefined,
    cache: 'no-store',
    redirect: 'manual',
  });

  const setCookie = resp.headers.getSetCookie?.() ?? [];
  let data: T;
  const text = await resp.text();
  try {
    data = (text ? JSON.parse(text) : null) as T;
  } catch {
    data = text as unknown as T;
  }
  return { status: resp.status, ok: resp.ok, data, setCookie };
}
