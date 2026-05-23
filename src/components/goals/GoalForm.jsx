import React, { useState } from 'react';

function genId() {
  return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function GoalForm({ goal, onSave, onCancel }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    name: goal?.name || '',
    targetAmount: goal?.targetAmount?.toString() || '',
    currentAmount: goal?.currentAmount?.toString() || '0',
    targetDate: goal?.targetDate ? goal.targetDate.split('T')[0] : '',
    description: goal?.description || '',
  });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Goal name is required';
    const t = parseFloat(form.targetAmount);
    if (isNaN(t) || t <= 0) e.targetAmount = 'Enter a target amount greater than 0';
    const c = parseFloat(form.currentAmount);
    if (isNaN(c) || c < 0) e.currentAmount = 'Enter a valid amount (0 or more)';
    if (form.targetDate && new Date(form.targetDate) < new Date(today)) {
      e.targetDate = 'Target date cannot be in the past';
    }
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      id: goal?.id || genId(),
      name: form.name.trim(),
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: parseFloat(form.currentAmount) || 0,
      targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : null,
      description: form.description.trim(),
      createdAt: goal?.createdAt || new Date().toISOString(),
    };
    onSave(payload);
  }

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(err => ({ ...err, [field]: undefined }));
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label className="form-label">Goal Name</label>
        <input
          className={`form-input ${errors.name ? 'input-error' : ''}`}
          type="text"
          placeholder="e.g. New Laptop, Emergency Fund, Travel"
          value={form.name}
          onChange={set('name')}
          maxLength={60}
          autoFocus
        />
        {errors.name && <p className="error-msg">{errors.name}</p>}
      </div>

      <div className="form-field">
        <label className="form-label">Target Amount</label>
        <input
          className={`form-input ${errors.targetAmount ? 'input-error' : ''}`}
          type="number"
          placeholder="e.g. 5000"
          min="0.01"
          step="0.01"
          value={form.targetAmount}
          onChange={set('targetAmount')}
        />
        {errors.targetAmount && <p className="error-msg">{errors.targetAmount}</p>}
      </div>

      <div className="form-field">
        <label className="form-label">Already Saved <span className="optional">(optional)</span></label>
        <input
          className={`form-input ${errors.currentAmount ? 'input-error' : ''}`}
          type="number"
          placeholder="0"
          min="0"
          step="0.01"
          value={form.currentAmount}
          onChange={set('currentAmount')}
        />
        {errors.currentAmount && <p className="error-msg">{errors.currentAmount}</p>}
      </div>

      <div className="form-field">
        <label className="form-label">Target Date <span className="optional">(optional)</span></label>
        <input
          className={`form-input ${errors.targetDate ? 'input-error' : ''}`}
          type="date"
          value={form.targetDate}
          onChange={set('targetDate')}
          min={today}
        />
        {errors.targetDate && <p className="error-msg">{errors.targetDate}</p>}
      </div>

      <div className="form-field">
        <label className="form-label">Description <span className="optional">(optional)</span></label>
        <textarea
          className="form-textarea"
          placeholder="What is this goal for?"
          value={form.description}
          onChange={set('description')}
          maxLength={200}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">Save</button>
      </div>
    </form>
  );
}
