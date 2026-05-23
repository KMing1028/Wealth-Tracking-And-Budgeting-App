import { describe, it, expect, beforeEach } from 'vitest';
import {
  calcNetWorth,
  calcGrowth,
  calcBucketTotals,
  getCurrentBudgetCycle,
  getNextResetDate,
  daysUntilReset,
  buildNetWorthChartData,
  getOrCreateCurrentBudget,
} from '../utils/calculations';

describe('calcGrowth', () => {
  it('returns positive growth', () => {
    const { pct, abs } = calcGrowth(110, 100);
    expect(pct).toBe(10);
    expect(abs).toBe(10);
  });

  it('returns negative growth', () => {
    const { pct, abs } = calcGrowth(90, 100);
    expect(pct).toBeCloseTo(-10);
    expect(abs).toBe(-10);
  });

  it('returns zero when past is zero', () => {
    const { pct, abs } = calcGrowth(100, 0);
    expect(pct).toBe(0);
    expect(abs).toBe(0);
  });
});

describe('calcNetWorth', () => {
  it('sums all currentValue fields', () => {
    const data = [
      { currentValue: 50000 },
      { currentValue: 30000 },
      { currentValue: 20000 },
    ];
    expect(calcNetWorth(data)).toBe(100000);
  });

  it('returns 0 for empty array', () => {
    expect(calcNetWorth([])).toBe(0);
  });
});

describe('calcBucketTotals', () => {
  it('groups expenses by bucket', () => {
    const expenses = [
      { bucket: 'needs', amount: 1000 },
      { bucket: 'needs', amount: 500 },
      { bucket: 'wants', amount: 200 },
      { bucket: 'save_invest', amount: 300 },
    ];
    const totals = calcBucketTotals(expenses);
    expect(totals.needs).toBe(1500);
    expect(totals.wants).toBe(200);
    expect(totals.save_invest).toBe(300);
  });

  it('returns zero for missing buckets', () => {
    const totals = calcBucketTotals([]);
    expect(totals.needs).toBe(0);
    expect(totals.wants).toBe(0);
    expect(totals.save_invest).toBe(0);
  });
});

describe('getCurrentBudgetCycle', () => {
  it('returns a startDate on the 27th', () => {
    const { startDate } = getCurrentBudgetCycle();
    expect(startDate.getDate()).toBe(27);
  });

  it('returns an endDate on the 26th', () => {
    const { endDate } = getCurrentBudgetCycle();
    expect(endDate.getDate()).toBe(26);
  });

  it('endDate is the month after startDate', () => {
    const { startDate, endDate } = getCurrentBudgetCycle();
    const expectedMonth = (startDate.getMonth() + 1) % 12;
    expect(endDate.getMonth()).toBe(expectedMonth);
  });
});

describe('getNextResetDate', () => {
  it('returns a date on the 27th', () => {
    const next = getNextResetDate();
    expect(next.getDate()).toBe(27);
  });

  it('is in the future', () => {
    expect(getNextResetDate() > new Date()).toBe(true);
  });
});

describe('daysUntilReset', () => {
  it('returns a positive number', () => {
    expect(daysUntilReset()).toBeGreaterThan(0);
  });

  it('returns at most 31 days', () => {
    expect(daysUntilReset()).toBeLessThanOrEqual(31);
  });
});

describe('buildNetWorthChartData', () => {
  it('returns chart points sorted by date', () => {
    const now = new Date();
    const past = new Date(now); past.setMonth(past.getMonth() - 1);
    const data = [
      {
        id: 'a',
        currentValue: 100,
        entries: [
          { date: past.toISOString(), value: 80 },
          { date: now.toISOString(), value: 100 },
        ],
      },
    ];
    const points = buildNetWorthChartData(data);
    expect(points.length).toBe(2);
    expect(points[0].total).toBe(80);
    expect(points[1].total).toBe(100);
  });

  it('returns empty array for no entries', () => {
    expect(buildNetWorthChartData([])).toEqual([]);
  });
});

describe('getOrCreateCurrentBudget', () => {
  it('returns existing budget when present', () => {
    const { startDate } = getCurrentBudgetCycle();
    const existing = {
      id: 'existing-1',
      monthStartDate: startDate.toISOString(),
      monthEndDate: new Date().toISOString(),
      budgetLimit: 5000,
      expenses: [],
    };
    const result = getOrCreateCurrentBudget([existing]);
    expect(result.id).toBe('existing-1');
    expect(result.budgetLimit).toBe(5000);
  });

  it('creates a new budget when none exists', () => {
    const result = getOrCreateCurrentBudget([]);
    expect(result.id).toMatch(/^budget-/);
    expect(result.budgetLimit).toBe(0);
    expect(result.expenses).toEqual([]);
  });

  it('new budget has deterministic ID based on start date', () => {
    const r1 = getOrCreateCurrentBudget([]);
    const r2 = getOrCreateCurrentBudget([]);
    expect(r1.id).toBe(r2.id);
  });
});
