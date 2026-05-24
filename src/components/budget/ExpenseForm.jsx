import React, { useState } from 'react';
import { getAllCategories } from '../../utils/categories';

const BUCKET_LABELS = {
  needs: '🏠 Needs',
  wants: '🎉 Wants',
  save_invest: '💪 Save & Invest',
};

function genId() {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function ExpenseForm({ expense, customCategories, goals = [], onSave, onCancel, onAllocateToGoal }) {
  const today = new Date().toISOString().split('T')[0];

  const defaultBucket = expense?.bucket || 'needs';
  const defaultCategories = getAllCategories(customCategories, defaultBucket);
  const defaultCategory = expense?.category || defaultCategories[0]?.name || '';

  const [bucket, setBucket] = useState(defaultBucket);
  const [form, setForm] = useState({
    category: defaultCategory,
    amount: expense?.amount?.toString() || '',
    description: expense?.description || '',
    date: expense?.date ? expense.date.split('T')[0] : today,
    goalId: expense?.goalId || '',
  });
  const [errors, setErrors] = useState({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  function handleBucketChange(b) {
    setBucket(b);
    const cats = getAllCategories(customCategories, b);
    setForm(f => ({ ...f, category: cats[0]?.name || '', goalId: b === 'save_invest' ? f.goalId : '' }));
  }

  function validate() {
    const e = {};
    const v = parseFloat(form.amount);
    if (isNaN(v) || v <= 0) e.amount = 'Enter a valid amount greater than 0';
    if (!form.date) e.date = 'Date is required';
    if (!form.category) e.category = 'Select a category';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      id: expense?.id || genId(),
      date: new Date(form.date).toISOString(),
      amount: parseFloat(form.amount),
      category: form.category,
      bucket,
      description: form.description.trim(),
    };
    if (form.goalId) payload.goalId = form.goalId;

    // If allocating to goal, increment goal's currentAmount
    if (form.goalId && onAllocateToGoal && !expense) {
      onAllocateToGoal(form.goalId, parseFloat(form.amount));
    }
    onSave(payload);
  }

  function handleCancel() {
    const hasData = !!(form.amount || form.description);
    if (hasData) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  }

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(err => ({ ...err, [field]: undefined }));
  };

  const currentCategories = getAllCategories(customCategories, bucket);

  return (
    <>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label className="form-label">Bucket</label>
          <div className="bucket-selector">
            {Object.entries(BUCKET_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`bucket-select-btn ${bucket === key ? 'active' : ''} bucket-${key}`}
                onClick={() => handleBucketChange(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Category</label>
          <select className={`form-select ${errors.category ? 'input-error' : ''}`} value={form.category} onChange={set('category')}>
            {currentCategories.length === 0 && <option value="">No categories — add one in Settings</option>}
            {currentCategories.map(c => (
              <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
            ))}
          </select>
          {errors.category && <p className="error-msg">{errors.category}</p>}
        </div>

        <div className="form-field">
          <label className="form-label">Amount</label>
          <input
            className={`form-input ${errors.amount ? 'input-error' : ''}`}
            type="number"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={set('amount')}
          />
          {errors.amount && <p className="error-msg">{errors.amount}</p>}
        </div>

        {bucket === 'save_invest' && goals.length > 0 && !expense && (
          <div className="form-field">
            <label className="form-label">Allocate to Goal <span className="optional">(optional)</span></label>
            <select className="form-select" value={form.goalId} onChange={set('goalId')}>
              <option value="">— None —</option>
              {goals.map(g => (
                <option key={g.id} value={g.id}>🎯 {g.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-field">
          <label className="form-label">Description <span className="optional">(optional)</span></label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Weekly groceries, Netflix subscription"
            value={form.description}
            onChange={set('description')}
            maxLength={100}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Date</label>
          <input
            className={`form-input ${errors.date ? 'input-error' : ''}`}
            type="date"
            value={form.date}
            onChange={set('date')}
            max={today}
          />
          {errors.date && <p className="error-msg">{errors.date}</p>}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-ghost" onClick={handleCancel}>Cancel</button>
          <button type="submit" className="btn-primary">{expense ? 'Save Changes' : '+ Add'}</button>
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
