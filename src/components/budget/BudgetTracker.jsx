import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { calcBucketTotals } from '../../utils/calculations';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Modal from '../common/Modal';
import ExpenseForm from './ExpenseForm';

const BUCKET_CONFIG = {
  needs: { label: '🏠 Needs', color: 'var(--needs-color)' },
  wants: { label: '🎉 Wants', color: 'var(--wants-color)' },
  save_invest: { label: '💪 Save & Invest', color: 'var(--invest-color)' },
};

const EXPENSE_CATEGORIES = {
  needs: ['Housing', 'Utilities', 'Transportation', 'Groceries & Food', 'Insurance', 'Education'],
  wants: ['Dining Out & Entertainment', 'Shopping & Personal Care', 'Subscriptions', 'Travel & Leisure', 'Hobbies & Recreation'],
  save_invest: ['Emergency Fund Top-ups', 'Stock Market Investments', 'Retirement Account Contributions', 'Crypto/Alternative Investments', 'Savings Goals'],
};

const CATEGORY_ICONS = {
  'Housing': '🏠', 'Utilities': '💡', 'Transportation': '🚗', 'Groceries & Food': '🛒',
  'Insurance': '🛡️', 'Education': '📚', 'Dining Out & Entertainment': '🍽️',
  'Shopping & Personal Care': '🛍️', 'Subscriptions': '📺', 'Travel & Leisure': '✈️',
  'Hobbies & Recreation': '🎮', 'Emergency Fund Top-ups': '🏦',
  'Stock Market Investments': '📈', 'Retirement Account Contributions': '🎯',
  'Crypto/Alternative Investments': '🪙', 'Savings Goals': '🏠',
};

