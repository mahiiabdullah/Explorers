import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDuration, timeUntil, cn } from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats paise to INR', () => {
    expect(formatCurrency(35000)).toContain('350');
  });
});

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(45)).toBe('45m');
  });
  it('formats hours and minutes', () => {
    expect(formatDuration(125)).toBe('2h 5m');
  });
});

describe('timeUntil', () => {
  it('returns expired for past dates', () => {
    const past = new Date(Date.now() - 1000);
    expect(timeUntil(past).expired).toBe(true);
  });
  it('returns minutes/seconds for future dates', () => {
    const future = new Date(Date.now() + 65000);
    const r = timeUntil(future);
    expect(r.minutes).toBe(1);
    expect(r.seconds).toBeGreaterThanOrEqual(4);
  });
});

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
    expect(cn('a', false && 'b')).toBe('a');
  });
});
