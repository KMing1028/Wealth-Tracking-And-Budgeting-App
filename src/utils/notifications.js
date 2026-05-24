const todayKey = () => new Date().toISOString().split('T')[0];

const thisWeekKey = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // rewind to Sunday
  return d.toISOString().split('T')[0];
};

const thisMonthKey = () => new Date().toISOString().slice(0, 7);

// --- 1. Budget Cycle Reset ---
export function shouldShowBudgetResetNotification(cycleDay) {
  if (new Date().getDate() !== cycleDay) return false;
  return localStorage.getItem('budgetResetShown') !== todayKey();
}
export function markBudgetResetShown() {
  localStorage.setItem('budgetResetShown', todayKey());
}

// --- 2. Daily Expense Reminder ---
export function shouldShowDailyReminder() {
  return localStorage.getItem('dailyReminderShown') !== todayKey();
}
export function markDailyReminderShown() {
  localStorage.setItem('dailyReminderShown', todayKey());
}

// --- 3. Budget Limit Warning ---
const WARN_THRESHOLDS = [75, 90, 100];

export function checkBudgetLimitWarning(currentBudget) {
  const { id, expenses, budgetLimit } = currentBudget;
  if (!budgetLimit || budgetLimit <= 0) return null;
  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  const pct = (spent / budgetLimit) * 100;
  let level = null;
  for (const t of WARN_THRESHOLDS) {
    if (pct >= t) level = t;
  }
  if (!level) return null;
  const shown = parseInt(localStorage.getItem(`budgetWarning_${id}`) || '0', 10);
  if (shown >= level) return null;
  return { level, pct: Math.min(pct, 100).toFixed(0) };
}
export function markBudgetWarningShown(budgetId, level) {
  localStorage.setItem(`budgetWarning_${budgetId}`, String(level));
}

// --- 4. Savings Goal Milestones ---
const MILESTONES = [25, 50, 75, 100];

function parseStoredArray(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}

export function checkGoalMilestones(goals) {
  const done = parseStoredArray('completedMilestones');
  for (const goal of goals) {
    const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    for (const m of MILESTONES) {
      if (pct >= m) {
        const key = `${goal.id}:${m}`;
        if (!done.includes(key)) return { goal, milestone: m, key };
      }
    }
  }
  return null;
}
export function markMilestoneShown(key) {
  const done = parseStoredArray('completedMilestones');
  if (!done.includes(key)) {
    done.push(key);
    localStorage.setItem('completedMilestones', JSON.stringify(done));
  }
}

// --- 5. Weekly Spending Summary ---
export function shouldShowWeeklySummary() {
  if (new Date().getDay() !== 0) return false; // Sundays only
  return localStorage.getItem('weeklySummaryShown') !== thisWeekKey();
}
export function generateWeeklySummary(currentBudget) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  cutoff.setHours(0, 0, 0, 0);
  const weekExpenses = currentBudget.expenses.filter(e => new Date(e.date) >= cutoff);
  const total = weekExpenses.reduce((s, e) => s + e.amount, 0);
  return { total, count: weekExpenses.length };
}
export function markWeeklySummaryShown() {
  localStorage.setItem('weeklySummaryShown', thisWeekKey());
}

// --- Debt Payment Reminder ---
// Show on budget cycle reset day if there are unpaid debts.
export function checkDebtPaymentReminder(debts, cycleDay) {
  if (!debts || debts.length === 0) return null;
  const isResetDay = new Date().getDate() === cycleDay;
  if (!isResetDay) return null;
  if (localStorage.getItem('debtPaymentReminderShown') === todayKey()) return null;
  const unpaid = debts.filter(d => !d.paidThisCycle && d.monthlyPayment > 0);
  if (unpaid.length === 0) return null;
  return { unpaidCount: unpaid.length, totalUnpaid: unpaid.reduce((s, d) => s + d.monthlyPayment, 0) };
}
export function markDebtPaymentReminderShown() {
  localStorage.setItem('debtPaymentReminderShown', todayKey());
}

// --- 6. Wealth Growth Update ---
export function shouldShowWealthGrowthUpdate() {
  return localStorage.getItem('wealthGrowthShown') !== thisMonthKey();
}
export function calculateMonthlyGrowth(wealthData) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 1);
  let current = 0;
  let past = 0;
  for (const item of wealthData) {
    current += item.currentValue || 0;
    const history = item.history || [];
    const pastEntry = history
      .filter(h => new Date(h.date) <= cutoff)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    past += pastEntry ? pastEntry.value : item.currentValue;
  }
  const change = current - past;
  const pct = past > 0 ? (change / past) * 100 : 0;
  return { current, past, change, pct };
}
export function markWealthGrowthShown() {
  localStorage.setItem('wealthGrowthShown', thisMonthKey());
}
