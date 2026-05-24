// Calculate growth % and absolute change between two values
export function calcGrowth(current, past) {
  if (!past || past === 0) return { pct: 0, abs: 0 };
  const abs = current - past;
  const pct = (abs / past) * 100;
  return { pct, abs };
}

// Get value at a specific period from entries array
export function getValueAtPeriod(entries, periodStart) {
  if (!entries || entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const match = sorted.find(e => new Date(e.date) >= periodStart);
  return match ? match.value : sorted[0].value;
}

export function getGrowthMetrics(item) {
  const now = new Date();
  const ytdStart = new Date(now.getFullYear(), 0, 1);
  const oneYearAgo = new Date(now); oneYearAgo.setFullYear(now.getFullYear() - 1);
  const fiveYearsAgo = new Date(now); fiveYearsAgo.setFullYear(now.getFullYear() - 5);

  const current = item.currentValue;
  const ytdPast = getValueAtPeriod(item.entries, ytdStart);
  const oneYPast = getValueAtPeriod(item.entries, oneYearAgo);
  const fiveYPast = getValueAtPeriod(item.entries, fiveYearsAgo);

  return {
    ytd: ytdPast !== null ? calcGrowth(current, ytdPast) : null,
    oneY: oneYPast !== null ? calcGrowth(current, oneYPast) : null,
    fiveY: fiveYPast !== null ? calcGrowth(current, fiveYPast) : null,
  };
}

export function calcNetWorth(wealthData) {
  return wealthData.reduce((sum, item) => sum + (item.currentValue || 0), 0);
}

export function buildNetWorthChartData(wealthData) {
  const dateMap = {};
  wealthData.forEach(item => {
    (item.entries || []).forEach(entry => {
      const dateKey = entry.date.split('T')[0];
      if (!dateMap[dateKey]) dateMap[dateKey] = {};
      dateMap[dateKey][item.id] = entry.value;
    });
  });

  const dates = Object.keys(dateMap).sort();
  const lastKnown = {};

  return dates.map(date => {
    Object.keys(dateMap[date]).forEach(id => {
      lastKnown[id] = dateMap[date][id];
    });
    const total = wealthData.reduce((sum, item) => sum + (lastKnown[item.id] || 0), 0);
    return { date, total };
  });
}

// ---- Custom budget cycle helpers (Feature 2) ----

// Resolve cycle date for a given year/month, snapping invalid days to last day of month
export function resolveCycleDate(year, month, cycleDay) {
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const day = Math.min(cycleDay, lastDayOfMonth);
  return new Date(year, month, day);
}

// Current budget cycle window using a configurable start day
export function getCurrentBudgetCycle(cycleDay = 27) {
  const now = new Date();
  const thisMonthStart = resolveCycleDate(now.getFullYear(), now.getMonth(), cycleDay);
  let startDate;
  if (now >= thisMonthStart) {
    startDate = thisMonthStart;
  } else {
    startDate = resolveCycleDate(now.getFullYear(), now.getMonth() - 1, cycleDay);
  }
  // End date = day before next cycle start
  const nextStart = resolveCycleDate(startDate.getFullYear(), startDate.getMonth() + 1, cycleDay);
  const endDate = new Date(nextStart);
  endDate.setDate(endDate.getDate() - 1);
  return { startDate, endDate };
}

export function getNextResetDate(cycleDay = 27) {
  const now = new Date();
  const thisMonth = resolveCycleDate(now.getFullYear(), now.getMonth(), cycleDay);
  if (now < thisMonth) return thisMonth;
  return resolveCycleDate(now.getFullYear(), now.getMonth() + 1, cycleDay);
}

export function daysUntilReset(cycleDay = 27) {
  const next = getNextResetDate(cycleDay);
  const now = new Date();
  const diff = next - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getOrCreateCurrentBudget(budgetHistory, cycleDay = 27) {
  const { startDate, endDate } = getCurrentBudgetCycle(cycleDay);
  const startKey = startDate.toISOString().split('T')[0];
  const existing = budgetHistory.find(b => b.monthStartDate.split('T')[0] === startKey);
  if (existing) return existing;
  return {
    id: `budget-${startKey}`,
    monthStartDate: startDate.toISOString(),
    monthEndDate: endDate.toISOString(),
    budgetLimit: 0,
    expenses: [],
  };
}

// Bucket totals
export function calcBucketTotals(expenses) {
  return expenses.reduce((acc, e) => {
    acc[e.bucket] = (acc[e.bucket] || 0) + e.amount;
    return acc;
  }, { needs: 0, wants: 0, save_invest: 0 });
}

// ---- Savings Goal helpers (Feature 3) ----

export function getGoalProgress(goal) {
  const percentComplete = goal.targetAmount > 0
    ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
    : 0;

  if (!goal.targetDate) {
    return { percentComplete, status: 'in_progress', message: 'In progress' };
  }

  const today = new Date();
  const targetDate = new Date(goal.targetDate);
  const created = new Date(goal.createdAt || today);
  const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));

  if (percentComplete >= 100) {
    return { percentComplete: 100, status: 'completed', message: 'Goal reached! 🎉' };
  }

  if (daysRemaining < 0) {
    return { percentComplete, status: 'missed', message: `Deadline passed ${Math.abs(daysRemaining)}d ago` };
  }

  const totalDays = Math.max((targetDate - created) / (1000 * 60 * 60 * 24), 1);
  const daysPassed = Math.max((today - created) / (1000 * 60 * 60 * 24), 0);
  const expectedProgress = (daysPassed / totalDays) * 100;

  if (percentComplete >= expectedProgress) {
    return {
      percentComplete,
      status: 'on_track',
      message: 'On track',
      daysRemaining,
      insight: daysRemaining > 0 ? `${daysRemaining} days to target` : 'Target reached today',
    };
  }

  const shortfall = (goal.targetAmount * (expectedProgress / 100)) - goal.currentAmount;
  const remaining = goal.targetAmount - goal.currentAmount;
  const dailyNeeded = daysRemaining > 0 ? remaining / daysRemaining : remaining;
  return {
    percentComplete,
    status: 'behind',
    message: `Behind by ${shortfall.toFixed(0)}`,
    daysRemaining,
    insight: `Save ${dailyNeeded.toFixed(0)}/day to catch up`,
  };
}

