/**
 * Shared TypeScript types used across Strota services.
 *
 * Phase 1: HMAC + auth header contracts only. Domain contracts (projects,
 * bauherren, fachplaner, etc.) follow with the Phase 2 schema rollout.
 */

export interface HmacSignedRequestHeaders {
  /** Lowercase hex SHA-256 HMAC of timestamp + nonce + body. */
  'x-strota-signature': string;
  /** Unix epoch seconds as decimal string. */
  'x-strota-timestamp': string;
  /** 128-bit random nonce, base64url, unique per request. */
  'x-strota-nonce': string;
}

export const HMAC_HEADER_SIGNATURE = 'x-strota-signature' as const;
export const HMAC_HEADER_TIMESTAMP = 'x-strota-timestamp' as const;
export const HMAC_HEADER_NONCE = 'x-strota-nonce' as const;
