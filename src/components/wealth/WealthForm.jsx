import React, { useState } from 'react';

const CATEGORIES = [
  { value: 'savings', label: '🏦 Savings Account' },
  { value: 'stocks', label: '📈 Stock Portfolio' },
  { value: 'retirement', label: '🎯 Retirement Account' },
];

function genId() {
  return `wealth-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function WealthForm({ item, onSave, onCancel }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    category: item?.category || 'savings',
    name: item?.name || '',
    value: item?.currentValue?.toString() || '',
    date: today,
  });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    const v = parseFloat(form.value);
    if (isNaN(v) || v < 0) e.value = 'Enter a valid positive amount';
    if (!form.date) e.date = 'Date is required';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const value = parseFloat(form.value);
    const dateISO = new Date(form.date).toISOString();

    if (item) {
      const newEntry = { date: dateISO, value };
      const entries = item.entries ? [...item.entries, newEntry] : [newEntry];
      onSave({ ...item, category: form.category, name: form.name, currentValue: value, entries });
    } else {
      onSave({
        id: genId(),
        category: form.category,
        name: form.name,
        currentValue: value,
        entries: [{ date: dateISO, value }],
        createdAt: dateISO,
      });
    }
  }

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(err => ({ ...err, [field]: undefined }));
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label className="form-label">Category</label>
        <select className="form-select" value={form.category} onChange={set('category')}>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div className="form-field">
        <label className="form-label">Name</label>
        <input
          className={`form-input ${errors.name ? 'input-error' : ''}`}
          type="text"
          placeholder="e.g. Maybank Savings, Bursa Malaysia"
          value={form.name}
          onChange={set('name')}
          maxLength={60}
        />
        {errors.name && <p className="error-msg">{errors.name}</p>}
      </div>

      <div className="form-field">
        <label className="form-label">Current Value</label>
        <input
          className={`form-input ${errors.value ? 'input-error' : ''}`}
          type="number"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={form.value}
          onChange={set('value')}
        />
        {errors.value && <p className="error-msg">{errors.value}</p>}
      </div>

      <div className="form-field">
        <label className="form-label">Date of Entry</label>
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