// ---- Analytics helpers (Feature 4) ----

export function getMonthlyTotals(budgets) {
  return budgets.map(b => ({
    monthStartDate: b.monthStartDate,
    total: b.expenses.reduce((s, e) => s + e.amount, 0),
    buckets: calcBucketTotals(b.expenses),
  }));
}

export function getCategoryTotalsByMonth(budgets) {
  // Returns { categoryName: [{ month, amount }] }
  const result = {};
  budgets.forEach(b => {
    const monthLabel = new Date(b.monthStartDate).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    const catMap = {};
    b.expenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    Object.entries(catMap).forEach(([cat, amt]) => {
      if (!result[cat]) result[cat] = [];
      result[cat].push({ month: monthLabel, amount: amt, monthStartDate: b.monthStartDate });
    });
  });
  return result;
}

export function generateInsights(currentBudget, history, currency) {
  const insights = [];
  if (!currentBudget || history.length < 2) return insights;

  const currentTotals = {};
  currentBudget.expenses.forEach(e => {
    currentTotals[e.category] = (currentTotals[e.category] || 0) + e.amount;
  });

  const pastBudgets = history.filter(b => b.id !== currentBudget.id);
  if (pastBudgets.length === 0) return insights;

  // Average per category
  const avgTotals = {};
  pastBudgets.forEach(b => {
    const catMap = {};
    b.expenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    Object.entries(catMap).forEach(([cat, amt]) => {
      if (!avgTotals[cat]) avgTotals[cat] = { sum: 0, months: 0 };
      avgTotals[cat].sum += amt;
      avgTotals[cat].months++;
    });
  });

  // Generate variance insights for categories present in both
  Object.entries(currentTotals).forEach(([cat, current]) => {
    const avgData = avgTotals[cat];
    if (!avgData || avgData.months === 0) return;
    const avg = avgData.sum / avgData.months;
    if (avg < 10) return; // skip tiny amounts
    const pctChange = ((current - avg) / avg) * 100;
    if (Math.abs(pctChange) >= 15) {
      insights.push({
        category: cat,
        pctChange,
        current,
        avg,
        type: pctChange > 0 ? 'over' : 'under',
        message: `${cat} is ${Math.abs(pctChange).toFixed(0)}% ${pctChange > 0 ? 'higher' : 'lower'} than your ${avgData.months}-month average`,
      });
    }
  });

  // Bucket-level insights
  const currentBuckets = calcBucketTotals(currentBudget.expenses);
  const avgBuckets = pastBudgets.map(b => calcBucketTotals(b.expenses));
  const bucketAvg = (key) => avgBuckets.reduce((s, b) => s + b[key], 0) / avgBuckets.length;
  ['needs', 'wants', 'save_invest'].forEach(b => {
    const avg = bucketAvg(b);
    if (avg < 50) return;
    const pct = ((currentBuckets[b] - avg) / avg) * 100;
    if (Math.abs(pct) >= 20) {
      const labels = { needs: 'Needs', wants: 'Wants', save_invest: 'Save & Invest' };
      insights.push({
        category: labels[b],
        pctChange: pct,
        current: currentBuckets[b],
        avg,
        type: pct > 0 ? 'over' : 'under',
        message: `${labels[b]} spending is ${Math.abs(pct).toFixed(0)}% ${pct > 0 ? 'higher' : 'lower'} than average`,
      });
    }
  });

  return insights.sort((a, b) => Math.abs(b.pctChange) - Math.abs(a.pctChange)).slice(0, 6);
}
