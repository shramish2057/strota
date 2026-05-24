"""Security primitives: HMAC signing/verification, mTLS fingerprints."""

from .hmac import (
    HMAC_HEADER_NONCE,
    HMAC_HEADER_SIGNATURE,
    HMAC_HEADER_TIMESTAMP,
    VerifyOutcome,
    canonical_message,
    sign_request,
    verify_request,
)

__all__ = [
    "HMAC_HEADER_NONCE",
    "HMAC_HEADER_SIGNATURE",
    "HMAC_HEADER_TIMESTAMP",
    "VerifyOutcome",
    "canonical_message",
    "sign_request",
    "verify_request",
]
