import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercent, formatDate, formatShortDate } from '../utils/formatters';

describe('formatCurrency', () => {
  it('formats MYR correctly', () => {
    expect(formatCurrency(85000, 'MYR')).toBe('RM 85,000');
  });

  it('formats USD correctly', () => {
    expect(formatCurrency(1234.5, 'USD')).toBe('$ 1,234.5');
  });

  it('formats negative values', () => {
    expect(formatCurrency(-500, 'MYR')).toBe('RM -500');
  });

  it('abbreviates millions', () => {
    expect(formatCurrency(1500000, 'MYR')).toBe('RM 1.50M');
  });
});

describe('formatPercent', () => {
  it('shows + for positive values', () => {
    expect(formatPercent(8.4)).toBe('+8.40%');
  });

  it('shows - for negative values', () => {
    expect(formatPercent(-3.2)).toBe('-3.20%');
  });

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('+0.00%');
  });
});

describe('formatDate', () => {
  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('formats a valid ISO date', () => {
    const result = formatDate('2026-01-15T00:00:00.000Z');
    expect(result).toContain('Jan');
    expect(result).toContain('2026');
  });
});

describe('formatShortDate', () => {
  it('returns empty string for null', () => {
    expect(formatShortDate(null)).toBe('');
  });

  it('formats to short form without year', () => {
    const result = formatShortDate('2026-03-27T00:00:00.000Z');
    expect(result).toContain('Mar');
    expect(result).not.toContain('2026');
  });
});
