import React, { useState } from 'react';
import { CURRENCIES } from '../../utils/currencies';
import { generateSampleWealth, generateSampleBudget } from '../../utils/sampleData';
import { saveWealth, saveBudgetHistory, saveSettings, setOnboardingComplete, setExampleDataCleared, DEFAULT_SETTINGS } from '../../utils/storage';

const TOTAL_SCREENS = 11;

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
      {screen === 2 && <ScreenNetWorth onNext={next} onPrev={prev} />}
      {screen === 3 && <ScreenFeature screenNum={3} onNext={next} onPrev={prev} />}
      {screen === 4 && <ScreenDebt onNext={next} onPrev={prev} />}
      {screen === 5 && <ScreenFeature screenNum={5} onNext={next} onPrev={prev} />}
      {screen === 6 && <ScreenFeature screenNum={6} onNext={next} onPrev={prev} />}
      {screen === 7 && <ScreenFeature screenNum={7} onNext={next} onPrev={prev} />}
      {screen === 8 && <ScreenNotifications onNext={next} onPrev={prev} />}
      {screen === 9 && (
        <ScreenCycleDay
          cycleDay={cycleDay}
          onChange={setCycleDay}
          onNext={next}
          onPrev={prev}
        />
      )}
      {screen === 10 && (
        <ScreenCurrency
          selectedCurrency={selectedCurrency}
          onSelect={setSelectedCurrency}
          onNext={next}
          onPrev={prev}
        />
      )}
      {screen === 11 && <ScreenComplete onComplete={handleComplete} />}
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
          Monitor your true net worth (assets minus debts), stay on top of your budget,
          and reach your savings goals — all in one place.
        </p>
      </div>
      <div className="ob-actions">
        <button className="btn-primary btn-lg" onClick={onNext}>Get Started</button>
        <button className="btn-ghost" onClick={onSkip}>Skip onboarding</button>
      </div>
    </div>
  );
}

function ScreenNetWorth({ onNext, onPrev }) {
  return (
    <div className="ob-screen">
      <ProgressDots current={2} total={TOTAL_SCREENS - 1} />
      <div className="ob-feature-icon">⚖️</div>
      <h2 className="ob-feature-title">True Net Worth</h2>
      <p className="ob-feature-desc">Your real wealth = what you own minus what you owe.</p>
      <div className="ob-visual-card">
        <div className="ob-stat-row"><span>💰 Total Assets</span><strong className="green">RM 244,820</strong></div>
        <div className="ob-stat-row"><span>🏦 Total Debt</span><strong className="red">− RM 73,500</strong></div>
        <div className="ob-stat-row" style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
          <span><strong>Net Worth</strong></span>
          <strong style={{ fontSize: 20 }}>RM 171,320</strong>
        </div>
      </div>
      <ul className="ob-points">
        <li>See your real financial position at a glance</li>
        <li>Track growth even while paying down debt</li>
        <li>Make smarter decisions with the full picture</li>
      </ul>
      <div className="ob-nav">
        <button className="btn-ghost" onClick={onPrev}>Back</button>
        <button className="btn-primary" onClick={onNext}>Next</button>
      </div>
    </div>
  );
}

function ScreenDebt({ onNext, onPrev }) {
  return (
    <div className="ob-screen">
      <ProgressDots current={4} total={TOTAL_SCREENS - 1} />
      <div className="ob-feature-icon">🏦</div>
      <h2 className="ob-feature-title">Debt Management</h2>
      <p className="ob-feature-desc">Track every debt and see when you'll be debt-free.</p>
      <div className="ob-visual-card">
        <div className="ob-stat-row"><span>💳 Credit Card</span><strong>RM 8,500</strong></div>
        <div className="ob-stat-row small"><span>🚗 Car Loan</span><span>RM 35,000</span></div>
        <div className="ob-stat-row small"><span>🎓 Student Loan</span><span>RM 30,000</span></div>
        <div className="ob-badge green">Debt-Free by Jun 2029</div>
      </div>
      <ul className="ob-points">
        <li>Add credit cards, loans, mortgages, and more</li>
        <li>Check off monthly payments per budget cycle</li>
        <li>See projected payoff dates automatically</li>
      </ul>
      <div className="ob-nav">
        <button className="btn-ghost" onClick={onPrev}>Back</button>
        <button className="btn-primary" onClick={onNext}>Next</button>
      </div>
    </div>
  );
}

