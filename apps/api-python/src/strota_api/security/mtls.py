"""mTLS client cert fingerprint allowlist + Redis-backed CRL.

Cloudflare terminates the public TLS and re-establishes mTLS to the Hetzner
origin. The origin receives the client cert via the `X-Forwarded-Client-Cert`
header (Cloudflare convention) or via the request transport socket when
configured for direct mTLS. The middleware computes the cert's SHA-256
fingerprint and:

  1. checks it is in the static allowlist from settings,
  2. checks it is NOT in the Redis CRL (`mtls:revoked_serials`).

Both checks must pass.
"""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass

_HEX64 = re.compile(r"^[0-9a-f]{64}$")


@dataclass(frozen=True)
class MtlsOutcome:
    """Outcome of an mTLS fingerprint check."""

    ok: bool
    fingerprint: str | None = None
    reason: str | None = None


def fingerprint_from_pem(pem_bytes: bytes) -> str:
    """SHA-256 fingerprint (hex, lowercase) of a DER-encoded cert.

    Accepts either PEM (the ``-----BEGIN CERTIFICATE-----`` form) or raw DER.
    """
    if pem_bytes.startswith(b"-----BEGIN"):
        # Extract base64 between BEGIN/END markers, then base64-decode to DER.
        import base64

        body = pem_bytes.decode("ascii", errors="strict")
        b64 = "".join(
            line.strip()
            for line in body.splitlines()
            if not line.startswith("-----") and line.strip()
        )
        der = base64.b64decode(b64)
    else:
        der = pem_bytes
    return hashlib.sha256(der).hexdigest()


def is_valid_fingerprint(value: str) -> bool:
    return bool(_HEX64.match(value))


def check_allowlist(fingerprint: str, allowlist: list[str]) -> bool:
    """Constant-time-ish allowlist check.

    The allowlist is short (1-10 entries), so plain iteration is fine.
    """
    if not is_valid_fingerprint(fingerprint):
        return False
    target = fingerprint.lower()
    return any(target == allowed.lower() for allowed in allowlist)
