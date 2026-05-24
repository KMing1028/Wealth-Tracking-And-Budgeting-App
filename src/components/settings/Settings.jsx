import React, { useState } from 'react';
import { CURRENCIES } from '../../utils/currencies';
import { clearAllData } from '../../utils/storage';
import { formatCurrency } from '../../utils/formatters';
import { resolveCycleDate } from '../../utils/calculations';
import {
  PREDEFINED_CATEGORIES,
  addCustomCategory,
  deleteCustomCategory,
  validateCategoryName,
} from '../../utils/categories';
import Modal from '../common/Modal';

const BUCKET_LABELS = { needs: '🏠 Needs', wants: '🎉 Wants', save_invest: '💪 Save & Invest' };

export default function Settings({
  settings, updateSettings,
  customCategories, setCustomCategories,
  onDataCleared,
}) {
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState(null);
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [pendingCycleDay, setPendingCycleDay] = useState(settings.budgetCycleDay || 27);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  function handleCurrencySelect(code) {
    if (code === settings.currency) { setShowCurrencyModal(false); return; }
    setPendingCurrency(code);
  }

  function confirmCurrencyChange() {
    updateSettings({ currency: pendingCurrency });
    setPendingCurrency(null);
    setShowCurrencyModal(false);
  }

  function confirmCycleChange() {
    const day = Math.max(1, Math.min(31, Math.floor(pendingCycleDay)));
    updateSettings({ budgetCycleDay: day });
    setShowCycleModal(false);
  }

  function handleClearData() {
    clearAllData();
    setShowClearConfirm(false);
    onDataCleared();
  }

  function safeParse(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }

  function handleExport() {
    const data = {
      wealthData: safeParse('wealthData', []),
      budgetHistory: safeParse('budgetHistory', []),
      appSettings: safeParse('appSettings', {}),
      savingsGoals: safeParse('savingsGoals', []),
      customCategories: safeParse('customCategories', {}),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wealth-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  }

  const currentCurrencyLabel = CURRENCIES.find(c => c.code === settings.currency)?.label || settings.currency;
  const sampleValue = formatCurrency(10000, settings.currency);
  const pendingLabel = pendingCurrency ? CURRENCIES.find(c => c.code === pendingCurrency)?.label : '';
  const pendingSample = pendingCurrency ? formatCurrency(10000, pendingCurrency) : '';

  // Cycle preview text
  const now = new Date();
  const nextResetExample = resolveCycleDate(now.getFullYear(), now.getMonth() + 1, pendingCycleDay);
  const nextResetExampleLabel = nextResetExample.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });

  return (
    <div className="screen-container">
      <header className="screen-header">
        <h1 className="screen-title">Settings</h1>
      </header>

      {/* Appearance */}
      <div className="card settings-section">
        <h3 className="settings-section-title">🌓 Appearance</h3>
        <div className="settings-row" style={{ cursor: 'default' }}>
          <div style={{ flex: 1 }}>
            <p className="settings-label">Theme</p>
            <div className="theme-toggle" style={{ marginTop: 8 }}>
              <button
                className={`theme-toggle-btn ${settings.theme === 'light' ? 'active' : ''}`}
                onClick={() => updateSettings({ theme: 'light' })}
              >
                ☀️ Light
              </button>
              <button
                className={`theme-toggle-btn ${settings.theme === 'dark' ? 'active' : ''}`}
                onClick={() => updateSettings({ theme: 'dark' })}
              >
                🌙 Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Cycle */}
      <div className="card settings-section">
        <h3 className="settings-section-title">💳 Budget Cycle</h3>
        <div className="settings-row" onClick={() => { setPendingCycleDay(settings.budgetCycleDay || 27); setShowCycleModal(true); }} role="button" tabIndex={0}>
          <div>
            <p className="settings-label">Reset Day</p>
            <p className="settings-value">Day {settings.budgetCycleDay || 27} of each month</p>
          </div>
          <span className="settings-chevron">›</span>
        </div>
      </div>

      {/* Currency */}
      <div className="card settings-section">
        <h3 className="settings-section-title">🌍 Currency</h3>
        <div className="settings-row" onClick={() => setShowCurrencyModal(true)} role="button" tabIndex={0}>
          <div>
            <p className="settings-label">Display Currency</p>
            <p className="settings-value">{currentCurrencyLabel}</p>
          </div>
          <span className="settings-chevron">›</span>
        </div>
      </div>

      {/* Categories */}
      <div className="card settings-section">
        <h3 className="settings-section-title">🏷️ Categories</h3>
        <div className="settings-row" onClick={() => setShowCategoriesModal(true)} role="button" tabIndex={0}>
          <div>
            <p className="settings-label">Manage Categories</p>
            <p className="settings-value-small">Add or remove custom spending categories</p>
          </div>
          <span className="settings-chevron">›</span>
        </div>
      </div>

      {/* Data Management */}
      <div className="card settings-section">
        <h3 className="settings-section-title">💾 Data Management</h3>
        <div className="settings-row" onClick={() => setShowExportModal(true)} role="button" tabIndex={0}>
          <div>
            <p className="settings-label">Export Data</p>
            <p className="settings-value-small">Download all your data as JSON</p>
          </div>
          <span className="settings-chevron">›</span>
        </div>
        <div className="settings-row danger" onClick={() => setShowClearConfirm(true)} role="button" tabIndex={0}>
          <div>
            <p className="settings-label red">Clear All Data</p>
            <p className="settings-value-small">Permanently delete all data</p>
          </div>
          <span className="settings-chevron">›</span>
        </div>
      </div>

      {/* About */}
      <div className="card settings-section">
        <h3 className="settings-section-title">ℹ️ About</h3>
        <div className="settings-info-row"><span>App Version</span><span>1.1.0</span></div>
        <div className="settings-info-row"><span>Data Storage</span><span>Local (browser only)</span></div>
        <div className="settings-info-row"><span>Budget Cycle</span><span>Day {settings.budgetCycleDay || 27} monthly</span></div>
      </div>

      {/* Cycle Day Modal */}
      {showCycleModal && (
        <Modal title="Budget Cycle" onClose={() => setShowCycleModal(false)}>
          <p className="modal-desc">
            Your budget resets on this day every month. If the day doesn't exist (e.g. Feb 31), the last day of that month is used.
          </p>
          <div className="form-field">
            <label className="form-label">Reset on day</label>
            <div className="cycle-day-input">
              <input
                className="form-input"
                type="number"
                min="1"
                max="31"
                value={pendingCycleDay}
                onChange={e => setPendingCycleDay(parseInt(e.target.value, 10) || 1)}
              />
              <span>of each month</span>
            </div>
          </div>
          <div className="currency-preview">
            <p className="preview-title">Preview</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Next reset: <strong style={{ color: 'var(--text-primary)' }}>{nextResetExampleLabel}</strong>
            </p>
          </div>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setShowCycleModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={confirmCycleChange}>Save</button>
          </div>
        </Modal>
      )}

      {/* Currency Modal */}
      {showCurrencyModal && (
        <Modal title="Change Currency" onClose={() => { setShowCurrencyModal(false); setPendingCurrency(null); }}>
          <p className="modal-desc">Changing currency will update all monetary displays. Values are not auto-converted — only the symbol changes.</p>
          <div className="form-field">
            <label className="form-label">Select Currency</label>
            <select
              className="form-select"
              value={pendingCurrency || settings.currency}
              onChange={e => handleCurrencySelect(e.target.value)}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
          {pendingCurrency && pendingCurrency !== settings.currency && (
            <div className="currency-preview">
              <p className="preview-title">Preview</p>
              <div className="preview-row"><span>From:</span><span>{currentCurrencyLabel} — {sampleValue}</span></div>
              <div className="preview-row"><span>To:</span><span>{pendingLabel} — {pendingSample}</span></div>
              <p className="preview-note">Numbers stay the same, only the symbol changes.</p>
            </div>
          )}
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => { setShowCurrencyModal(false); setPendingCurrency(null); }}>Cancel</button>
            {pendingCurrency && pendingCurrency !== settings.currency && (
              <button className="btn-primary" onClick={confirmCurrencyChange}>Change Currency</button>
            )}
          </div>
        </Modal>
      )}

      {/* Categories Modal */}
      {showCategoriesModal && (
        <CategoryManagerModal
          customCategories={customCategories}
          setCustomCategories={setCustomCategories}
          onClose={() => setShowCategoriesModal(false)}
        />
      )}

      {/* Clear Data Confirm */}
      {showClearConfirm && (
        <Modal title="Clear All Data" onClose={() => setShowClearConfirm(false)}>
          <p>This will permanently delete all your wealth entries, budget history, savings goals, custom categories, and settings. This cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setShowClearConfirm(false)}>Cancel</button>
            <button className="btn-danger" onClick={handleClearData}>Clear All Data</button>
          </div>
        </Modal>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <Modal title="Export Data" onClose={() => setShowExportModal(false)}>
          <p>Your data will be exported as a JSON file containing all wealth entries, budget history, goals, custom categories, and settings.</p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setShowExportModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleExport}>Download JSON</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CategoryManagerModal({ customCategories, setCustomCategories, onClose }) {
  const [addingTo, setAddingTo] = useState(null);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  function handleAdd() {
    if (!addingTo) return;
    const err = validateCategoryName(newName, addingTo, customCategories);
    if (err) { setError(err); return; }
    setCustomCategories(prev => addCustomCategory(prev, addingTo, newName, newIcon || '🏷️'));
    setNewName(''); setNewIcon(''); setAddingTo(null); setError('');
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setCustomCategories(prev => deleteCustomCategory(prev, deleteTarget.bucket, deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <Modal title="Manage Categories" onClose={onClose}>
      <p className="modal-desc">Add custom categories for your spending. Predefined categories can't be deleted.</p>

      {['needs', 'wants', 'save_invest'].map(bucket => (
        <div key={bucket} className="cat-manager-bucket">
          <p className="cat-manager-bucket-title">{BUCKET_LABELS[bucket]}</p>
          {PREDEFINED_CATEGORIES[bucket].map(cat => (
            <div key={cat.id} className="cat-list-row">
              <div className="cat-info">
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
              </div>
              <span className="cat-tag-pred">Default</span>
            </div>
          ))}
          {(customCategories[bucket] || []).map(cat => (
            <div key={cat.id} className="cat-list-row">
              <div className="cat-info">
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
                <span className="cat-tag-custom">Custom</span>
              </div>
              <button className="icon-btn danger" aria-label="Delete category" onClick={() => setDeleteTarget({ bucket, id: cat.id, name: cat.name })}>🗑️</button>
            </div>
          ))}
          {addingTo === bucket ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  style={{ width: 70, textAlign: 'center' }}
                  placeholder="🏷️"
                  value={newIcon}
                  onChange={e => setNewIcon(e.target.value.slice(0, 4))}
                  maxLength={4}
                  aria-label="Icon"
                />
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Category name"
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setError(''); }}
                  maxLength={50}
                  autoFocus
                />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { setAddingTo(null); setNewName(''); setNewIcon(''); setError(''); }}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleAdd}>Add</button>
              </div>
            </div>
          ) : (
            <button className="add-category-btn" onClick={() => { setAddingTo(bucket); setNewName(''); setNewIcon(''); setError(''); }}>
              + Add Custom Category
            </button>
          )}
        </div>
      ))}

      {deleteTarget && (
        <Modal title="Delete Category" onClose={() => setDeleteTarget(null)}>
          <p>Delete custom category "<strong>{deleteTarget.name}</strong>"?</p>
          <p className="modal-desc" style={{ marginTop: 8 }}>Existing expenses in this category will keep their label but you won't be able to assign new expenses to it.</p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}

      <div className="modal-actions">
        <button className="btn-primary" style={{ flex: 1 }} onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
}
