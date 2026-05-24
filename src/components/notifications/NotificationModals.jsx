import React, { useState, useEffect } from 'react';
import {
  shouldShowDailyReminder, markDailyReminderShown,
  checkGoalMilestones, markMilestoneShown,
  shouldShowWealthGrowthUpdate, calculateMonthlyGrowth, markWealthGrowthShown,
} from '../../utils/notifications';
import { formatCurrency } from '../../utils/formatters';

export default function NotificationModals({ goals, wealthData, settings, onNavigate }) {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const modals = [];

    if (shouldShowDailyReminder()) {
      modals.push({ type: 'daily' });
    }

    if (shouldShowWealthGrowthUpdate() && wealthData.length > 0) {
      const growth = calculateMonthlyGrowth(wealthData);
      modals.push({ type: 'wealth-growth', data: growth });
    }

    const milestone = checkGoalMilestones(goals);
    if (milestone) {
      modals.push({ type: 'milestone', data: milestone });
    }

    setQueue(modals);
  }, []); // intentionally runs once on mount

  function advance(markFn) {
    if (markFn) markFn();
    setQueue(prev => prev.slice(1));
  }

  const current = queue[0];
  if (!current) return null;

  const currency = settings.currency;

  if (current.type === 'daily') {
    return (
      <div className="notif-popup-overlay" onClick={() => advance(markDailyReminderShown)}>
        <div className="notif-popup" onClick={e => e.stopPropagation()}>
          <div className="notif-popup-header blue">
            <h2>📝 Don't Forget!</h2>
            <button className="notif-popup-close" onClick={() => advance(markDailyReminderShown)}>✕</button>
          </div>
          <div className="notif-popup-body">
            <p>Have you logged your expenses today? Keep your budget on track by recording your spending.</p>
            <button onClick={() => { advance(markDailyReminderShown); onNavigate('budget'); }}>
              Log Expense Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (current.type === 'wealth-growth') {
    const { change, pct, current: cur, past } = current.data;
    const isPositive = change >= 0;
    return (
      <div className="notif-popup-overlay" onClick={() => advance(markWealthGrowthShown)}>
        <div className="notif-popup" onClick={e => e.stopPropagation()}>
          <div className="notif-popup-header growth">
            <h2>📈 Growth Achievement!</h2>
            <button className="notif-popup-close" onClick={() => advance(markWealthGrowthShown)}>✕</button>
          </div>
          <div className="notif-popup-body">
            <div className="notif-popup-growth-stats">
              <p className="notif-popup-growth-label">Your Net Worth (This Month)</p>
              <p className={`notif-popup-growth-pct ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(pct).toFixed(1)}%
              </p>
            </div>
            <p className="notif-popup-detail">
              Your net worth {isPositive ? 'grew' : 'changed'} from {formatCurrency(past, currency)} to {formatCurrency(cur, currency)}.
              {isPositive ? ' Great job managing your wealth!' : ''}
            </p>
            <button className="notif-popup-btn growth-btn" onClick={() => { advance(markWealthGrowthShown); onNavigate('dashboard'); }}>
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (current.type === 'milestone') {
    const { goal, milestone: pct, key } = current.data;
    return (
      <div className="notif-popup-overlay" onClick={() => advance(() => markMilestoneShown(key))}>
        <div className="notif-popup" onClick={e => e.stopPropagation()}>
          <div className="notif-popup-header milestone">
            <h2>🎉 Congratulations!</h2>
            <button className="notif-popup-close" onClick={() => advance(() => markMilestoneShown(key))}>✕</button>
          </div>
          <div className="notif-popup-body milestone-body">
            <div className="notif-popup-milestone-icon">🎉</div>
            <p className="notif-popup-milestone-title">
              You reached {pct}% of your {goal.name}!
            </p>
            <p className="notif-popup-milestone-progress">
              You've saved {formatCurrency(goal.currentAmount, currency)} of {formatCurrency(goal.targetAmount, currency)}. Keep going!
            </p>
            <button className="notif-popup-btn milestone-btn" onClick={() => { advance(() => markMilestoneShown(key)); onNavigate('goals'); }}>
              View Goal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
