import { describe, expect, it } from 'vitest';
import { cn } from './cn.js';

describe('cn', () => {
  it('joins strings', () => {
    expect(cn('a', 'b')).toBe('a b');
  });
  it('skips falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });
  it('supports conditional object form', () => {
    expect(cn('a', { b: true, c: false })).toBe('a b');
  });
});