export default function BudgetTracker({ budgetHistory, updateCurrentBudget, currentBudget, settings }) {
  const currency = settings.currency;
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  // Build sorted month list (most recent first)
  const allBudgets = useMemo(() => {
    const inHistory = budgetHistory.find(b => b.monthStartDate === currentBudget.monthStartDate);
    const current = inHistory || currentBudget;
    const others = budgetHistory.filter(b => b.monthStartDate !== currentBudget.monthStartDate);
    return [current, ...others.sort((a, b) => new Date(b.monthStartDate) - new Date(a.monthStartDate))];
  }, [budgetHistory, currentBudget]);

  const viewBudget = allBudgets[selectedMonthIndex] || currentBudget;
  const isCurrentMonth = selectedMonthIndex === 0;

  const totalSpent = viewBudget.expenses.reduce((s, e) => s + e.amount, 0);
  const budgetLimit = viewBudget.budgetLimit || 0;
  const remaining = budgetLimit - totalSpent;
  const budgetPct = budgetLimit > 0 ? Math.min((totalSpent / budgetLimit) * 100, 100) : 0;
  const progressColor = budgetPct >= 90 ? '#ef4444' : budgetPct >= 70 ? '#f59e0b' : '#10b981';
  const buckets = calcBucketTotals(viewBudget.expenses);

  // Monthly comparison chart data (last 6 months)
  const comparisonData = useMemo(() => {
    return [...allBudgets].reverse().slice(-6).map(b => {
      const spent = b.expenses.reduce((s, e) => s + e.amount, 0);
      const d = new Date(b.monthStartDate);
      return {
        label: d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
        needs: calcBucketTotals(b.expenses).needs || 0,
        wants: calcBucketTotals(b.expenses).wants || 0,
        save_invest: calcBucketTotals(b.expenses).save_invest || 0,
        total: spent,
      };
    });
  }, [allBudgets]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = {};
    viewBudget.expenses.forEach(e => {
      if (!map[e.category]) map[e.category] = { category: e.category, bucket: e.bucket, total: 0, count: 0 };
      map[e.category].total += e.amount;
      map[e.category].count++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [viewBudget]);

  function handleSaveExpense(expense) {
    if (editExpense) {
      updateCurrentBudget(b => ({
        ...b,
        expenses: b.expenses.map(e => e.id === expense.id ? expense : e),
      }));
    } else {
      updateCurrentBudget(b => ({ ...b, expenses: [...b.expenses, expense] }));
    }
    setShowExpenseForm(false);
    setEditExpense(null);
  }

  function handleDeleteExpense(id) {
    updateCurrentBudget(b => ({ ...b, expenses: b.expenses.filter(e => e.id !== id) }));
    setDeleteConfirm(null);
  }

  function handleSetBudget(e) {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      updateCurrentBudget(b => ({ ...b, budgetLimit: val }));
      setShowBudgetModal(false);
      setBudgetInput('');
    }
  }

  function monthLabel(b) {
    const d = new Date(b.monthStartDate);
    return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }

  return (
    <div className="screen-container">
      <header className="screen-header">
        <h1 className="screen-title">Budget Tracker</h1>
        {isCurrentMonth && (
          <button className="btn-primary btn-sm" onClick={() => setShowExpenseForm(true)}>+ Expense</button>
        )}
      </header>

      {/* Month Selector */}
      <div className="month-selector">
        {allBudgets.map((b, i) => (
          <button
            key={b.id || i}
            className={`month-btn ${selectedMonthIndex === i ? 'active' : ''}`}
            onClick={() => setSelectedMonthIndex(i)}
          >
            {i === 0 ? 'This Month' : monthLabel(b)}
          </button>
        ))}
      </div>

      {/* Budget Progress */}
      <div className="card">
        <div className="card-header-row">
          <span className="card-title">📊 {monthLabel(viewBudget)}</span>
          {isCurrentMonth && (
            <button className="link-btn" onClick={() => { setBudgetInput(budgetLimit?.toString() || ''); setShowBudgetModal(true); }}>
              {budgetLimit ? 'Edit limit' : 'Set limit'}
            </button>
          )}
        </div>
        {budgetLimit > 0 ? (
          <>
            <div className="progress-track large">
              <div className="progress-fill" style={{ width: `${budgetPct}%`, backgroundColor: progressColor }} />
            </div>
            <div className="budget-stats">
              <div className="budget-stat">
                <span>Budget</span>
                <strong>{formatCurrency(budgetLimit, currency)}</strong>
              </div>
              <div className="budget-stat">
                <span>Spent</span>
                <strong className="red">{formatCurrency(totalSpent, currency)}</strong>
              </div>
              <div className="budget-stat">
                <span>{remaining >= 0 ? 'Remaining' : 'Over'}</span>
                <strong className={remaining >= 0 ? 'green' : 'red'}>{formatCurrency(Math.abs(remaining), currency)}</strong>
              </div>
            </div>
          </>
        ) : (
          <p className="empty-hint">
            {isCurrentMonth
              ? <><button className="link-btn" onClick={() => setShowBudgetModal(true)}>Set a monthly budget limit</button> to track your spending.</>
              : 'No budget limit was set for this month.'}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {['overview', 'expenses', 'trends'].map(t => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Bucket Cards */}
          <div className="bucket-cards">
            {Object.entries(BUCKET_CONFIG).map(([key, cfg]) => {
              const amt = buckets[key] || 0;
              const pct = totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(0) : 0;
              return (
                <div key={key} className="bucket-card" style={{ borderTopColor: cfg.color }}>
                  <p className="bucket-card-label">{cfg.label}</p>
                  <p className="bucket-card-value">{formatCurrency(amt, currency)}</p>
                  <p className="bucket-card-pct">{pct}% of spending</p>
                  <div className="bucket-card-bar-track">
                    <div className="bucket-card-bar-fill" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category Breakdown */}
          {categoryBreakdown.length > 0 && (
            <div className="card">
              <h3 className="card-title">Category Breakdown</h3>
              {categoryBreakdown.map(c => (
                <div key={c.category} className="category-breakdown-row">
                  <div className="cat-info">
                    <span className="cat-icon">{CATEGORY_ICONS[c.category] || '💰'}</span>
                    <span className="cat-name">{c.category}</span>
                    <span className="cat-bucket-tag" style={{ backgroundColor: BUCKET_CONFIG[c.bucket]?.color }}>
                      {c.bucket === 'save_invest' ? 'Save' : c.bucket}
                    </span>
                  </div>
                  <div className="cat-right">
                    <strong>{formatCurrency(c.total, currency)}</strong>
                    <span className="cat-pct">{totalSpent > 0 ? ((c.total / totalSpent) * 100).toFixed(0) : 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'expenses' && (
        <div className="card">
          <h3 className="card-title">All Expenses</h3>
          {viewBudget.expenses.length === 0 ? (
            <p className="empty-hint">No expenses logged yet.</p>
          ) : (
            [...viewBudget.expenses]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(expense => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  currency={currency}
                  canEdit={isCurrentMonth}
                  onEdit={() => { setEditExpense(expense); setShowExpenseForm(true); }}
                  onDelete={() => setDeleteConfirm(expense.id)}
                />
              ))
          )}
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="card">
          <h3 className="card-title">Monthly Comparison</h3>
          {comparisonData.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={comparisonData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v, name) => [formatCurrency(v, currency), BUCKET_CONFIG[name]?.label || name]}
                  contentStyle={{ fontSize: 12, borderRadius: '8px' }}
                />
                <Legend formatter={v => BUCKET_CONFIG[v]?.label || v} iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="needs" stackId="a" fill="var(--needs-color)" />
                <Bar dataKey="wants" stackId="a" fill="var(--wants-color)" />
                <Bar dataKey="save_invest" stackId="a" fill="var(--invest-color)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-hint">Add more months of data to see trends.</p>
          )}
        </div>
      )}

      {/* Modals */}
      {showExpenseForm && (
        <Modal
          title={editExpense ? 'Edit Expense' : 'Log Expense'}
          onClose={() => { setShowExpenseForm(false); setEditExpense(null); }}
        >
          <ExpenseForm
            expense={editExpense}
            categories={EXPENSE_CATEGORIES}
            onSave={handleSaveExpense}
            onCancel={() => { setShowExpenseForm(false); setEditExpense(null); }}
          />
        </Modal>
      )}

      {showBudgetModal && (
        <Modal title="Set Monthly Budget" onClose={() => setShowBudgetModal(false)}>
          <form onSubmit={handleSetBudget} className="form">
            <div className="form-field">
              <label className="form-label">Budget Limit</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 6500"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => setShowBudgetModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Delete Expense" onClose={() => setDeleteConfirm(null)}>
          <p>Delete this expense? This cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn-danger" onClick={() => handleDeleteExpense(deleteConfirm)}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ExpenseRow({ expense, currency, canEdit, onEdit, onDelete }) {
  return (
    <div className="expense-row">
      <div className="expense-left">
        <span className="expense-icon">{CATEGORY_ICONS[expense.category] || '💰'}</span>
        <div>
          <p className="expense-category">{expense.category}</p>
          {expense.description && <p className="expense-desc">{expense.description}</p>}
          <p className="expense-date">{formatDate(expense.date)}</p>
        </div>
      </div>
      <div className="expense-right">
        <strong className="expense-amount">{formatCurrency(expense.amount, currency)}</strong>
        {canEdit && (
          <div className="expense-actions">
            <button className="icon-btn" onClick={onEdit} aria-label="Edit expense">✏️</button>
            <button className="icon-btn danger" onClick={onDelete} aria-label="Delete expense">🗑️</button>
          </div>
        )}
      </div>
    </div>
  );
}
