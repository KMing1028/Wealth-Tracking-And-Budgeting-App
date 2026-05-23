import React, { useState } from 'react';
import { CURRENCIES, getCurrencySymbol } from '../../utils/currencies';
import { clearAllData } from '../../utils/storage';
import { formatCurrency } from '../../utils/formatters';
import Modal from '../common/Modal';

export default function Settings({ settings, updateSettings, onDataCleared }) {
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState(null);
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

  function handleClearData() {
    clearAllData();
    setShowClearConfirm(false);
    onDataCleared();
  }

  function handleExport() {
    const data = {
      wealthData: JSON.parse(localStorage.getItem('wealthData') || '[]'),
      budgetHistory: JSON.parse(localStorage.getItem('budgetHistory') || '[]'),
      appSettings: JSON.parse(localStorage.getItem('appSettings') || '{}'),
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

  return (
    <div className="screen-container">
      <header className="screen-header">
        <h1 className="screen-title">Settings</h1>
      </header>

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
        <div className="settings-info-row">
          <span>App Version</span>
          <span>1.0.0</span>
        </div>
        <div className="settings-info-row">
          <span>Data Storage</span>
          <span>Local (browser only)</span>
        </div>
        <div className="settings-info-row">
          <span>Budget Cycle</span>
          <span>27th – 26th monthly</span>
        </div>
      </div>

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
              <div className="preview-row">
                <span>From:</span>
                <span>{currentCurrencyLabel} — {sampleValue}</span>
              </div>
              <div className="preview-row">
                <span>To:</span>
                <span>{pendingLabel} — {pendingSample}</span>
              </div>
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

      {/* Clear Data Confirm */}
      {showClearConfirm && (
        <Modal title="Clear All Data" onClose={() => setShowClearConfirm(false)}>
          <p>This will permanently delete all your wealth entries, budget history, and settings. This action cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setShowClearConfirm(false)}>Cancel</button>
            <button className="btn-danger" onClick={handleClearData}>Clear All Data</button>
          </div>
        </Modal>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <Modal title="Export Data" onClose={() => setShowExportModal(false)}>
          <p>Your data will be exported as a JSON file containing all wealth entries, budget history, and settings.</p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setShowExportModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleExport}>Download JSON</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
