"""HMAC-SHA256 request signing for inter-service auth.

The canonical message form is identical to the TypeScript implementation in
`packages/shared/src/hmac.ts`:

    f"{timestamp}.{nonce}.{sha256_hex(body)}"

Where `timestamp` is unix epoch seconds as a decimal string, `nonce` is a
base64url-encoded random value, and `sha256_hex(body)` is the lowercase hex
SHA-256 of the raw request body (empty string for GET).

Golden vectors in `packages/shared/tests/golden_vectors.test.ts` and the
matching pytest in `apps/api-python/tests/test_hmac_golden.py` lock the
TS and Python implementations to byte-identical output.
"""

from __future__ import annotations

import hashlib
import hmac as _hmac
import secrets
import time
from dataclasses import dataclass
from typing import Literal

HMAC_HEADER_SIGNATURE = "x-strota-signature"
HMAC_HEADER_TIMESTAMP = "x-strota-timestamp"
HMAC_HEADER_NONCE = "x-strota-nonce"

DEFAULT_SKEW_SECONDS = 60
NONCE_BYTES = 16
_SIGNATURE_HEX_RE = "0123456789abcdef"


VerifyReason = Literal[
    "missing_header",
    "invalid_timestamp",
    "timestamp_skew_too_large",
    "signature_mismatch",
    "invalid_signature_format",
]


@dataclass(frozen=True)
class VerifyOutcome:
    """Result of `verify_request`.

    `ok=True` means signature and timestamp are valid. Caller is responsible
    for the Redis nonce-replay check.
    """

    ok: bool
    reason: VerifyReason | None = None


def _sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical_message(timestamp: str, nonce: str, body: bytes) -> str:
    """Build the canonical message: f'{timestamp}.{nonce}.{sha256_hex(body)}'."""
    return f"{timestamp}.{nonce}.{_sha256_hex(body)}"


def generate_nonce() -> str:
    """Generate a base64url nonce without padding (matches the TS implementation)."""
    raw = secrets.token_bytes(NONCE_BYTES)
    return _b64url_no_pad(raw)


def _b64url_no_pad(raw: bytes) -> str:
    import base64

    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def sign_request(
    *,
    secret: str,
    body: bytes,
    now_ms: int | None = None,
    nonce: str | None = None,
) -> dict[str, str]:
    """Compute the three HMAC headers for an outgoing request.

    Returns a dict with the lowercase header names so it can be passed directly
    to httpx.
    """
    if len(secret) < 32:
        msg = "HMAC secret must be at least 32 characters."
        raise ValueError(msg)
    if now_ms is None:
        now_ms = int(time.time() * 1000)
    timestamp = str(now_ms // 1000)
    nonce_value = nonce or generate_nonce()
    message = canonical_message(timestamp, nonce_value, body)
    signature = _hmac.new(
        secret.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return {
        HMAC_HEADER_SIGNATURE: signature,
        HMAC_HEADER_TIMESTAMP: timestamp,
        HMAC_HEADER_NONCE: nonce_value,
    }


def _is_lowercase_hex_64(value: str) -> bool:
    if len(value) != 64:
        return False
    return all(c in _SIGNATURE_HEX_RE for c in value)


def verify_request(
    *,
    secret: str,
    body: bytes,
    signature_header: str,
    timestamp_header: str,
    nonce_header: str,
    skew_seconds: int = DEFAULT_SKEW_SECONDS,
    secret_previous: str | None = None,
    now_ms: int | None = None,
) -> VerifyOutcome:
    """Verify an incoming signature without consulting the nonce store.

    Returns `VerifyOutcome(ok=True)` when the signature is valid and the
    timestamp is within `skew_seconds` of `now`. The caller is responsible
    for the Redis nonce-SET replay check.
    """
    if not signature_header or not timestamp_header or not nonce_header:
        return VerifyOutcome(ok=False, reason="missing_header")
    if not _is_lowercase_hex_64(signature_header):
        return VerifyOutcome(ok=False, reason="invalid_signature_format")
    try:
        ts_seconds = int(timestamp_header)
    except ValueError:
        return VerifyOutcome(ok=False, reason="invalid_timestamp")
    if ts_seconds <= 0:
        return VerifyOutcome(ok=False, reason="invalid_timestamp")
    now_sec = (now_ms if now_ms is not None else int(time.time() * 1000)) // 1000
    if abs(now_sec - ts_seconds) > skew_seconds:
        return VerifyOutcome(ok=False, reason="timestamp_skew_too_large")

    message = canonical_message(timestamp_header, nonce_header, body)
    expected = _hmac.new(
        secret.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    if _hmac.compare_digest(expected, signature_header):
        return VerifyOutcome(ok=True)
    if secret_previous:
        expected_prev = _hmac.new(
            secret_previous.encode("utf-8"),
            message.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        if _hmac.compare_digest(expected_prev, signature_header):
            return VerifyOutcome(ok=True)
    return VerifyOutcome(ok=False, reason="signature_mismatch")
