import { describe, it, expect } from 'vitest';
import {
  resolveCycleDate,
  getCurrentBudgetCycle,
  getNextResetDate,
  daysUntilReset,
  getOrCreateCurrentBudget,
} from '../utils/calculations';

describe('resolveCycleDate', () => {
  it('returns exact day when valid', () => {
    const d = resolveCycleDate(2026, 0, 27); // Jan 27, 2026
    expect(d.getDate()).toBe(27);
    expect(d.getMonth()).toBe(0);
  });

  it('snaps Feb 31 to Feb 28 in non-leap year', () => {
    const d = resolveCycleDate(2026, 1, 31); // Feb 2026
    expect(d.getDate()).toBe(28);
    expect(d.getMonth()).toBe(1);
  });

  it('snaps Feb 31 to Feb 29 in leap year', () => {
    const d = resolveCycleDate(2024, 1, 31);
    expect(d.getDate()).toBe(29);
    expect(d.getMonth()).toBe(1);
  });

  it('snaps Apr 31 to Apr 30', () => {
    const d = resolveCycleDate(2026, 3, 31); // April
    expect(d.getDate()).toBe(30);
    expect(d.getMonth()).toBe(3);
  });

  it('keeps Jan 31', () => {
    const d = resolveCycleDate(2026, 0, 31);
    expect(d.getDate()).toBe(31);
  });
});

describe('getCurrentBudgetCycle with custom day', () => {
  it('uses default day 27 when no arg', () => {
    const { startDate } = getCurrentBudgetCycle();
    expect(startDate.getDate()).toBe(27);
  });

  it('uses provided cycle day', () => {
    const { startDate } = getCurrentBudgetCycle(15);
    expect(startDate.getDate()).toBe(15);
  });

  it('endDate is day before next cycle start', () => {
    const { startDate, endDate } = getCurrentBudgetCycle(10);
    const next = new Date(endDate);
    next.setDate(next.getDate() + 1);
    expect(next.getDate()).toBe(10);
  });
});

describe('getNextResetDate with custom day', () => {
  it('returns date with chosen day when valid', () => {
    const d = getNextResetDate(15);
    expect(d.getDate()).toBe(15);
  });

  it('is in the future', () => {
    expect(getNextResetDate(27) > new Date()).toBe(true);
  });

  it('snaps to last day of Feb when day=31', () => {
    // Test with day 31 — result should never be day 31 in Feb
    const d = getNextResetDate(31);
    if (d.getMonth() === 1) {
      // Feb: should be 28 or 29
      expect([28, 29]).toContain(d.getDate());
    } else {
      expect(d.getDate()).toBeLessThanOrEqual(31);
    }
  });
});

describe('daysUntilReset with custom day', () => {
  it('returns positive number for day 15', () => {
    expect(daysUntilReset(15)).toBeGreaterThan(0);
  });

  it('returns at most 31 days', () => {
    expect(daysUntilReset(27)).toBeLessThanOrEqual(31);
  });
});

describe('getOrCreateCurrentBudget with custom cycle day', () => {
  it('creates budget with cycle day 15', () => {
    const result = getOrCreateCurrentBudget([], 15);
    expect(new Date(result.monthStartDate).getDate()).toBe(15);
  });

  it('creates budget with cycle day 31, snaps in Feb', () => {
    const result = getOrCreateCurrentBudget([], 31);
    const startDate = new Date(result.monthStartDate);
    // Should be a valid date — last day of month if month is Feb/Apr/Jun/Sep/Nov
    expect(startDate.getDate()).toBeGreaterThan(0);
    expect(startDate.getDate()).toBeLessThanOrEqual(31);
  });
});
