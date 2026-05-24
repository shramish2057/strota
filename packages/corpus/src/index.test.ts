import { describe, expect, it } from 'vitest';
import { CORPUS_VERSION, getCorpusVersion } from './index.js';

describe('@strota/corpus skeleton', () => {
  it('exposes a version constant', () => {
    expect(CORPUS_VERSION).toBe('0.1.0-phase1-skeleton');
    expect(getCorpusVersion()).toBe(CORPUS_VERSION);
  });
});
