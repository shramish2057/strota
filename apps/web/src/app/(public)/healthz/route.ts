export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export function GET(): Response {
  return Response.json({
    status: 'ok',
    service: 'strota-web',
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0',
    timestamp: new Date().toISOString(),
  });
}
