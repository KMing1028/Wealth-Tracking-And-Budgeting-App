import React, { useState } from 'react';
import { getGoalProgress } from '../../utils/calculations';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Modal from '../common/Modal';
import GoalForm from './GoalForm';

const STATUS_LABELS = {
  on_track: 'On track',
  behind: 'Behind',
  missed: 'Missed',
  completed: 'Completed',
  in_progress: 'In progress',
};

export default function SavingsGoals({ goals, setGoals, settings }) {
  const currency = settings.currency;
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [contribAmount, setContribAmount] = useState('');

  function handleSave(goal) {
    if (editGoal) {
      setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
    } else {
      setGoals(prev => [...prev, goal]);
    }
    setShowForm(false);
    setEditGoal(null);
  }

  function handleDelete(id) {
    setGoals(prev => prev.filter(g => g.id !== id));
    setDeleteConfirm(null);
  }

  function handleContribute(e) {
    e.preventDefault();
    const amt = parseFloat(contribAmount);
    if (isNaN(amt) || amt <= 0 || !contributeGoal) return;
    setGoals(prev => prev.map(g => g.id === contributeGoal.id
      ? { ...g, currentAmount: g.currentAmount + amt }
      : g
    ));
    setContributeGoal(null);
    setContribAmount('');
  }

  const sortedGoals = [...goals].sort((a, b) => {
    const pa = getGoalProgress(a).percentComplete;
    const pb = getGoalProgress(b).percentComplete;
    return pb - pa;
  });

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <div className="screen-container">
      <header className="screen-header">
        <h1 className="screen-title">Savings Goals</h1>
        <button className="btn-primary btn-sm" onClick={() => { setEditGoal(null); setShowForm(true); }}>+ Goal</button>
      </header>

      {goals.length > 0 && (
        <div className="hero-card">
          <p className="hero-label">Total Saved Toward Goals</p>
          <h2 className="hero-value">{formatCurrency(totalSaved, currency)}</h2>
          <div className="growth-badges">
            <div className="growth-badge">
              <span className="badge-label">Goals</span>
              <span className="badge-pct">{goals.length}</span>
            </div>
            <div className="growth-badge">
              <span className="badge-label">Target</span>
              <span className="badge-pct" style={{ fontSize: '13px' }}>{formatCurrency(totalTarget, currency)}</span>
            </div>
            <div className="growth-badge">
              <span className="badge-label">Overall</span>
              <span className="badge-pct">{totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}%</span>
            </div>
          </div>
        </div>
      )}

      {sortedGoals.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '48px' }}>🎯</p>
          <p>Set a savings goal to start tracking your progress.</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>Create Your First Goal</button>
        </div>
      ) : (
        sortedGoals.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal}
            currency={currency}
            onEdit={() => { setEditGoal(goal); setShowForm(true); }}
            onDelete={() => setDeleteConfirm(goal.id)}
            onContribute={() => { setContributeGoal(goal); setContribAmount(''); }}
          />
        ))
      )}

      {showForm && (
        <Modal
          title={editGoal ? 'Edit Goal' : 'New Savings Goal'}
          onClose={() => { setShowForm(false); setEditGoal(null); }}
        >
          <GoalForm goal={editGoal} onSave={handleSave} onCancel={() => { setShowForm(false); setEditGoal(null); }} />
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Delete Goal" onClose={() => setDeleteConfirm(null)}>
          <p>Delete this savings goal? This cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
          </div>
        </Modal>
      )}

      {contributeGoal && (
        <Modal title={`Add to ${contributeGoal.name}`} onClose={() => setContributeGoal(null)}>
          <form onSubmit={handleContribute} className="form">
            <div className="form-field">
              <label className="form-label">Amount to add</label>
              <input
                className="form-input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={contribAmount}
                onChange={e => setContribAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => setContributeGoal(null)}>Cancel</button>
              <button type="submit" className="btn-primary">Add</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function GoalCard({ goal, currency, onEdit, onDelete, onContribute }) {
  const progress = getGoalProgress(goal);
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  const progressColor = progress.status === 'completed' ? 'var(--success)'
    : progress.status === 'on_track' ? 'var(--primary)'
    : progress.status === 'behind' ? 'var(--warning)'
    : progress.status === 'missed' ? 'var(--danger)'
    : 'var(--primary)';

  return (
    <div className="goal-card">
      <div className="goal-card-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="goal-name">{goal.name}</p>
          {goal.description && <p className="goal-desc">{goal.description}</p>}
          {goal.targetDate && (
            <p className="goal-desc">📅 Target: {formatDate(goal.targetDate)}</p>
          )}
        </div>
        <span className={`goal-status-badge ${progress.status}`}>{STATUS_LABELS[progress.status]}</span>
      </div>

      <div className="goal-progress-info">
        <span><strong>{formatCurrency(goal.currentAmount, currency)}</strong> of {formatCurrency(goal.targetAmount, currency)}</span>
        <span className="goal-percent">{progress.percentComplete.toFixed(0)}%</span>
      </div>

      <div className="progress-track large">
        <div className="progress-fill" style={{ width: `${progress.percentComplete}%`, backgroundColor: progressColor }} />
      </div>

      <div className="goal-progress-info" style={{ fontSize: '12px' }}>
        <span>Remaining: {formatCurrency(remaining, currency)}</span>
        {progress.daysRemaining !== undefined && progress.daysRemaining > 0 && (
          <span>{progress.daysRemaining} days left</span>
        )}
      </div>

      {progress.insight && <p className="goal-insight">💡 {progress.insight}</p>}

      <div className="goal-actions">
        <button className="btn-primary btn-sm" style={{ flex: 1 }} onClick={onContribute}>+ Add</button>
        <button className="icon-btn" onClick={onEdit} aria-label="Edit goal">✏️</button>
        <button className="icon-btn danger" onClick={onDelete} aria-label="Delete goal">🗑️</button>
      </div>
    </div>
  );
}
