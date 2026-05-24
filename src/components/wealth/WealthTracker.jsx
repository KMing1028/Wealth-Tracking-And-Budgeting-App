import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { calcNetWorth, getGrowthMetrics, buildNetWorthChartData } from '../../utils/calculations';
import { formatCurrency, formatPercent, formatShortDate, formatDate } from '../../utils/formatters';
import Modal from '../common/Modal';
import WealthForm from './WealthForm';
import SuccessToast from '../common/SuccessToast';

const CATEGORY_COLORS = { savings: '#3b82f6', stocks: '#10b981', retirement: '#8b5cf6' };
const CATEGORY_LABELS = { savings: '🏦 Savings', stocks: '📈 Stocks', retirement: '🎯 Retirement' };

export default function WealthTracker({ wealthData, setWealthData, settings }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [expanded, setExpanded] = useState({ savings: true, stocks: true, retirement: true });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const currency = settings.currency;
  const netWorth = calcNetWorth(wealthData);

  const chartData = useMemo(() => {
    const raw = buildNetWorthChartData(wealthData);
    return raw.map(d => ({ ...d, label: formatShortDate(d.date) }));
  }, [wealthData]);

  const pieData = useMemo(() => {
    return ['savings', 'stocks', 'retirement'].map(cat => ({
      name: cat,
      value: wealthData.filter(w => w.category === cat).reduce((s, w) => s + w.currentValue, 0),
    })).filter(d => d.value > 0);
  }, [wealthData]);

  function handleSave(item) {
    if (editItem) {
      setWealthData(prev => prev.map(w => w.id === item.id ? item : w));
      setSuccessMsg('Investment Updated!');
    } else {
      setWealthData(prev => [...prev, item]);
      setSuccessMsg('Investment Successfully Added!');
    }
    setShowForm(false);
    setEditItem(null);
  }

  function handleDelete(id) {
    setWealthData(prev => prev.filter(w => w.id !== id));
    setDeleteConfirm(null);
  }

  function openEdit(item) {
    setEditItem(item);
    setShowForm(true);
  }

  const toggleSection = (cat) => setExpanded(e => ({ ...e, [cat]: !e[cat] }));

  // Aggregate portfolio metrics
  function totalForCategory(cat) {
    return wealthData.filter(w => w.category === cat).reduce((s, w) => s + w.currentValue, 0);
  }

  return (
    <div className="screen-container">
      <header className="screen-header">
        <h1 className="screen-title">Wealth Tracker</h1>
        <button className="btn-primary btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}>+ Add</button>
      </header>

      {/* Net Worth Hero */}
      <div className="hero-card">
        <p className="hero-label">Total Net Worth</p>
        <h2 className="hero-value">{formatCurrency(netWorth, currency)}</h2>
      </div>

      {/* Charts */}
      {chartData.length > 1 && (
        <div className="card">
          <h3 className="card-title">Net Worth Over Time</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatCurrency(v, currency).replace(' ', '')} />
              <Tooltip
                formatter={(v) => [formatCurrency(v, currency), 'Net Worth']}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{ fontSize: 12, borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {pieData.length > 0 && (
        <div className="card">
          <h3 className="card-title">Wealth Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />
                ))}
              </Pie>
              <Legend formatter={(v) => CATEGORY_LABELS[v] || v} iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
              <Tooltip formatter={(v) => formatCurrency(v, currency)} contentStyle={{ fontSize: 12, borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Sections */}
      {['savings', 'stocks', 'retirement'].map(cat => {
        const items = wealthData.filter(w => w.category === cat);
        const total = totalForCategory(cat);
        return (
          <div key={cat} className="card category-section">
            <button
              className="category-header"
              onClick={() => toggleSection(cat)}
              aria-expanded={expanded[cat]}
            >
              <span>{CATEGORY_LABELS[cat]}</span>
              <div className="category-header-right">
                <strong>{formatCurrency(total, currency)}</strong>
                <span className="chevron">{expanded[cat] ? '▲' : '▼'}</span>
              </div>
            </button>

            {expanded[cat] && (
              <div className="category-items">
                {items.length === 0 ? (
                  <p className="empty-hint">No entries yet.</p>
                ) : (
                  items.map(item => <WealthItem key={item.id} item={item} currency={currency} onEdit={openEdit} onDelete={() => setDeleteConfirm(item.id)} />)
                )}
              </div>
            )}
          </div>
        );
      })}

      {wealthData.length === 0 && (
        <div className="empty-state">
          <p>📊 No wealth data yet.</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>Add Your First Entry</button>
        </div>
      )}

      {showForm && (
        <Modal
          title={editItem ? 'Edit Wealth Entry' : 'Add Wealth Entry'}
          onClose={() => { setShowForm(false); setEditItem(null); }}
        >
          <WealthForm item={editItem} onSave={handleSave} onCancel={() => { setShowForm(false); setEditItem(null); }} />
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Delete Entry" onClose={() => setDeleteConfirm(null)}>
          <p>Are you sure you want to delete this wealth entry? This action cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
          </div>
        </Modal>
      )}

      {successMsg && <SuccessToast message={successMsg} onDismiss={() => setSuccessMsg(null)} />}
    </div>
  );
}

function WealthItem({ item, currency, onEdit, onDelete }) {
  const metrics = getGrowthMetrics(item);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="wealth-item">
      <div className="wealth-item-main">
        <div>
          <p className="wealth-item-name">{item.name}</p>
          <p className="wealth-item-date">Updated {formatDate(item.entries?.[item.entries.length - 1]?.date || item.createdAt)}</p>
        </div>
        <div className="wealth-item-right">
          <strong className="wealth-item-value">{formatCurrency(item.currentValue, currency)}</strong>
          <div className="wealth-item-actions">
            <button className="icon-btn" onClick={() => setExpanded(!expanded)} aria-label="View details" title="Details">📋</button>
            <button className="icon-btn" onClick={() => onEdit(item)} aria-label="Edit" title="Edit">✏️</button>
            <button className="icon-btn danger" onClick={onDelete} aria-label="Delete" title="Delete">🗑️</button>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="wealth-item-metrics">
          {metrics.ytd && <MetricBadge label="YTD" pct={metrics.ytd.pct} abs={metrics.ytd.abs} currency={currency} />}
          {metrics.oneY && <MetricBadge label="1Y" pct={metrics.oneY.pct} abs={metrics.oneY.abs} currency={currency} />}
          {metrics.fiveY && <MetricBadge label="5Y" pct={metrics.fiveY.pct} abs={metrics.fiveY.abs} currency={currency} />}
          {item.entries?.length > 0 && (
            <div className="entry-history">
              <p className="entry-history-title">Entry History</p>
              {[...item.entries].reverse().slice(0, 5).map((e, i) => (
                <div key={i} className="entry-history-row">
                  <span>{formatDate(e.date)}</span>
                  <span>{formatCurrency(e.value, currency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetricBadge({ label, pct, abs, currency }) {
  const pos = pct >= 0;
  return (
    <div className={`metric-badge ${pos ? 'positive' : 'negative'}`}>
      <span className="metric-label">{label}</span>
      <span>{formatPercent(pct)}</span>
      <span className="metric-abs">{pos ? '+' : ''}{formatCurrency(abs, currency)}</span>
    </div>
  );
}