function ScreenNotifications({ onNext, onPrev }) {
  return (
    <div className="ob-screen">
      <ProgressDots current={8} total={TOTAL_SCREENS - 1} />
      <div className="ob-feature-icon">🔔</div>
      <h2 className="ob-feature-title">Smart Notifications</h2>
      <p className="ob-feature-desc">In-app reminders that keep you on track — no phone notifications.</p>
      <div className="ob-visual-card">
        <div className="ob-notif-row">🔄 <span>Budget cycle reset</span></div>
        <div className="ob-notif-row">💸 <span>Daily expense reminder</span></div>
        <div className="ob-notif-row">⚠️ <span>Budget limit warnings</span></div>
        <div className="ob-notif-row">🎉 <span>Goal milestones</span></div>
        <div className="ob-notif-row">📅 <span>Weekly spending summary</span></div>
        <div className="ob-notif-row">📈 <span>Monthly wealth update</span></div>
      </div>
      <p className="ob-example">All notifications respect light & dark themes and dismiss when you act on them.</p>
      <div className="ob-nav">
        <button className="btn-ghost" onClick={onPrev}>Back</button>
        <button className="btn-primary" onClick={onNext}>Next</button>
      </div>
    </div>
  );
}

const FEATURE_SCREENS = {
  3: {
    icon: '📊',
    title: 'Wealth Tracking',
    desc: 'Monitor your complete asset picture in one place.',
    points: [
      'Track wealth across savings, stocks, and retirement',
      'Visualize growth: YTD, 1Y, and 5Y',
      'Add unlimited accounts',
    ],
    example: '"Track RM 244,820 across all your accounts"',
    visual: (
      <div className="ob-visual-card">
        <div className="ob-stat-row"><span>💰 Total Assets</span><strong className="green">RM 244,820</strong></div>
        <div className="ob-stat-row small"><span>🏦 Savings</span><span>RM 50,000</span></div>
        <div className="ob-stat-row small"><span>📈 Stocks</span><span>RM 150,000</span></div>
        <div className="ob-stat-row small"><span>🎯 Retirement</span><span>RM 44,820</span></div>
        <div className="ob-badge green">+8.4% YTD</div>
      </div>
    ),
  },
  5: {
    icon: '💳',
    title: 'Budget Management',
    desc: 'Customizable monthly budget cycles aligned with your payday.',
    points: [
      'Pick any cycle day from 1–31',
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
  6: {
    icon: '🎯',
    title: 'Smart Categories & Goals',
    desc: 'Three balanced buckets plus dedicated savings goals.',
    points: [
      '🏠 Needs — essential living costs',
      '🎉 Wants — discretionary spending',
      '💪 Save & Invest — wealth building',
    ],
    example: '"Set goals like emergency fund, holiday, or home down payment"',
    visual: (
      <div className="ob-visual-card">
        <div className="ob-bucket-row needs"><span>🏠 Needs</span><strong>49%</strong></div>
        <div className="ob-bucket-row wants"><span>🎉 Wants</span><strong>34%</strong></div>
        <div className="ob-bucket-row invest"><span>💪 Save & Invest</span><strong>17%</strong></div>
      </div>
    ),
  },
  7: {
    icon: '📈',
    title: 'Analytics & Insights',
    desc: 'Visual charts that make your financial progress crystal clear.',
    points: [
      'Line charts for wealth growth over time',
      'Bar charts for monthly spending trends',
      'AI-style insights on category changes',
    ],
    example: '"You spent 23% less on Dining this month"',
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
};

function ScreenFeature({ screenNum, onNext, onPrev }) {
  const data = FEATURE_SCREENS[screenNum];
  return (
    <div className="ob-screen">
      <ProgressDots current={screenNum} total={TOTAL_SCREENS - 1} />
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

function ScreenCycleDay({ cycleDay, onChange, onNext, onPrev }) {
  return (
    <div className="ob-screen">
      <ProgressDots current={9} total={TOTAL_SCREENS - 1} />
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

function ScreenCurrency({ selectedCurrency, onSelect, onNext, onPrev }) {
  return (
    <div className="ob-screen">
      <ProgressDots current={10} total={TOTAL_SCREENS - 1} />
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
