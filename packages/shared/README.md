# @strota/shared

Shared TypeScript primitives used by `@strota/web` and the FastAPI service.

## Modules

- `hmac` - HMAC-SHA256 request signing for inter-service auth (ADR-0002, ADR-0035).
- `contracts` - shared types and header name constants.

## HMAC

Canonical message form:

```
${timestamp}.${nonce}.${sha256_hex(body)}
```

- `timestamp` = unix epoch seconds, decimal string.
- `nonce` = 16-byte random, base64url, no padding.
- `body` = raw request bytes; SHA-256 hashed once.

The Python counterpart in `apps/api-python/src/strota_api/security/hmac.py` uses the identical canonical form. Golden vectors live in both test suites so any drift between languages is caught immediately.

## Usage

```ts
import { signRequest } from '@strota/shared/hmac';

const headers = await signRequest({
  secret: process.env.FASTAPI_HMAC_SECRET!,
  body: JSON.stringify({ hello: 'world' }),
});

await fetch('https://api.dev.strota.internal/some/path', {
  method: 'POST',
  headers: { ...headers, 'content-type': 'application/json' },
  body: JSON.stringify({ hello: 'world' }),
});
```

## Tests

```bash
pnpm --filter @strota/shared test
pnpm --filter @strota/shared typecheck
```
