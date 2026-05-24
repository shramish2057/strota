import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('/healthz route', () => {
  it('returns ok with service identity', async () => {
    const response = GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('strota-web');
    expect(typeof body.version).toBe('string');
    expect(typeof body.timestamp).toBe('string');
  });
});
