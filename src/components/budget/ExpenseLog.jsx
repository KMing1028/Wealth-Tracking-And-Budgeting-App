import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categories';

export default function ExpenseLog({ allExpenses, currency, customCategories, onBack }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 7);

  const sorted = [...allExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  const groups = { today: [], yesterday: [], thisWeek: [], older: [] };
  sorted.forEach(exp => {
    const d = new Date(exp.date);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) groups.today.push(exp);
    else if (d.getTime() === yesterday.getTime()) groups.yesterday.push(exp);
    else if (d >= weekStart) groups.thisWeek.push(exp);
    else groups.older.push(exp);
  });

  const renderItem = (exp) => (
    <div key={exp.id} className="expense-log-item">
      <div className="expense-log-icon">{getCategoryIcon(exp.category, customCategories)}</div>
      <div className="expense-log-details">
        <p className="expense-log-name">{exp.category || 'Expense'}</p>
        {exp.description && <p className="expense-log-desc">{exp.description}</p>}
      </div>
      <p className="expense-log-amount">- {formatCurrency(exp.amount, currency)}</p>
    </div>
  );

  const renderGroup = (label, items) => {
    if (!items.length) return null;
    return (
      <div className="expense-log-group">
        <p className="expense-log-group-label">{label}</p>
        {items.map(renderItem)}
      </div>
    );
  };

  return (
    <div className="expense-log-screen">
      <header className="screen-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="screen-title">Expense Log</h1>
        <div style={{ width: 60 }} />
      </header>
      <div className="expense-log-content">
        {allExpenses.length === 0 ? (
          <div className="expense-log-empty">
            <p style={{ fontSize: 48, margin: '0 0 16px' }}>💸</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>No expenses yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Your expense history will appear here.</p>
          </div>
        ) : (
          <>
            {renderGroup('Today', groups.today)}
            {renderGroup('Yesterday', groups.yesterday)}
            {renderGroup('This Week', groups.thisWeek)}
            {renderGroup('Older', groups.older)}
          </>
        )}
      </div>
    </div>
  );
}
