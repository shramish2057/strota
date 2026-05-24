#!/usr/bin/env python3
"""CLI bridge: read TS-signed headers from argv, run the Python verifier, emit JSON.

Used by tests/integration/hmac_round_trip.mjs to prove the two languages agree.

Exits 0 even on verify failure - the failure detail is in the JSON output so
the Node driver can assert specific reasons.
"""

from __future__ import annotations

import argparse
import json
import sys

from strota_api.security.hmac import verify_request


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--secret", required=True)
    parser.add_argument("--body", required=True)
    parser.add_argument("--signature", required=True)
    parser.add_argument("--timestamp", required=True)
    parser.add_argument("--nonce", required=True)
    parser.add_argument("--skew", type=int, default=60)
    args = parser.parse_args()

    outcome = verify_request(
        secret=args.secret,
        body=args.body.encode("utf-8"),
        signature_header=args.signature,
        timestamp_header=args.timestamp,
        nonce_header=args.nonce,
        skew_seconds=args.skew,
    )
    json.dump({"ok": outcome.ok, "reason": outcome.reason}, sys.stdout)
    return 0


if __name__ == "__main__":
    sys.exit(main())
