export const DEBT_TYPES = [
  { id: 'credit_card', label: 'Credit Card', icon: '💳' },
  { id: 'car_loan', label: 'Car Loan', icon: '🚗' },
  { id: 'mortgage', label: 'Mortgage', icon: '🏠' },
  { id: 'student_loan', label: 'Student Loan', icon: '🎓' },
  { id: 'personal_loan', label: 'Personal Loan', icon: '💵' },
  { id: 'medical', label: 'Medical Debt', icon: '🏥' },
  { id: 'custom', label: 'Other / Custom', icon: '📌' },
];

export function getDebtTypeMeta(typeId) {
  return DEBT_TYPES.find(t => t.id === typeId) || DEBT_TYPES[DEBT_TYPES.length - 1];
}

export function getDebtLabel(debt) {
  if (debt.type === 'custom') return debt.customTypeName || debt.name || 'Custom';
  return getDebtTypeMeta(debt.type).label;
}

export function getDebtIcon(debt) {
  return getDebtTypeMeta(debt.type).icon;
}

export function totalDebt(debts) {
  return debts.reduce((sum, d) => sum + (d.currentBalance || 0), 0);
}

export function totalMonthlyPayments(debts) {
  return debts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0);
}

export function paidThisCycleCount(debts) {
  return debts.filter(d => d.paidThisCycle).length;
}

// Estimate debt-free month using simple linear: balance / monthly payment.
// Returns Date | null if can't be estimated.
export function estimateDebtFreeDate(debts) {
  const eligible = debts.filter(d => d.currentBalance > 0 && d.monthlyPayment > 0);
  if (eligible.length === 0) return null;
  const maxMonths = Math.max(
    ...eligible.map(d => Math.ceil(d.currentBalance / d.monthlyPayment))
  );
  if (!isFinite(maxMonths) || maxMonths <= 0) return null;
  const d = new Date();
  d.setMonth(d.getMonth() + maxMonths);
  return d;
}

// Reset paidThisCycle on all debts when a new budget cycle has started
export function resetDebtsForCycle(debts) {
  return debts.map(d => ({ ...d, paidThisCycle: false, paymentDate: null }));
}

export function createDebt({ name, type, customTypeName, currentBalance, monthlyPayment, interestRate, startDate }) {
  return {
    id: `debt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name || (type === 'custom' ? customTypeName : ''),
    type,
    customTypeName: type === 'custom' ? (customTypeName || '') : undefined,
    currentBalance: Number(currentBalance) || 0,
    monthlyPayment: Number(monthlyPayment) || 0,
    interestRate: interestRate !== undefined && interestRate !== '' ? Number(interestRate) : undefined,
    startDate: startDate || new Date().toISOString(),
    createdAt: new Date().toISOString(),
    paidThisCycle: false,
    paymentDate: null,
  };
}
