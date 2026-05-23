import React, { useState } from 'react';

const BUCKET_LABELS = {
  needs: '🏠 Needs',
  wants: '🎉 Wants',
  save_invest: '💪 Save & Invest',
};

function genId() {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function ExpenseForm({ expense, categories, onSave, onCancel }) {
  const today = new Date().toISOString().split('T')[0];

  const defaultBucket = expense?.bucket || 'needs';
  const defaultCategory = expense?.category || categories[defaultBucket][0];

  const [bucket, setBucket] = useState(defaultBucket);
  const [form, setForm] = useState({
    category: defaultCategory,
    amount: expense?.amount?.toString() || '',
    description: expense?.description || '',
    date: expense?.date ? expense.date.split('T')[0] : today,
  });
  const [errors, setErrors] = useState({});

  function handleBucketChange(b) {
    setBucket(b);
    setForm(f => ({ ...f, category: categories[b][0] }));
  }

  function validate() {
    const e = {};
    const v = parseFloat(form.amount);
    if (isNaN(v) || v <= 0) e.amount = 'Enter a valid amount greater than 0';
    if (!form.date) e.date = 'Date is required';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    onSave({
      id: expense?.id || genId(),
      date: new Date(form.date).toISOString(),
      amount: parseFloat(form.amount),
      category: form.category,
      bucket,
      description: form.description.trim(),
    });
  }

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(err => ({ ...err, [field]: undefined }));
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {/* Bucket Selector */}
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

      {/* Category */}
      <div className="form-field">
        <label className="form-label">Category</label>
        <select className="form-select" value={form.category} onChange={set('category')}>
          {(categories[bucket] || []).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Amount */}
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

      {/* Description */}
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

      {/* Date */}
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
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">Save</button>
      </div>
    </form>
  );
}
