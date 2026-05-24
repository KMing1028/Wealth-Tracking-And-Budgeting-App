import React, { useState } from 'react';
import { DEBT_TYPES, createDebt } from '../../utils/debt';

export default function DebtForm({ debt, onSave, onCancel }) {
  const isEdit = !!debt;
  const [type, setType] = useState(debt?.type || 'credit_card');
  const [customTypeName, setCustomTypeName] = useState(debt?.customTypeName || '');
  const [name, setName] = useState(debt?.name || '');
  const [currentBalance, setCurrentBalance] = useState(debt?.currentBalance?.toString() || '');
  const [monthlyPayment, setMonthlyPayment] = useState(debt?.monthlyPayment?.toString() || '');
  const [interestRate, setInterestRate] = useState(debt?.interestRate?.toString() || '');
  const [startDate, setStartDate] = useState(debt?.startDate ? debt.startDate.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const balance = parseFloat(currentBalance);
    const payment = parseFloat(monthlyPayment);
    if (isNaN(balance) || balance < 0) return setError('Enter a valid balance.');
    if (isNaN(payment) || payment < 0) return setError('Enter a valid monthly payment.');
    if (type === 'custom' && !customTypeName.trim()) return setError('Enter a name for the custom debt type.');
    if (!name.trim() && type !== 'custom') return setError('Enter a label for this debt (e.g. "Maybank Visa").');

    const fields = {
      name: name.trim(),
      type,
      customTypeName: customTypeName.trim(),
      currentBalance: balance,
      monthlyPayment: payment,
      interestRate: interestRate === '' ? undefined : parseFloat(interestRate),
      startDate: new Date(startDate).toISOString(),
    };

    if (isEdit) {
      onSave({ ...debt, ...fields });
    } else {
      onSave(createDebt(fields));
    }
  }

  function handleCancel() {
    const hasData = !!(name || currentBalance);
    if (hasData) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-field">
          <label className="form-label">Debt Type</label>
          <div className="debt-type-grid">
            {DEBT_TYPES.map(t => (
              <button
                key={t.id}
                type="button"
                className={`debt-type-btn ${type === t.id ? 'active' : ''}`}
                onClick={() => setType(t.id)}
              >
                <span className="debt-type-icon">{t.icon}</span>
                <span className="debt-type-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {type === 'custom' && (
          <div className="form-field">
            <label className="form-label">Custom Type Name</label>
            <input
              className="form-input"
              type="text"
              value={customTypeName}
              onChange={e => setCustomTypeName(e.target.value)}
              placeholder="e.g. Family Loan"
              maxLength={40}
            />
          </div>
        )}

        <div className="form-field">
          <label className="form-label">Label / Account Name</label>
          <input
            className="form-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Maybank Visa"
            maxLength={50}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Current Balance</label>
          <input
            className="form-input"
            type="number"
            min="0"
            step="0.01"
            value={currentBalance}
            onChange={e => setCurrentBalance(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Monthly Payment</label>
          <input
            className="form-input"
            type="number"
            min="0"
            step="0.01"
            value={monthlyPayment}
            onChange={e => setMonthlyPayment(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Interest Rate % (optional)</label>
          <input
            className="form-input"
            type="number"
            min="0"
            step="0.01"
            value={interestRate}
            onChange={e => setInterestRate(e.target.value)}
            placeholder="e.g. 18"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Start Date</label>
          <input
            className="form-input"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn-ghost" onClick={handleCancel}>Cancel</button>
          <button type="submit" className="btn-primary">{isEdit ? 'Save Changes' : '+ Add Debt'}</button>
        </div>
      </form>

      {showCancelConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <h3 className="confirm-title">Discard Changes?</h3>
            <p className="confirm-body">Are you sure you want to cancel? Your data will not be saved.</p>
            <div className="confirm-actions">
              <button type="button" className="btn-ghost" onClick={() => setShowCancelConfirm(false)}>Keep Editing</button>
              <button type="button" className="btn-danger" onClick={onCancel}>Discard</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
