import React, { useState } from 'react';

// SVG icon paths — 20×20 viewBox, stroke icons
const Icons = {
  wealth: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14l4-4 4 3 6-7" />
    </svg>
  ),
  budget: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="6.5" />
      <path d="M10 3a7 7 0 017 7" />
    </svg>
  ),
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l7-6 7 6v8a1 1 0 01-1 1h-3v-6H7v6H4a1 1 0 01-1-1V9z" />
    </svg>
  ),
  debt: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6.5" width="14" height="8" rx="1.5" />
      <path d="M3 9.5h14" />
    </svg>
  ),
  more: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="5" cy="10" r="1.3" fill="currentColor" />
      <circle cx="10" cy="10" r="1.3" fill="currentColor" />
      <circle cx="15" cy="10" r="1.3" fill="currentColor" />
    </svg>
  ),
};

const PRIMARY_TABS = [
  { id: 'wealth', label: 'Wealth' },
  { id: 'budget', label: 'Budget' },
  { id: 'dashboard', label: 'Home' },
  { id: 'debt', label: 'Debt' },
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
        <div className="bottom-nav-pill">
          {PRIMARY_TABS.map(tab => (
            <button
              key={tab.id}
              className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span className="nav-icon">{Icons[tab.id]}</span>
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
            <span className="nav-icon">{Icons.more}</span>
            <span className="nav-label">More</span>
          </button>
        </div>
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
