/**
 * Public unauthenticated proxy. Forwards /api/public/* to the FastAPI
 * /api/public/* surface. No HMAC (FastAPI's middleware allow-lists this
 * prefix per ADR-0035). Forwards the client IP so the FastAPI rate
 * limiter buckets correctly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { callFastapi } from '../../../../lib/api';

export const dynamic = 'force-dynamic';

type Method = 'GET' | 'POST';

async function forward(req: NextRequest, method: Method, pathSegments: string[]): Promise<NextResponse> {
  const url = new URL(req.url);
  const targetPath = `/api/public/${pathSegments.join('/')}${url.search}`;

  let body: unknown = undefined;
  if (method !== 'GET') {
    try {
      body = await req.json();
    } catch {
      body = undefined;
    }
  }

  const forwardedFor =
    req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined;

  const resp = await callFastapi({
    method,
    path: targetPath,
    body,
    forwardedFor,
    userAgent: req.headers.get('user-agent') ?? undefined,
    skipHmac: true,
  });
  return NextResponse.json(resp.data, { status: resp.status });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const resolved = await params;
  return forward(req, 'GET', resolved.path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const resolved = await params;
  return forward(req, 'POST', resolved.path);
}
