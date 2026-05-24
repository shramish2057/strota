#!/usr/bin/env node
// HMAC Round-Trip: TS signs, Python verifies. Asserts byte-identical canonical form.
//
// Usage: node tests/integration/hmac_round_trip.mjs
//
// Exit code 0 on full pass, 1 on any failure (with diagnostic JSON to stderr).

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';

import { signRequest } from '../../packages/shared/dist/hmac.js';
import {
  HMAC_HEADER_NONCE,
  HMAC_HEADER_SIGNATURE,
  HMAC_HEADER_TIMESTAMP,
} from '../../packages/shared/dist/contracts/index.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PY_VERIFY_SCRIPT = resolve(ROOT, 'tests', 'integration', 'verify_via_python.py');

const SECRET = 'k'.repeat(48);

const cases = [
  { name: 'empty body', body: '' },
  { name: 'tiny json', body: '{"k":1}' },
  { name: 'german umlauts', body: 'München äöüß' },
  { name: 'long binary', body: 'A'.repeat(8192) },
];

const tampered = { name: 'tampered body', body: 'orig', tamperWith: 'changed' };

function runPython(args, env = {}) {
  const result = spawnSync(
    'python3',
    [PY_VERIFY_SCRIPT, ...args],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        ...env,
        PYTHONPATH: resolve(ROOT, 'apps', 'api-python', 'src'),
      },
      encoding: 'utf-8',
    },
  );
  if (result.status !== 0) {
    return { ok: false, stderr: result.stderr, stdout: result.stdout };
  }
  try {
    return { ok: true, data: JSON.parse(result.stdout) };
  } catch (err) {
    return { ok: false, stderr: `parse error: ${err.message}\n${result.stdout}` };
  }
}

function bail(reason, detail) {
  console.error(JSON.stringify({ ok: false, reason, detail }, null, 2));
  process.exit(1);
}

async function main() {
  if (!existsSync(PY_VERIFY_SCRIPT)) {
    bail('missing_python_verifier', PY_VERIFY_SCRIPT);
  }
  if (!existsSync(resolve(ROOT, 'packages', 'shared', 'dist', 'hmac.js'))) {
    bail('missing_built_shared', 'run `pnpm --filter @strota/shared build` first');
  }

  let passed = 0;
  for (const c of cases) {
    const headers = await signRequest({ secret: SECRET, body: c.body });
    const args = [
      '--secret', SECRET,
      '--body', c.body,
      '--signature', headers[HMAC_HEADER_SIGNATURE],
      '--timestamp', headers[HMAC_HEADER_TIMESTAMP],
      '--nonce', headers[HMAC_HEADER_NONCE],
    ];
    const result = runPython(args);
    if (!result.ok) bail(`python_verify_failed:${c.name}`, result);
    if (result.data.ok !== true) {
      bail(`verify_returned_not_ok:${c.name}`, result.data);
    }
    passed += 1;
  }

  // Tamper case must FAIL verification with signature_mismatch.
  {
    const headers = await signRequest({ secret: SECRET, body: tampered.body });
    const result = runPython([
      '--secret', SECRET,
      '--body', tampered.tamperWith,
      '--signature', headers[HMAC_HEADER_SIGNATURE],
      '--timestamp', headers[HMAC_HEADER_TIMESTAMP],
      '--nonce', headers[HMAC_HEADER_NONCE],
    ]);
    if (!result.ok) bail('python_verify_subprocess_failed', result);
    if (result.data.ok !== false || result.data.reason !== 'signature_mismatch') {
      bail('tamper_case_did_not_fail_as_expected', result.data);
    }
    passed += 1;
  }

  console.log(JSON.stringify({ ok: true, passed }, null, 2));
}

main().catch((err) => bail('unhandled_error', String(err)));
