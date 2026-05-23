import React, { useState } from 'react';
import { CURRENCIES } from '../../utils/currencies';
import { generateSampleWealth, generateSampleBudget } from '../../utils/sampleData';
import { saveWealth, saveBudgetHistory, saveSettings, setOnboardingComplete, setExampleDataCleared, DEFAULT_SETTINGS } from '../../utils/storage';

const TOTAL_SCREENS = 10;

export default function OnboardingFlow({ onComplete }) {
  const [screen, setScreen] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState('MYR');
  const [cycleDay, setCycleDay] = useState(27);

  const next = () => setScreen(s => Math.min(s + 1, TOTAL_SCREENS));
  const prev = () => setScreen(s => Math.max(s - 1, 1));

  function handleComplete(mode) {
    saveSettings({
      ...DEFAULT_SETTINGS,
      currency: selectedCurrency,
      budgetCycleDay: cycleDay,
    });
    setOnboardingComplete();
    if (mode === 'fresh') {
      setExampleDataCleared();
      saveWealth([]);
      saveBudgetHistory([]);
    } else {
      saveWealth(generateSampleWealth());
      saveBudgetHistory(generateSampleBudget());
    }
    onComplete();
  }

  return (
    <div className="onboarding-container">
      {screen === 1 && <ScreenWelcome onNext={next} onSkip={() => handleComplete('fresh')} />}
      {screen === 2 && <ScreenFeature screenNum={2} onNext={next} onPrev={prev} />}
      {screen === 3 && <ScreenFeature screenNum={3} onNext={next} onPrev={prev} />}
      {screen === 4 && <ScreenFeature screenNum={4} onNext={next} onPrev={prev} />}
      {screen === 5 && <ScreenFeature screenNum={5} onNext={next} onPrev={prev} />}
      {screen === 6 && <ScreenWalkthrough6 onNext={next} onPrev={prev} />}
      {screen === 7 && <ScreenWalkthrough7 onNext={next} onPrev={prev} />}
      {screen === 8 && (
        <ScreenCycleDay
          cycleDay={cycleDay}
          onChange={setCycleDay}
          onNext={next}
          onPrev={prev}
        />
      )}
      {screen === 9 && (
        <ScreenCurrency
          selectedCurrency={selectedCurrency}
          onSelect={setSelectedCurrency}
          onNext={next}
          onPrev={prev}
        />
      )}
      {screen === 10 && <ScreenComplete onComplete={handleComplete} />}
    </div>
  );
}

function ScreenCycleDay({ cycleDay, onChange, onNext, onPrev }) {
  return (
    <div className="ob-screen">
      <ProgressDots current={7} total={TOTAL_SCREENS - 1} />
      <div className="ob-feature-icon">📅</div>
      <h2 className="ob-feature-title">When Does Your Budget Start?</h2>
      <p className="ob-feature-desc">Pick the day your budget resets each month — typically your payday.</p>
      <div className="ob-cycle-row">
        <label className="ob-cycle-label">
          <span>Reset on day</span>
          <input
            className="ob-cycle-input"
            type="number"
            min="1"
            max="31"
            value={cycleDay}
            onChange={e => onChange(Math.max(1, Math.min(31, parseInt(e.target.value, 10) || 1)))}
          />
          <span>of each month</span>
        </label>
      </div>
      <p className="ob-example">
        If the day doesn't exist (e.g. Feb 31), the last day of the month is used instead.
      </p>
      <div className="ob-nav">
        <button className="btn-ghost" onClick={onPrev}>Back</button>
        <button className="btn-primary" onClick={onNext}>Continue</button>
      </div>
    </div>
  );
}

function ProgressDots({ current, total }) {
  return (
    <div className="progress-dots">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`dot ${i + 1 === current ? 'active' : ''}`} />
      ))}
    </div>
  );
}

function ScreenWelcome({ onNext, onSkip }) {
  return (
    <div className="ob-screen">
      <div className="ob-hero">
        <div className="ob-app-icon">💰</div>
        <h1 className="ob-title">Wealth Tracker<br />& Budget Hub</h1>
        <p className="ob-tagline">Track your wealth growth and manage your budget like a pro</p>
        <p className="ob-desc">
          Monitor your net worth across savings, stocks, and retirement accounts.
          Stay on top of your monthly budget with smart expense categorization and growth insights.
        </p>
      </div>
      <div className="ob-actions">
        <button className="btn-primary btn-lg" onClick={onNext}>Get Started</button>
        <button className="btn-ghost" onClick={onSkip}>Skip onboarding</button>
      </div>
    </div>
  );
}

