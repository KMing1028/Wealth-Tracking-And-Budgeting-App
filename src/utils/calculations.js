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
  // Find first entry on or after periodStart
  const match = sorted.find(e => new Date(e.date) >= periodStart);
  return match ? match.value : sorted[0].value;
}

// Get YTD, 1Y, 5Y growth metrics for a wealth item
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

// Calculate total net worth from wealth array
export function calcNetWorth(wealthData) {
  return wealthData.reduce((sum, item) => sum + (item.currentValue || 0), 0);
}

// Build line chart data from all wealth entries
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

// Get current budget cycle (27th to 26th)
export function getCurrentBudgetCycle() {
  const now = new Date();
  let startDate;
  if (now.getDate() >= 27) {
    startDate = new Date(now.getFullYear(), now.getMonth(), 27);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 27);
  }
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 26);
  return { startDate, endDate };
}

// Get next budget reset date
export function getNextResetDate() {
  const now = new Date();
  if (now.getDate() >= 27) {
    return new Date(now.getFullYear(), now.getMonth() + 1, 27);
  }
  return new Date(now.getFullYear(), now.getMonth(), 27);
}

// Days until next reset
export function daysUntilReset() {
  const next = getNextResetDate();
  const now = new Date();
  const diff = next - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Find or create budget for current cycle
export function getOrCreateCurrentBudget(budgetHistory) {
  const { startDate, endDate } = getCurrentBudgetCycle();
  const existing = budgetHistory.find(b => {
    const bs = new Date(b.monthStartDate);
    return bs.getTime() === startDate.getTime();
  });
  if (existing) return existing;
  const monthKey = startDate.toISOString().split('T')[0];
  return {
    id: `budget-${monthKey}`,
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
