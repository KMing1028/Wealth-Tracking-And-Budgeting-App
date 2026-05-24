import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  totalDebt, totalMonthlyPayments, paidThisCycleCount,
  estimateDebtFreeDate, getDebtIcon, getDebtLabel,
} from '../../utils/debt';
import Modal from '../common/Modal';
import DebtForm from './DebtForm';

export default function DebtTracker({ debts, setDebts, settings }) {
  const currency = settings.currency;
  const [showForm, setShowForm] = useState(false);
  const [editDebt, setEditDebt] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const total = totalDebt(debts);
  const monthlyTotal = totalMonthlyPayments(debts);
  const paidCount = paidThisCycleCount(debts);
  const debtFreeDate = estimateDebtFreeDate(debts);

  function handleSave(debt) {
    if (editDebt) {
      setDebts(prev => prev.map(d => d.id === debt.id ? debt : d));
    } else {
      setDebts(prev => [...prev, debt]);
    }
    setShowForm(false);
    setEditDebt(null);
  }

  function togglePaid(debt) {
    setDebts(prev => prev.map(d => d.id === debt.id
      ? { ...d, paidThisCycle: !d.paidThisCycle, paymentDate: !d.paidThisCycle ? new Date().toISOString() : null }
      : d
    ));
  }

  function handleDelete(id) {
    setDebts(prev => prev.filter(d => d.id !== id));
    setDeleteConfirm(null);
  }

  return (
    <div className="screen-container">
      <header className="screen-header">
        <h1 className="screen-title">Debt Tracker</h1>
        <button className="btn-primary btn-sm" onClick={() => { setEditDebt(null); setShowForm(true); }}>+ Debt</button>
      </header>

      {/* Total Debt hero — always visible */}
      <div className="hero-card debt-hero">
        <p className="hero-label">Total Debt</p>
        <h2 className="hero-value">{formatCurrency(total, currency)}</h2>
        {debts.length > 0 && (
          <div className="growth-badges">
            <div className="growth-badge">
              <span className="badge-label">Monthly</span>
              <span className="badge-pct" style={{ fontSize: '13px' }}>{formatCurrency(monthlyTotal, currency)}</span>
            </div>
            <div className="growth-badge">
              <span className="badge-label">Paid</span>
              <span className="badge-pct">{paidCount}/{debts.length}</span>
            </div>
            {debtFreeDate && (
              <div className="growth-badge">
                <span className="badge-label">Debt-Free</span>
                <span className="badge-pct" style={{ fontSize: '13px' }}>
                  {debtFreeDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {debts.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '48px' }}>💳</p>
          <p>Track your debts to see your true net worth and pay them off faster.</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>Add Your First Debt</button>
        </div>
      ) : (
        debts.map(debt => (
          <DebtCard
            key={debt.id}
            debt={debt}
            currency={currency}
            onEdit={() => { setEditDebt(debt); setShowForm(true); }}
            onDelete={() => setDeleteConfirm(debt.id)}
            onTogglePaid={() => togglePaid(debt)}
          />
        ))
      )}

      {showForm && (
        <Modal
          title={editDebt ? 'Edit Debt' : 'Add Debt'}
          onClose={() => { setShowForm(false); setEditDebt(null); }}
        >
          <DebtForm debt={editDebt} onSave={handleSave} onCancel={() => { setShowForm(false); setEditDebt(null); }} />
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Delete Debt" onClose={() => setDeleteConfirm(null)}>
          <p>Delete this debt? This cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function DebtCard({ debt, currency, onEdit, onDelete, onTogglePaid }) {
  const monthsLeft = debt.monthlyPayment > 0 ? Math.ceil(debt.currentBalance / debt.monthlyPayment) : null;

  return (
    <div className="debt-card">
      <div className="debt-card-header">
        <div className="debt-card-title">
          <span className="debt-card-icon">{getDebtIcon(debt)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="debt-card-name">{debt.name || getDebtLabel(debt)}</p>
            <p className="debt-card-type">{getDebtLabel(debt)}</p>
          </div>
        </div>
        <span className={`debt-paid-badge ${debt.paidThisCycle ? 'paid' : 'unpaid'}`}>
          {debt.paidThisCycle ? '✓ Paid' : 'Unpaid'}
        </span>
      </div>

      <div className="debt-stats">
        <div className="debt-stat">
          <span>Balance</span>
          <strong>{formatCurrency(debt.currentBalance, currency)}</strong>
        </div>
        <div className="debt-stat">
          <span>Monthly</span>
          <strong>{formatCurrency(debt.monthlyPayment, currency)}</strong>
        </div>
        {debt.interestRate !== undefined && (
          <div className="debt-stat">
            <span>Rate</span>
            <strong>{debt.interestRate}%</strong>
          </div>
        )}
      </div>

      {monthsLeft !== null && monthsLeft > 0 && (
        <p className="debt-eta">📅 ~{monthsLeft} {monthsLeft === 1 ? 'month' : 'months'} at current payment</p>
      )}

      {debt.paidThisCycle && debt.paymentDate && (
        <p className="debt-eta">✓ Paid on {formatDate(debt.paymentDate)}</p>
      )}

      <div className="debt-actions">
        <label className="debt-paid-check">
          <input
            type="checkbox"
            checked={debt.paidThisCycle}
            onChange={onTogglePaid}
          />
          <span>Mark as paid this cycle</span>
        </label>
        <div className="debt-action-buttons">
          <button className="icon-btn" onClick={onEdit} aria-label="Edit debt">✏️</button>
          <button className="icon-btn danger" onClick={onDelete} aria-label="Delete debt">🗑️</button>
        </div>
      </div>
    </div>
  );
}