const FEATURE_SCREENS = {
  2: {
    icon: '📊',
    title: 'Wealth Tracking',
    desc: 'Monitor your complete financial picture in one place.',
    points: [
      'Track net worth across all accounts',
      'Multiple categories: savings, stocks, retirement',
      'Growth metrics: YTD, 1Y, and 5Y',
    ],
    example: '"Track RM 245,820 across savings, stocks, and retirement"',
    visual: (
      <div className="ob-visual-card">
        <div className="ob-stat-row"><span>💰 Net Worth</span><strong className="green">RM 245,820</strong></div>
        <div className="ob-stat-row small"><span>🏦 Savings</span><span>RM 85,000</span></div>
        <div className="ob-stat-row small"><span>📈 Stocks</span><span>RM 110,820</span></div>
        <div className="ob-stat-row small"><span>🎯 Retirement</span><span>RM 50,000</span></div>
        <div className="ob-badge green">+8.4% YTD</div>
      </div>
    ),
  },
  3: {
    icon: '💳',
    title: 'Budget Management',
    desc: 'Budget cycles from the 27th to the 26th — aligned with your salary.',
    points: [
      'Monthly budget cycles starting the 27th',
      'Three smart spending buckets',
      'Track spending vs. budget limits',
    ],
    example: '"Spend RM 4,280 of your RM 6,500 budget"',
    visual: (
      <div className="ob-visual-card">
        <div className="ob-stat-row"><span>Monthly Budget</span><strong>RM 6,500</strong></div>
        <div className="ob-progress-wrap">
          <div className="ob-progress-bar" style={{ width: '66%' }} />
        </div>
        <div className="ob-stat-row small"><span>Spent</span><span className="red">RM 4,280</span></div>
        <div className="ob-stat-row small"><span>Remaining</span><span className="green">RM 2,220</span></div>
      </div>
    ),
  },
  4: {
    icon: '📈',
    title: 'Growth & Insights',
    desc: 'Visual charts that make your financial progress crystal clear.',
    points: [
      'Line charts showing wealth growth over time',
      'Pie charts for category distribution',
      'Interactive charts with hover details',
    ],
    example: '"See your wealth grow +8.4% YTD"',
    visual: (
      <div className="ob-visual-card">
        <div className="ob-chart-demo">
          <svg viewBox="0 0 200 80" className="ob-line-svg" aria-hidden="true">
            <polyline points="0,70 40,60 80,50 120,35 160,20 200,10" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
            <circle cx="200" cy="10" r="4" fill="#3b82f6" />
          </svg>
        </div>
        <div className="ob-badge green">+8.4% YTD ↑</div>
      </div>
    ),
  },
  5: {
    icon: '🎯',
    title: 'Smart Categories',
    desc: 'Three balanced spending buckets to build wealth faster.',
    points: [
      '🏠 Needs — essential living costs',
      '🎉 Wants — discretionary spending',
      '💪 Save & Invest — wealth building',
    ],
    example: '"Balance your spending to build wealth faster"',
    visual: (
      <div className="ob-visual-card">
        <div className="ob-bucket-row needs"><span>🏠 Needs</span><strong>49%</strong></div>
        <div className="ob-bucket-row wants"><span>🎉 Wants</span><strong>34%</strong></div>
        <div className="ob-bucket-row invest"><span>💪 Save & Invest</span><strong>17%</strong></div>
      </div>
    ),
  },
};

function ScreenFeature({ screenNum, onNext, onPrev }) {
  const data = FEATURE_SCREENS[screenNum];
  return (
    <div className="ob-screen">
      <ProgressDots current={screenNum - 1} total={TOTAL_SCREENS - 1} />
      <div className="ob-feature-icon">{data.icon}</div>
      <h2 className="ob-feature-title">{data.title}</h2>
      <p className="ob-feature-desc">{data.desc}</p>
      {data.visual}
      <ul className="ob-points">
        {data.points.map((p, i) => <li key={i}>{p}</li>)}
      </ul>
      <p className="ob-example">{data.example}</p>
      <div className="ob-nav">
        <button className="btn-ghost" onClick={onPrev}>Back</button>
        <button className="btn-primary" onClick={onNext}>Next</button>
      </div>
    </div>
  );
}

