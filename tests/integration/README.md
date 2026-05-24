# Integration Tests

Cross-language and cross-service integration tests.

## HMAC Round-Trip (Phase 1)

Proves the TypeScript signer (`@strota/shared/hmac`) and the Python verifier (`strota_api.security.hmac`) agree on the canonical message form, byte for byte, for a fixed set of inputs.

Run:

```bash
node tests/integration/hmac_round_trip.mjs
```

The script:

1. Generates signatures via the TS implementation for a list of test vectors.
2. Invokes the Python verifier (in a subprocess that imports `strota_api.security.hmac`) with each vector + signature.
3. Asserts every verify returns `ok=True`.
4. Asserts that a tampered-body case returns `ok=False, reason="signature_mismatch"`.

Failure modes:

- Wrong canonical-message order in either side -> all assertions fail.
- Base64 padding mismatch in nonce -> `invalid_signature_format` or `signature_mismatch`.
- Clock skew of more than 60 seconds between TS and Python clocks during run -> `timestamp_skew_too_large`.

CI invokes this script in `.github/workflows/ci.yml` after both unit-test suites pass.
