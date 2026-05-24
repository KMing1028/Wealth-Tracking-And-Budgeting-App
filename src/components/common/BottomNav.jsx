import React, { useState } from 'react';

const PRIMARY_TABS = [
  { id: 'wealth', label: 'Wealth', icon: '💰' },
  { id: 'budget', label: 'Budget', icon: '💳' },
  { id: 'dashboard', label: 'Home', icon: '🏠' },
  { id: 'debt', label: 'Debt', icon: '🏦' },
];

const MORE_MENU = [
  { id: 'goals', label: 'Savings Goals', icon: '🎯', desc: 'Set and track financial goals' },
  { id: 'analytics', label: 'Analytics', icon: '📊', desc: 'Trends and insights' },
  { id: 'settings', label: 'Settings', icon: '⚙️', desc: 'Currency, theme, and more' },
];

const MORE_IDS = MORE_MENU.map(m => m.id);

export default function BottomNav({ activeTab, onTabChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const moreActive = MORE_IDS.includes(activeTab);

  function handleSelectMore(id) {
    setMenuOpen(false);
    onTabChange(id);
  }

  return (
    <>
      <nav className="bottom-nav">
        {PRIMARY_TABS.map(tab => (
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
        <button
          className={`bottom-nav-item ${moreActive ? 'active' : ''}`}
          onClick={() => setMenuOpen(true)}
          aria-label="More"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="nav-icon">⋯</span>
          <span className="nav-label">More</span>
        </button>
      </nav>

      {menuOpen && (
        <div className="more-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="more-menu-sheet" onClick={e => e.stopPropagation()} role="menu">
            <div className="more-menu-header">
              <span>More</span>
              <button className="more-menu-close" onClick={() => setMenuOpen(false)} aria-label="Close">×</button>
            </div>
            {MORE_MENU.map(item => (
              <button
                key={item.id}
                className={`more-menu-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleSelectMore(item.id)}
                role="menuitem"
              >
                <span className="more-menu-icon">{item.icon}</span>
                <div className="more-menu-text">
                  <strong>{item.label}</strong>
                  <span>{item.desc}</span>
                </div>
                <span className="more-menu-chevron">›</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
