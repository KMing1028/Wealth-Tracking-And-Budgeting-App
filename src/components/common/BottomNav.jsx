import React from 'react';

const TABS = [
  { id: 'dashboard', label: 'Home', icon: '🏠' },
  { id: 'wealth', label: 'Wealth', icon: '📈' },
  { id: 'budget', label: 'Budget', icon: '💳' },
  { id: 'goals', label: 'Goals', icon: '🎯' },
  { id: 'analytics', label: 'Stats', icon: '📊' },
  { id: 'settings', label: 'More', icon: '⚙️' },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          aria-label={tab.label}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
