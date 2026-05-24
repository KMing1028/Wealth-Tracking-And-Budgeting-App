import React, { useState, useEffect } from 'react';
import { calcNetWorth, getGrowthMetrics, daysUntilReset, calcBucketTotals, getGoalProgress } from '../../utils/calculations';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { totalDebt, paidThisCycleCount, estimateDebtFreeDate } from '../../utils/debt';
import {
  shouldShowBudgetResetNotification, markBudgetResetShown,
  shouldShowWeeklySummary, generateWeeklySummary, markWeeklySummaryShown,
  checkDebtPaymentReminder, markDebtPaymentReminderShown,
} from '../../utils/notifications';

export default function Dashboard({ wealthData, currentBudget, settings, goals = [], debts = [], onNavigate }) {
  const currency = settings.currency;
  const cycleDay = settings.budgetCycleDay || 27;
  const totalAssets = calcNetWorth(wealthData);
  const totalDebts = totalDebt(debts);
  const netWorth = totalAssets - totalDebts;

  const [showResetCard, setShowResetCard] = useState(() => shouldShowBudgetResetNotification(cycleDay));
  const [showWeeklyCard, setShowWeeklyCard] = useState(() => shouldShowWeeklySummary());
  const [debtReminder, setDebtReminder] = useState(() => checkDebtPaymentReminder(debts, cycleDay));

  useEffect(() => {
    setShowResetCard(shouldShowBudgetResetNotification(cycleDay));
    setDebtReminder(checkDebtPaymentReminder(debts, cycleDay));
  }, [cycleDay, debts]);

  const weeklySummary = showWeeklyCard ? generateWeeklySummary(currentBudget) : null;
  const debtFreeDate = debts.length > 0 ? estimateDebtFreeDate(debts) : null;
  const paidCount = paidThisCycleCount(debts);

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
      {/* 1. Budget Cycle Reset banner */}
      {showResetCard && (
        <div className="budget-reset-banner">
          <div className="budget-reset-icon">🔄</div>
          <div className="budget-reset-content">
            <p className="budget-reset-title">Budget Cycle Reset</p>
            <p className="budget-reset-text">Your budget has reset on the {cycleDay}th. Ready to start fresh this cycle!</p>
          </div>
          <button className="budget-reset-dismiss" onClick={() => { markBudgetResetShown(); setShowResetCard(false); }} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* 5. Weekly Spending Summary card (Sundays) */}
      {showWeeklyCard && weeklySummary && (
        <div className="weekly-summary-card">
          <div className="weekly-summary-header">
            <p className="weekly-summary-title">📊 Weekly Spending Summary</p>
            <button className="weekly-summary-dismiss" onClick={() => { markWeeklySummaryShown(); setShowWeeklyCard(false); }} aria-label="Dismiss">×</button>
          </div>
          <p className="weekly-summary-intro">This week you spent:</p>
          <p className="weekly-summary-total">
            {weeklySummary.count} expense{weeklySummary.count !== 1 ? 's' : ''} &mdash; Total: <strong>{formatCurrency(weeklySummary.total, currency)}</strong>
          </p>
        </div>
      )}

      <header className="screen-header">
        <h1 className="screen-title">Dashboard</h1>
        <p className="screen-subtitle">Your financial overview</p>
      </header>

      {/* Net Worth Hero */}
      <div className="hero-card">
        <p className="hero-label">Net Worth <span className="hero-sublabel">(Assets − Debt)</span></p>
        <h2 className="hero-value">{formatCurrency(netWorth, currency)}</h2>
        <div className="growth-badges">
          <GrowthBadge label="YTD" pct={ytdPct} abs={totalGrowth.ytd.abs} currency={currency} />
          <GrowthBadge label="1Y" pct={oneYPct} abs={totalGrowth.oneY.abs} currency={currency} />
        </div>
      </div>

      {/* 3 Quick Stats */}
      <div className="quick-stats-grid">
        <button className="quick-stat-card assets" onClick={() => onNavigate('wealth')}>
          <span className="quick-stat-label">Assets</span>
          <strong className="quick-stat-value">{formatCurrency(totalAssets, currency)}</strong>
        </button>
        <button className="quick-stat-card debts" onClick={() => onNavigate('debt')}>
          <span className="quick-stat-label">Debt</span>
          <strong className="quick-stat-value">{formatCurrency(totalDebts, currency)}</strong>
        </button>
        <div className="quick-stat-card growth">
          <span className="quick-stat-label">YTD Growth</span>
          <strong className={`quick-stat-value ${ytdPct >= 0 ? 'green' : 'red'}`}>
            {ytdPct >= 0 ? '+' : ''}{ytdPct.toFixed(1)}%
          </strong>
        </div>
      </div>

      {/* Debt Payment Reminder */}
      {debtReminder && (
        <div className="notif-card budget-warn level-90">
          <div className="notif-card-header">
            <span className="notif-card-title">🏦 Debt Payment Due</span>
            <button className="notif-card-close" onClick={() => { markDebtPaymentReminderShown(); setDebtReminder(null); }} aria-label="Dismiss">×</button>
          </div>
          <p className="notif-card-body">
            You have <strong>{debtReminder.unpaidCount} unpaid debt{debtReminder.unpaidCount !== 1 ? 's' : ''}</strong> totaling <strong>{formatCurrency(debtReminder.totalUnpaid, currency)}</strong> due this cycle.
          </p>
          <div className="notif-card-actions">
            <button className="notif-card-btn" onClick={() => { onNavigate('debt'); markDebtPaymentReminderShown(); setDebtReminder(null); }}>View Debts</button>
          </div>
        </div>
      )}

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

      {/* Debt Summary */}
      {debts.length > 0 && (
        <div className="card">
          <div className="card-header-row">
            <span className="card-title">🏦 Debt Summary</span>
            <button className="link-btn" onClick={() => onNavigate('debt')}>View all →</button>
          </div>
          <div className="wealth-summary-list">
            <div className="wealth-summary-row">
              <span>Total Debt</span>
              <strong className="red">{formatCurrency(totalDebts, currency)}</strong>
            </div>
            <div className="wealth-summary-row">
              <span>Paid This Cycle</span>
              <strong>{paidCount} of {debts.length}</strong>
            </div>
            {debtFreeDate && (
              <div className="wealth-summary-row">
                <span>Debt-Free By</span>
                <strong>{debtFreeDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</strong>
              </div>
            )}
          </div>
        </div>
      )}

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
        <button className="quick-btn" onClick={() => onNavigate('debt')}>
          <span>🏦</span> Add Debt
        </button>
        <button className="quick-btn" onClick={() => onNavigate('goals')}>
          <span>🎯</span> Goals
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
