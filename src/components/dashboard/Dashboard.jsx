import React, { useState, useEffect } from 'react';
import { calcNetWorth, getGrowthMetrics, daysUntilReset, calcBucketTotals, getGoalProgress } from '../../utils/calculations';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import {
  shouldShowBudgetResetNotification, markBudgetResetShown,
  shouldShowWeeklySummary, generateWeeklySummary, markWeeklySummaryShown,
  shouldShowWealthGrowthUpdate, calculateMonthlyGrowth, markWealthGrowthShown,
} from '../../utils/notifications';

export default function Dashboard({ wealthData, currentBudget, settings, goals = [], onNavigate }) {
  const currency = settings.currency;
  const cycleDay = settings.budgetCycleDay || 27;
  const netWorth = calcNetWorth(wealthData);

  const [showResetCard, setShowResetCard] = useState(() => shouldShowBudgetResetNotification(cycleDay));
  const [showWeeklyCard, setShowWeeklyCard] = useState(() => shouldShowWeeklySummary());
  const [showWealthCard, setShowWealthCard] = useState(() => shouldShowWealthGrowthUpdate());

  useEffect(() => {
    setShowResetCard(shouldShowBudgetResetNotification(cycleDay));
  }, [cycleDay]);

  const weeklySummary = showWeeklyCard ? generateWeeklySummary(currentBudget) : null;
  const wealthGrowth = showWealthCard ? calculateMonthlyGrowth(wealthData) : null;

  // Aggregate growth across all wealth items
  const totalGrowth = wealthData.reduce((acc, item) => {
    const m = getGrowthMetrics(item);
    return {
      ytd: { abs: acc.ytd.abs + (m.ytd?.abs || 0), base: acc.ytd.base + (m.ytd ? item.currentValue - (m.ytd.abs || 0) : 0) },
      oneY: { abs: acc.oneY.abs + (m.oneY?.abs || 0), base: acc.oneY.base + (m.oneY ? item.currentValue - (m.oneY.abs || 0) : 0) },
    };
  }, { ytd: { abs: 0, base: 0 }, oneY: { abs: 0, base: 0 } });

  const ytdPct = totalGrowth.ytd.base > 0 ? (totalGrowth.ytd.abs / totalGrowth.ytd.base) * 100 : 0;
  const oneYPct = totalGrowth.oneY.base > 0 ? (totalGrowth.oneY.abs / totalGrowth.oneY.base) * 100 : 0;

  const totalSpent = currentBudget.expenses.reduce((s, e) => s + e.amount, 0);
  const budgetLimit = currentBudget.budgetLimit || 0;
  const budgetPct = budgetLimit > 0 ? Math.min((totalSpent / budgetLimit) * 100, 100) : 0;
  const remaining = budgetLimit - totalSpent;
  const buckets = calcBucketTotals(currentBudget.expenses);
  const daysLeft = daysUntilReset(cycleDay);

  const progressColor = budgetPct >= 90 ? '#ef4444' : budgetPct >= 70 ? '#f59e0b' : '#10b981';

  return (
    <div className="screen-container">
      {/* 1. Budget Cycle Reset */}
      {showResetCard && (
        <div className="notif-card reset">
          <div className="notif-card-header">
            <span className="notif-card-title">🔄 Budget Cycle Reset</span>
            <button className="notif-card-close" onClick={() => { markBudgetResetShown(); setShowResetCard(false); }} aria-label="Dismiss">×</button>
          </div>
          <p className="notif-card-body">Your budget has reset for a new cycle! Expenses from last cycle are saved in history.</p>
          <div className="notif-card-actions">
            <button className="notif-card-btn" onClick={() => { onNavigate('budget'); markBudgetResetShown(); setShowResetCard(false); }}>View Budget</button>
          </div>
        </div>
      )}

      {/* 5. Weekly Spending Summary (Sundays) */}
      {showWeeklyCard && weeklySummary && (
        <div className="notif-card weekly">
          <div className="notif-card-header">
            <span className="notif-card-title">📅 Weekly Spending Summary</span>
            <button className="notif-card-close" onClick={() => { markWeeklySummaryShown(); setShowWeeklyCard(false); }} aria-label="Dismiss">×</button>
          </div>
          <p className="notif-card-body">
            This week you logged <strong>{weeklySummary.count} expense{weeklySummary.count !== 1 ? 's' : ''}</strong> totalling <strong>{formatCurrency(weeklySummary.total, currency)}</strong>.
          </p>
          <div className="notif-card-actions">
            <button className="notif-card-btn" onClick={() => { onNavigate('analytics'); markWeeklySummaryShown(); setShowWeeklyCard(false); }}>See Analytics</button>
          </div>
        </div>
      )}

      {/* 6. Wealth Growth Update (monthly) */}
      {showWealthCard && wealthGrowth && wealthData.length > 0 && (
        <div className="notif-card wealth-growth">
          <div className="notif-card-header">
            <span className="notif-card-title">💼 Monthly Wealth Update</span>
            <button className="notif-card-close" onClick={() => { markWealthGrowthShown(); setShowWealthCard(false); }} aria-label="Dismiss">×</button>
          </div>
          <p className="notif-card-body">Your net worth this month:</p>
          <div className={`notif-growth-stat ${wealthGrowth.change >= 0 ? 'positive' : 'negative'}`}>
            {wealthGrowth.change >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(wealthGrowth.change), currency)}
            <span style={{ fontSize: '13px', fontWeight: 400, opacity: 0.8 }}>
              ({wealthGrowth.pct >= 0 ? '+' : ''}{wealthGrowth.pct.toFixed(1)}%)
            </span>
          </div>
          <div className="notif-card-actions">
            <button className="notif-card-btn" onClick={() => { onNavigate('wealth'); markWealthGrowthShown(); setShowWealthCard(false); }}>View Wealth</button>
          </div>
        </div>
      )}

      <header className="screen-header">
        <h1 className="screen-title">Dashboard</h1>
        <p className="screen-subtitle">Your financial overview</p>
      </header>

      {/* Net Worth Hero */}
      <div className="hero-card">
        <p className="hero-label">Total Net Worth</p>
        <h2 className="hero-value">{formatCurrency(netWorth, currency)}</h2>
        <div className="growth-badges">
          <GrowthBadge label="YTD" pct={ytdPct} abs={totalGrowth.ytd.abs} currency={currency} />
          <GrowthBadge label="1Y" pct={oneYPct} abs={totalGrowth.oneY.abs} currency={currency} />
        </div>
      </div>

      {/* Budget Summary */}
      <div className="card">
        <div className="card-header-row">
          <span className="card-title">💳 Monthly Budget</span>
          <span className="days-badge">{daysLeft}d until reset</span>
        </div>
        {budgetLimit > 0 ? (
          <>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${budgetPct}%`, backgroundColor: progressColor }} />
            </div>
            <div className="budget-row">
              <span>Spent: <strong>{formatCurrency(totalSpent, currency)}</strong></span>
              <span className={remaining < 0 ? 'red' : 'green'}>
                {remaining < 0 ? 'Over by' : 'Left:'} {formatCurrency(Math.abs(remaining), currency)}
              </span>
            </div>
            <div className="bucket-summary">
              <BucketPill label="Needs" value={buckets.needs} currency={currency} color="var(--needs-color)" />
              <BucketPill label="Wants" value={buckets.wants} currency={currency} color="var(--wants-color)" />
              <BucketPill label="Save" value={buckets.save_invest} currency={currency} color="var(--invest-color)" />
            </div>
          </>
        ) : (
          <p className="empty-hint">No budget set. <button className="link-btn" onClick={() => onNavigate('budget')}>Set your budget →</button></p>
        )}
      </div>

      {/* Wealth Breakdown */}
      <div className="card">
        <div className="card-header-row">
          <span className="card-title">📊 Wealth Breakdown</span>
          <button className="link-btn" onClick={() => onNavigate('wealth')}>View all →</button>
        </div>
        {wealthData.length > 0 ? (
          <div className="wealth-summary-list">
            {['savings', 'stocks', 'retirement'].map(cat => {
              const items = wealthData.filter(w => w.category === cat);
              if (!items.length) return null;
              const total = items.reduce((s, w) => s + w.currentValue, 0);
              const icons = { savings: '🏦', stocks: '📈', retirement: '🎯' };
              const labels = { savings: 'Savings', stocks: 'Stocks', retirement: 'Retirement' };
              return (
                <div key={cat} className="wealth-summary-row">
                  <span>{icons[cat]} {labels[cat]}</span>
                  <strong>{formatCurrency(total, currency)}</strong>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-hint">No wealth data. <button className="link-btn" onClick={() => onNavigate('wealth')}>Add your first entry →</button></p>
        )}
      </div>

      {/* Goals Summary */}
      {goals.length > 0 && (
        <div className="card">
          <div className="card-header-row">
            <span className="card-title">🎯 Savings Goals</span>
            <button className="link-btn" onClick={() => onNavigate('goals')}>View all →</button>
          </div>
          <div className="wealth-summary-list">
            {goals.slice(0, 3).map(g => {
              const p = getGoalProgress(g);
              return (
                <div key={g.id}>
                  <div className="wealth-summary-row" style={{ border: 'none', paddingBottom: 4 }}>
                    <span>{g.name}</span>
                    <strong>{p.percentComplete.toFixed(0)}%</strong>
                  </div>
                  <div className="progress-track" style={{ marginBottom: 8 }}>
                    <div className="progress-fill" style={{ width: `${p.percentComplete}%`, backgroundColor: 'var(--primary)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-btn" onClick={() => onNavigate('wealth')}>
          <span>➕</span> Add Wealth
        </button>
        <button className="quick-btn" onClick={() => onNavigate('budget')}>
          <span>💸</span> Log Expense
        </button>
      </div>
      <div className="quick-actions" style={{ marginTop: 10 }}>
        <button className="quick-btn" onClick={() => onNavigate('goals')}>
          <span>🎯</span> Goals
        </button>
        <button className="quick-btn" onClick={() => onNavigate('analytics')}>
          <span>📊</span> Analytics
        </button>
      </div>
    </div>
  );
}

function GrowthBadge({ label, pct, abs, currency }) {
  const positive = pct >= 0;
  return (
    <div className={`growth-badge ${positive ? 'positive' : 'negative'}`}>
      <span className="badge-label">{label}</span>
      <span className="badge-pct">{formatPercent(pct)}</span>
      <span className="badge-abs">{positive ? '+' : ''}{formatCurrency(abs, currency)}</span>
    </div>
  );
}

function BucketPill({ label, value, currency, color }) {
  return (
    <div className="bucket-pill" style={{ borderLeftColor: color }}>
      <span className="pill-label">{label}</span>
      <span className="pill-value">{formatCurrency(value, currency)}</span>
    </div>
  );
}