function ScreenWalkthrough6({ onNext, onPrev }) {
  return (
    <div className="ob-screen">
      <ProgressDots current={5} total={TOTAL_SCREENS - 1} />
      <div className="ob-feature-icon">🏦</div>
      <h2 className="ob-feature-title">Try Adding Wealth</h2>
      <p className="ob-feature-desc">Here's how your wealth tracker looks with real data.</p>
      <div className="ob-demo-card">
        <div className="ob-demo-header">📊 Wealth Tracker</div>
        <div className="ob-demo-entry">
          <span className="ob-demo-label">Maybank Savings</span>
          <span className="ob-demo-value">RM 85,000</span>
        </div>
        <div className="ob-demo-entry">
          <span className="ob-demo-label">Bursa Malaysia</span>
          <span className="ob-demo-value">RM 48,500</span>
        </div>
        <div className="ob-demo-entry">
          <span className="ob-demo-label">Interactive Brokers</span>
          <span className="ob-demo-value">RM 62,320</span>
        </div>
        <div className="ob-demo-entry">
          <span className="ob-demo-label">EPF</span>
          <span className="ob-demo-value">RM 50,000</span>
        </div>
        <div className="ob-demo-total">
          <span>Total Net Worth</span>
          <strong>RM 245,820</strong>
        </div>
      </div>
      <div className="ob-nav">
        <button className="btn-ghost" onClick={onPrev}>Back</button>
        <button className="btn-primary" onClick={onNext}>Next</button>
      </div>
    </div>
  );
}

function ScreenWalkthrough7({ onNext, onPrev }) {
  return (
    <div className="ob-screen">
      <ProgressDots current={6} total={TOTAL_SCREENS - 1} />
      <div className="ob-feature-icon">💳</div>
      <h2 className="ob-feature-title">Try Logging an Expense</h2>
      <p className="ob-feature-desc">Expenses are automatically sorted into smart buckets.</p>
      <div className="ob-demo-card">
        <div className="ob-demo-header">💳 Budget Tracker</div>
        <div className="ob-demo-entry highlight">
          <span className="ob-demo-label">🛒 Groceries & Food</span>
          <span className="ob-demo-value">RM 280</span>
        </div>
        <div className="ob-demo-tag">Needs bucket</div>
        <div style={{ marginTop: '12px' }}>
          <div className="ob-bucket-row needs"><span>🏠 Needs</span><strong>RM 2,100 (49%)</strong></div>
          <div className="ob-bucket-row wants"><span>🎉 Wants</span><strong>RM 1,450 (34%)</strong></div>
          <div className="ob-bucket-row invest"><span>💪 Save & Invest</span><strong>RM 730 (17%)</strong></div>
        </div>
      </div>
      <div className="ob-nav">
        <button className="btn-ghost" onClick={onPrev}>Back</button>
        <button className="btn-primary" onClick={onNext}>Next</button>
      </div>
    </div>
  );
}

function ScreenCurrency({ selectedCurrency, onSelect, onNext, onPrev }) {
  return (
    <div className="ob-screen">
      <ProgressDots current={8} total={TOTAL_SCREENS - 1} />
      <div className="ob-feature-icon">🌍</div>
      <h2 className="ob-feature-title">Choose Your Currency</h2>
      <p className="ob-feature-desc">This will be used throughout the app. You can change it later in Settings.</p>
      <select
        className="ob-currency-select"
        value={selectedCurrency}
        onChange={e => onSelect(e.target.value)}
        aria-label="Select currency"
      >
        {CURRENCIES.map(c => (
          <option key={c.code} value={c.code}>{c.label}</option>
        ))}
      </select>
      <div className="ob-nav">
        <button className="btn-ghost" onClick={onPrev}>Back</button>
        <button className="btn-primary" onClick={onNext}>Continue</button>
      </div>
    </div>
  );
}

function ScreenComplete({ onComplete }) {
  return (
    <div className="ob-screen ob-screen-center">
      <div className="ob-complete-icon">🎉</div>
      <h2 className="ob-feature-title">You're All Set!</h2>
      <p className="ob-feature-desc">How would you like to get started?</p>
      <div className="ob-complete-options">
        <button className="ob-option-btn" onClick={() => onComplete('example')}>
          <span className="ob-option-icon">📋</span>
          <div>
            <strong>Start with Example Data</strong>
            <p>Explore the app with pre-filled Malaysian data</p>
          </div>
        </button>
        <button className="ob-option-btn" onClick={() => onComplete('fresh')}>
          <span className="ob-option-icon">✨</span>
          <div>
            <strong>Start Fresh</strong>
            <p>Begin with a clean slate and add your own data</p>
          </div>
        </button>
      </div>
    </div>
  );
}
