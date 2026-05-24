/**
 * HMAC-SHA256 request signing for inter-service auth (Vercel Edge to FastAPI).
 *
 * ADR-0002 inter-service auth, ADR-0035 60s skew window.
 *
 * Canonical message (UTF-8): `${timestamp}.${nonce}.${bodySha256Hex}`
 *
 * The body is hashed once (SHA-256) so streaming bodies and large uploads do
 * not require keeping the entire bytes in memory twice. The Python verifier
 * uses the identical canonical form. See tests/golden_vectors.test.ts.
 *
 * Replay prevention: nonce stored in Redis SET on the API side with TTL equal
 * to (skew_seconds + safety_margin). A request whose timestamp is older than
 * skew_seconds is rejected before the nonce check.
 */

import {
  HMAC_HEADER_NONCE,
  HMAC_HEADER_SIGNATURE,
  HMAC_HEADER_TIMESTAMP,
  type HmacSignedRequestHeaders,
} from './contracts/index.js';

const DEFAULT_SKEW_SECONDS = 60;
const NONCE_BYTES = 16;

export interface SignRequestOptions {
  /** Shared HMAC secret (>= 32 chars). */
  secret: string;
  /** Request body bytes. Empty for GET. */
  body: Uint8Array | string;
  /** Override clock for tests. */
  nowMs?: number;
  /** Override nonce for tests (must be 16+ bytes base64url-encoded). */
  nonce?: string;
}

export interface VerifyRequestOptions {
  /** Shared HMAC secret. Also accepts the previous secret during rotation overlap. */
  secret: string;
  /** Optional previous secret during 24h rotation overlap window. */
  secretPrevious?: string | null;
  /** Body the API received. */
  body: Uint8Array | string;
  /** Headers from the incoming request. */
  signatureHeader: string;
  timestampHeader: string;
  nonceHeader: string;
  /** Reject if abs(now - timestamp) > skewSeconds. Default 60. */
  skewSeconds?: number;
  /** Override clock for tests. */
  nowMs?: number;
}

export interface VerifyResult {
  ok: boolean;
  reason?:
    | 'missing_header'
    | 'invalid_timestamp'
    | 'timestamp_skew_too_large'
    | 'signature_mismatch'
    | 'invalid_signature_format';
}

const HEX_LOWER = '0123456789abcdef' as const;

function bytesToHex(bytes: Uint8Array): string {
  const out = new Array<string>(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    const v = bytes[i] ?? 0;
    const hi = HEX_LOWER.charAt(v >> 4);
    const lo = HEX_LOWER.charAt(v & 0x0f);
    out[i] = hi + lo;
  }
  return out.join('');
}

function toBytes(input: Uint8Array | string): Uint8Array {
  if (typeof input === 'string') {
    return new TextEncoder().encode(input);
  }
  return input;
}

async function sha256Hex(input: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', input as unknown as ArrayBuffer);
  return bytesToHex(new Uint8Array(buf));
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message) as unknown as ArrayBuffer,
  );
  return bytesToHex(new Uint8Array(sig));
}

/**
 * Build the canonical message: `${timestamp}.${nonce}.${sha256Hex(body)}`.
 */
export async function canonicalMessage(
  timestamp: string,
  nonce: string,
  body: Uint8Array | string,
): Promise<string> {
  const bodyHash = await sha256Hex(toBytes(body));
  return `${timestamp}.${nonce}.${bodyHash}`;
}

/**
 * Generate a cryptographically-strong nonce (base64url, no padding).
 */
export function generateNonce(): string {
  const bytes = new Uint8Array(NONCE_BYTES);
  crypto.getRandomValues(bytes);
  // base64url without padding
  let b64 = '';
  if (typeof btoa === 'function') {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) {
      bin += String.fromCharCode(bytes[i] ?? 0);
    }
    b64 = btoa(bin);
  } else {
    // Node fallback
    b64 = Buffer.from(bytes).toString('base64');
  }
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/**
 * Sign a request, returning the three headers the API will validate.
 */
export async function signRequest(options: SignRequestOptions): Promise<HmacSignedRequestHeaders> {
  if (options.secret.length < 32) {
    throw new Error('HMAC secret must be at least 32 characters.');
  }
  const nowMs = options.nowMs ?? Date.now();
  const timestamp = Math.floor(nowMs / 1000).toString();
  const nonce = options.nonce ?? generateNonce();
  const message = await canonicalMessage(timestamp, nonce, options.body);
  const signature = await hmacSha256Hex(options.secret, message);
  return {
    [HMAC_HEADER_SIGNATURE]: signature,
    [HMAC_HEADER_TIMESTAMP]: timestamp,
    [HMAC_HEADER_NONCE]: nonce,
  };
}

/**
 * Constant-time string compare. Returns false on length mismatch without leaking.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verify an incoming request signature. Does NOT check the nonce store; the
 * caller is responsible for the Redis SET replay check.
 */
export async function verifyRequest(options: VerifyRequestOptions): Promise<VerifyResult> {
  if (!options.signatureHeader || !options.timestampHeader || !options.nonceHeader) {
    return { ok: false, reason: 'missing_header' };
  }
  if (!/^[0-9a-f]{64}$/.test(options.signatureHeader)) {
    return { ok: false, reason: 'invalid_signature_format' };
  }
  const tsSeconds = Number.parseInt(options.timestampHeader, 10);
  if (!Number.isFinite(tsSeconds) || tsSeconds <= 0) {
    return { ok: false, reason: 'invalid_timestamp' };
  }
  const skewSeconds = options.skewSeconds ?? DEFAULT_SKEW_SECONDS;
  const nowSec = Math.floor((options.nowMs ?? Date.now()) / 1000);
  if (Math.abs(nowSec - tsSeconds) > skewSeconds) {
    return { ok: false, reason: 'timestamp_skew_too_large' };
  }
  const message = await canonicalMessage(
    options.timestampHeader,
    options.nonceHeader,
    options.body,
  );
  const expected = await hmacSha256Hex(options.secret, message);
  if (constantTimeEqual(expected, options.signatureHeader)) {
    return { ok: true };
  }
  if (options.secretPrevious) {
    const expectedPrev = await hmacSha256Hex(options.secretPrevious, message);
    if (constantTimeEqual(expectedPrev, options.signatureHeader)) {
      return { ok: true };
    }
  }
  return { ok: false, reason: 'signature_mismatch' };
}
