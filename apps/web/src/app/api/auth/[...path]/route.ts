/**
 * Proxy: /api/auth/* in the browser -> /api/auth/* in FastAPI.
 *
 * Why proxy at all: FastAPI runs on a different host (Cloudflare Tunnel in
 * prod, localhost:8000 in dev). Cookies set by FastAPI would land on the
 * wrong origin; the proxy lets us issue cookies on the Next.js origin so
 * the browser sends them back automatically with every subsequent request.
 *
 * Auth routes do not require HMAC (the FastAPI middleware skips
 * /api/auth/* via PUBLIC_PREFIXES).
 */

import type { NextRequest } from 'next/server';
import { callFastapi } from '../../../../lib/api';

const ALLOWED_METHODS = ['GET', 'POST'] as const;
type AllowedMethod = (typeof ALLOWED_METHODS)[number];

async function handle(req: NextRequest, segments: string[]): Promise<Response> {
  const method = req.method as AllowedMethod;
  if (!ALLOWED_METHODS.includes(method)) {
    return Response.json({ error: 'method_not_allowed' }, { status: 405 });
  }
  const path = `/api/auth/${segments.join('/')}`;
  let body: unknown = undefined;
  if (method === 'POST') {
    const text = await req.text();
    body = text ? JSON.parse(text) : null;
  }
  const upstream = await callFastapi({
    method,
    path,
    body,
    cookieHeader: req.headers.get('cookie') ?? undefined,
    forwardedFor:
      req.headers.get('x-forwarded-for') ??
      req.headers.get('x-real-ip') ??
      undefined,
    userAgent: req.headers.get('user-agent') ?? undefined,
    skipHmac: true,
  });
  const headers = new Headers({ 'content-type': 'application/json' });
  for (const c of upstream.setCookie) headers.append('set-cookie', c);
  return new Response(JSON.stringify(upstream.data ?? {}), {
    status: upstream.status,
    headers,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  return handle(req, path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  return handle(req, path);
}
