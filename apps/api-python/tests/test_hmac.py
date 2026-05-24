"""Unit tests for HMAC sign/verify with skew + rotation overlap."""

from __future__ import annotations

import time

import pytest

from strota_api.security.hmac import (
    HMAC_HEADER_NONCE,
    HMAC_HEADER_SIGNATURE,
    HMAC_HEADER_TIMESTAMP,
    canonical_message,
    generate_nonce,
    sign_request,
    verify_request,
)

SECRET = "x" * 32
SECRET_PREV = "y" * 32


def test_canonical_message_empty_body() -> None:
    msg = canonical_message("1700000000", "nonce123", b"")
    assert msg == (
        "1700000000.nonce123.e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    )


def test_round_trip_empty_get() -> None:
    headers = sign_request(secret=SECRET, body=b"")
    outcome = verify_request(
        secret=SECRET,
        body=b"",
        signature_header=headers[HMAC_HEADER_SIGNATURE],
        timestamp_header=headers[HMAC_HEADER_TIMESTAMP],
        nonce_header=headers[HMAC_HEADER_NONCE],
    )
    assert outcome.ok is True


def test_round_trip_json_body() -> None:
    body = b'{"projektId":"abc","land":"Bayern"}'
    headers = sign_request(secret=SECRET, body=body)
    outcome = verify_request(
        secret=SECRET,
        body=body,
        signature_header=headers[HMAC_HEADER_SIGNATURE],
        timestamp_header=headers[HMAC_HEADER_TIMESTAMP],
        nonce_header=headers[HMAC_HEADER_NONCE],
    )
    assert outcome.ok is True


def test_tampered_body_rejected() -> None:
    headers = sign_request(secret=SECRET, body=b"orig")
    outcome = verify_request(
        secret=SECRET,
        body=b"tampered",
        signature_header=headers[HMAC_HEADER_SIGNATURE],
        timestamp_header=headers[HMAC_HEADER_TIMESTAMP],
        nonce_header=headers[HMAC_HEADER_NONCE],
    )
    assert outcome.ok is False
    assert outcome.reason == "signature_mismatch"


def test_skew_rejection_over_60_seconds() -> None:
    headers = sign_request(secret=SECRET, body=b"", now_ms=1_000_000)
    outcome = verify_request(
        secret=SECRET,
        body=b"",
        signature_header=headers[HMAC_HEADER_SIGNATURE],
        timestamp_header=headers[HMAC_HEADER_TIMESTAMP],
        nonce_header=headers[HMAC_HEADER_NONCE],
        now_ms=1_000_000 + 70_000,
    )
    assert outcome.ok is False
    assert outcome.reason == "timestamp_skew_too_large"


def test_skew_within_window_accepted() -> None:
    headers = sign_request(secret=SECRET, body=b"", now_ms=1_000_000)
    outcome = verify_request(
        secret=SECRET,
        body=b"",
        signature_header=headers[HMAC_HEADER_SIGNATURE],
        timestamp_header=headers[HMAC_HEADER_TIMESTAMP],
        nonce_header=headers[HMAC_HEADER_NONCE],
        now_ms=1_000_000 + 30_000,
    )
    assert outcome.ok is True


def test_rotation_overlap_previous_secret_accepted() -> None:
    headers = sign_request(secret=SECRET_PREV, body=b"x")
    outcome = verify_request(
        secret=SECRET,
        secret_previous=SECRET_PREV,
        body=b"x",
        signature_header=headers[HMAC_HEADER_SIGNATURE],
        timestamp_header=headers[HMAC_HEADER_TIMESTAMP],
        nonce_header=headers[HMAC_HEADER_NONCE],
    )
    assert outcome.ok is True


def test_invalid_signature_format() -> None:
    outcome = verify_request(
        secret=SECRET,
        body=b"",
        signature_header="not-hex",
        timestamp_header=str(int(time.time())),
        nonce_header="n",
    )
    assert outcome.ok is False
    assert outcome.reason == "invalid_signature_format"


def test_missing_header() -> None:
    outcome = verify_request(
        secret=SECRET,
        body=b"",
        signature_header="",
        timestamp_header="1700000000",
        nonce_header="n",
    )
    assert outcome.ok is False
    assert outcome.reason == "missing_header"


def test_short_secret_raises() -> None:
    with pytest.raises(ValueError):
        sign_request(secret="short", body=b"")


def test_generate_nonce_length() -> None:
    n = generate_nonce()
    assert len(n) >= 22
    assert "=" not in n
    assert "+" not in n
    assert "/" not in n
