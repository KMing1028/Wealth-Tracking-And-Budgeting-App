import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from 'recharts';
import {
  calcBucketTotals, getMonthlyTotals, getCategoryTotalsByMonth, generateInsights,
} from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

const BUCKET_CONFIG = {
  needs: { label: 'Needs', color: 'var(--needs-color)' },
  wants: { label: 'Wants', color: 'var(--wants-color)' },
  save_invest: { label: 'Save & Invest', color: 'var(--invest-color)' },
};

export default function Analytics({ budgetHistory, currentBudget, settings }) {
  const currency = settings.currency;

  const sortedBudgets = useMemo(() => {
    const list = [...budgetHistory];
    const exists = list.some(b => b.id === currentBudget.id);
    if (!exists) list.push(currentBudget);
    return list.sort((a, b) => new Date(a.monthStartDate) - new Date(b.monthStartDate));
  }, [budgetHistory, currentBudget]);

  const last6 = sortedBudgets.slice(-6);
  const monthlyTotals = useMemo(() => getMonthlyTotals(last6), [last6]);
  const pastForCompare = sortedBudgets.filter(b => b.id !== currentBudget.id);

  const currentTotal = currentBudget.expenses.reduce((s, e) => s + e.amount, 0);
  const pastTotals = pastForCompare.map(b => b.expenses.reduce((s, e) => s + e.amount, 0));
  const avgTotal = pastTotals.length > 0 ? pastTotals.reduce((s, v) => s + v, 0) / pastTotals.length : 0;
  const diff = currentTotal - avgTotal;
  const diffPct = avgTotal > 0 ? (diff / avgTotal) * 100 : 0;

  const comparisonData = useMemo(() => monthlyTotals.map(m => {
    const d = new Date(m.monthStartDate);
    return {
      label: d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
      needs: m.buckets.needs || 0,
      wants: m.buckets.wants || 0,
      save_invest: m.buckets.save_invest || 0,
      total: m.total,
    };
  }), [monthlyTotals]);

  // Category trends — pick top 3 most-spent categories
  const categoryByMonth = useMemo(() => getCategoryTotalsByMonth(last6), [last6]);
  const topCategories = useMemo(() => {
    const totals = Object.entries(categoryByMonth).map(([cat, points]) => ({
      cat,
      total: points.reduce((s, p) => s + p.amount, 0),
    }));
    return totals.sort((a, b) => b.total - a.total).slice(0, 3).map(t => t.cat);
  }, [categoryByMonth]);

  const trendData = useMemo(() => {
    const monthLabels = last6.map(b => ({
      label: new Date(b.monthStartDate).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
      monthStartDate: b.monthStartDate,
    }));
    return monthLabels.map(ml => {
      const point = { label: ml.label };
      topCategories.forEach(cat => {
        const found = (categoryByMonth[cat] || []).find(p => p.monthStartDate === ml.monthStartDate);
        point[cat] = found ? found.amount : 0;
      });
      return point;
    });
  }, [last6, categoryByMonth, topCategories]);

  // Category comparison cards
  const categoryComparison = useMemo(() => {
    const currentMap = {};
    currentBudget.expenses.forEach(e => {
      currentMap[e.category] = (currentMap[e.category] || 0) + e.amount;
    });
    const avgMap = {};
    pastForCompare.forEach(b => {
      const m = {};
      b.expenses.forEach(e => {
        m[e.category] = (m[e.category] || 0) + e.amount;
      });
      Object.entries(m).forEach(([cat, amt]) => {
        if (!avgMap[cat]) avgMap[cat] = { sum: 0, count: 0 };
        avgMap[cat].sum += amt;
        avgMap[cat].count++;
      });
    });
    const allCats = new Set([...Object.keys(currentMap), ...Object.keys(avgMap)]);
    return Array.from(allCats).map(cat => {
      const current = currentMap[cat] || 0;
      const avg = avgMap[cat] ? avgMap[cat].sum / avgMap[cat].count : 0;
      return { cat, current, avg, diff: current - avg };
    }).sort((a, b) => b.current - a.current);
  }, [currentBudget, pastForCompare]);

  const insights = useMemo(() => generateInsights(currentBudget, sortedBudgets, currency), [currentBudget, sortedBudgets, currency]);

  const belowAverageCount = categoryComparison.filter(c => c.avg > 0 && c.current < c.avg).length;
  const totalCategoriesWithHistory = categoryComparison.filter(c => c.avg > 0).length;

  const hasData = pastForCompare.length > 0;

  return (
    <div className="screen-container">
      <header className="screen-header">
        <h1 className="screen-title">Analytics</h1>
        <p className="screen-subtitle">Spending insights & trends</p>
      </header>

      {!hasData ? (
        <div className="empty-state">
          <p style={{ fontSize: '48px' }}>📊</p>
          <p>Once you have a few months of expense data, analytics will appear here.</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="analytics-summary-row">
            <div className="analytics-summary-card">
              <p className="analytics-summary-label">This Month</p>
              <p className="analytics-summary-value">{formatCurrency(currentTotal, currency)}</p>
            </div>
            <div className="analytics-summary-card">
              <p className="analytics-summary-label">Avg ({pastTotals.length}mo)</p>
              <p className="analytics-summary-value">{formatCurrency(avgTotal, currency)}</p>
              {avgTotal > 0 && (
                <p className={`analytics-summary-sub ${diff > 0 ? 'over' : 'under'}`}>
                  {diff > 0 ? '+' : ''}{diffPct.toFixed(0)}% vs avg
                </p>
              )}
            </div>
          </div>

          {totalCategoriesWithHistory > 0 && (
            <div className="card">
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
                <strong style={{ color: 'var(--success)', fontSize: 16 }}>
                  {belowAverageCount} of {totalCategoriesWithHistory}
                </strong> categories below average this month
              </p>
            </div>
          )}

          {/* Monthly Comparison */}
          {comparisonData.length > 1 && (
            <div className="card">
              <h3 className="card-title">Monthly Spending</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={comparisonData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(v, name) => [formatCurrency(v, currency), BUCKET_CONFIG[name]?.label || name]}
                    contentStyle={{ fontSize: 12, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)' }}
                  />
                  <Legend formatter={v => BUCKET_CONFIG[v]?.label || v} iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="needs" stackId="a" fill="var(--needs-color)" />
                  <Bar dataKey="wants" stackId="a" fill="var(--wants-color)" />
                  <Bar dataKey="save_invest" stackId="a" fill="var(--invest-color)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Trends */}
          {topCategories.length > 0 && trendData.length > 1 && (
            <div className="card">
              <h3 className="card-title">Top Category Trends</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(v) => formatCurrency(v, currency)}
                    contentStyle={{ fontSize: 12, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)' }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  {topCategories.map((cat, i) => (
                    <Line
                      key={cat}
                      type="monotone"
                      dataKey={cat}
                      stroke={['#3b82f6', '#f59e0b', '#10b981'][i]}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Insights */}
          {insights.length > 0 && (
            <div className="card">
              <h3 className="card-title">💡 Insights</h3>
              {insights.map((ins, i) => (
                <div key={i} className={`insight-card ${ins.type}`}>
                  <span className="insight-icon">{ins.type === 'over' ? '📈' : '📉'}</span>
                  <div className="insight-text">
                    {ins.message}
                    <p className="insight-detail">
                      Now: {formatCurrency(ins.current, currency)} · Avg: {formatCurrency(ins.avg, currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Category Comparison */}
          {categoryComparison.length > 0 && (
            <div className="card">
              <h3 className="card-title">Current vs. Average</h3>
              {categoryComparison.map(c => (
                <div key={c.cat} className="category-compare-row">
                  <div className="compare-left">
                    <span className="compare-name">{c.cat}</span>
                  </div>
                  <div className="compare-right">
                    <p className="compare-current">{formatCurrency(c.current, currency)}</p>
                    {c.avg > 0 && (
                      <p className={`compare-diff ${c.diff > 0 ? 'over' : 'under'}`}>
                        {c.diff > 0 ? '+' : ''}{formatCurrency(c.diff, currency)} vs avg
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
