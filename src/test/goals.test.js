import { describe, it, expect } from 'vitest';
import { getGoalProgress } from '../utils/calculations';

describe('getGoalProgress', () => {
  it('calculates percent complete', () => {
    const goal = { targetAmount: 1000, currentAmount: 250 };
    const p = getGoalProgress(goal);
    expect(p.percentComplete).toBe(25);
  });

  it('caps percent at 100', () => {
    const goal = { targetAmount: 1000, currentAmount: 1500 };
    const p = getGoalProgress(goal);
    expect(p.percentComplete).toBe(100);
  });

  it('returns completed status when goal reached', () => {
    const goal = { targetAmount: 1000, currentAmount: 1000, targetDate: '2030-01-01' };
    const p = getGoalProgress(goal);
    expect(p.status).toBe('completed');
  });

  it('returns in_progress when no target date', () => {
    const goal = { targetAmount: 1000, currentAmount: 100 };
    const p = getGoalProgress(goal);
    expect(p.status).toBe('in_progress');
  });

  it('returns missed when deadline passed and not complete', () => {
    const goal = {
      targetAmount: 1000,
      currentAmount: 100,
      targetDate: '2020-01-01',
      createdAt: '2019-01-01',
    };
    const p = getGoalProgress(goal);
    expect(p.status).toBe('missed');
  });

  it('returns on_track when ahead of expected progress', () => {
    const today = new Date();
    const created = new Date(today); created.setDate(created.getDate() - 10);
    const target = new Date(today); target.setDate(target.getDate() + 90);
    const goal = {
      targetAmount: 1000,
      currentAmount: 500, // 50% done, only 10/100 days = 10% expected
      targetDate: target.toISOString(),
      createdAt: created.toISOString(),
    };
    const p = getGoalProgress(goal);
    expect(p.status).toBe('on_track');
  });

  it('returns behind when below expected progress', () => {
    const today = new Date();
    const created = new Date(today); created.setDate(created.getDate() - 90);
    const target = new Date(today); target.setDate(target.getDate() + 10);
    const goal = {
      targetAmount: 1000,
      currentAmount: 100, // 10% done, but 90/100 days = 90% expected
      targetDate: target.toISOString(),
      createdAt: created.toISOString(),
    };
    const p = getGoalProgress(goal);
    expect(p.status).toBe('behind');
  });

  it('handles zero target amount safely', () => {
    const goal = { targetAmount: 0, currentAmount: 0 };
    const p = getGoalProgress(goal);
    expect(p.percentComplete).toBe(0);
  });
});
