import React, { useState } from 'react';
import { CURRENCIES } from '../../utils/currencies';
import { generateSampleWealth, generateSampleBudget } from '../../utils/sampleData';
import { saveWealth, saveBudgetHistory, saveSettings, setOnboardingComplete, setExampleDataCleared, DEFAULT_SETTINGS } from '../../utils/storage';

// 4 steps: Welcome (0) → Tour (1) → Setup (2) → Start (3)
export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState('MYR');
  const [cycleDay, setCycleDay] = useState(27);

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);

  function handleComplete(mode) {
    saveSettings({ ...DEFAULT_SETTINGS, currency: selectedCurrency, budgetCycleDay: cycleDay });
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
    <div className="ob-wrap">
      {step === 0 && <StepWelcome onNext={next} onSkip={() => handleComplete('fresh')} />}
      {step === 1 && <StepTour onNext={next} onPrev={prev} />}
      {step === 2 && (
        <StepSetup
          currency={selectedCurrency} setCurrency={setSelectedCurrency}
          cycleDay={cycleDay} setCycleDay={setCycleDay}
          onNext={next} onPrev={prev}
        />
      )}
      {step === 3 && <StepStart onComplete={handleComplete} onPrev={prev} />}
    </div>
  );
}

function ProgressDots({ current }) {
  return (
    <div className="ob-dots">
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={`ob-dot ${i === current ? 'active' : ''}`} />
      ))}
    </div>
  );
}

// ── Step 0: Welcome ──────────────────────────────────────────
function StepWelcome({ onNext, onSkip }) {
  return (
    <div className="ob-screen ob-welcome">
      <div className="ob-brand">
        <div className="ob-brand-mark">
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="var(--primary)" />
            <path d="M9 6.5L9 17.5M9 7L15 7M9 11.5L13.5 11.5"
              stroke="white" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </div>
        <div className="ob-brand-name">Sprout</div>
        <p className="ob-tagline">
          Track your wealth, budget, debt &amp; goals —<br />all in one place.
        </p>
      </div>

      <div className="ob-pills">
        {[
          { icon: '🔒', text: 'Stays on your device' },
          { icon: '🌍', text: '20 currencies supported' },
          { icon: '🔔', text: 'Gentle in-app reminders only' },
        ].map((p) => (
          <div key={p.text} className="ob-pill-row">
            <span className="ob-pill-icon">{p.icon}</span>
            <span>{p.text}</span>
          </div>
        ))}
      </div>

      <div className="ob-actions">
        <button className="btn-primary btn-lg" onClick={onNext}>Get started</button>
        <button className="btn-ghost ob-skip" onClick={onSkip}>Skip onboarding →</button>
      </div>
    </div>
  );
}

// ── Step 1: Tour ──────────────────────────────────────────────
function StepTour({ onNext, onPrev }) {
  const features = [
    { icon: '💰', title: 'Net worth', desc: 'Assets minus debts, tracked over time.', cls: 'sage' },
    { icon: '💳', title: 'Budget', desc: 'Custom monthly cycle, three smart buckets.', cls: 'terra' },
    { icon: '🎯', title: 'Goals', desc: 'Save for what matters, with progress tracking.', cls: 'amber' },
    { icon: '🏦', title: 'Debt', desc: 'Loans, cards, and projected payoff dates.', cls: 'plum' },
  ];
  return (
    <div className="ob-screen">
      <ProgressDots current={2} />
      <h2 className="ob-step-title">
        Everything in <span className="ob-accent">one place</span>
      </h2>
      <p className="ob-step-sub">Track your whole financial picture without juggling apps or spreadsheets.</p>

      <div className="ob-feature-grid">
        {features.map((f) => (
          <div key={f.title} className={`ob-feature-card ob-feature-card--${f.cls}`}>
            <span className="ob-feature-emoji">{f.icon}</span>
            <div className="ob-feature-title">{f.title}</div>
            <div className="ob-feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="ob-preview-card">
        <div>
          <div className="ob-preview-label">Example net worth</div>
          <div className="ob-preview-value">RM 171,320</div>
        </div>
        <span className="ob-chip ob-chip--sage">↑ +8.4% YTD</span>
      </div>

      <div className="ob-nav">
        <button className="btn-ghost" onClick={onPrev}>Back</button>
        <button className="btn-primary ob-nav-main" onClick={onNext}>Continue</button>
      </div>
    </div>
  );
}

// ── Step 2: Setup ─────────────────────────────────────────────
const TOP_CURRENCIES = ['MYR', 'USD', 'SGD'];
const TOP_SYMBOLS = { MYR: 'RM', USD: '$', SGD: 'S$' };

function StepSetup({ currency, setCurrency, cycleDay, setCycleDay, onNext, onPrev }) {
  const others = CURRENCIES.filter(c => !TOP_CURRENCIES.includes(c.code));
  return (
    <div className="ob-screen">
      <ProgressDots current={3} />
      <h2 className="ob-step-title">Quick setup</h2>
      <p className="ob-step-sub">Two questions — both editable later in Settings.</p>

      <div className="ob-setup-section">
        <div className="ob-setup-label">Currency</div>
        <div className="ob-currency-grid">
          {TOP_CURRENCIES.map((code) => (
            <button
              key={code}
              className={`ob-currency-btn ${currency === code ? 'active' : ''}`}
              onClick={() => setCurrency(code)}
            >
              <span className="ob-currency-symbol">{TOP_SYMBOLS[code]}</span>
              <span className="ob-currency-code">{code}</span>
            </button>
          ))}
        </div>
        <div className="ob-currency-more">
          <span className="ob-currency-more-icon">🌍</span>
          <select
            className="ob-currency-select"
            value={TOP_CURRENCIES.includes(currency) ? '' : currency}
            onChange={e => e.target.value && setCurrency(e.target.value)}
          >
            <option value="">+ {others.length} more currencies…</option>
            {others.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="ob-setup-section">
        <div className="ob-setup-label">Budget resets on</div>
        <div className="ob-stepper">
          <button className="ob-step-btn" onClick={() => setCycleDay(d => Math.max(1, d - 1))}>−</button>
          <div className="ob-step-value">
            <span className="ob-step-num">{cycleDay}</span>
            <span className="ob-step-hint">day of each month{cycleDay > 28 ? ' (or last day)' : ''}</span>
          </div>
          <button className="ob-step-btn" onClick={() => setCycleDay(d => Math.min(31, d + 1))}>+</button>
        </div>
        <p className="ob-setup-tip">Tip: align this with your payday so each cycle starts fresh.</p>
      </div>

      <div className="ob-nav">
        <button className="btn-ghost" onClick={onPrev}>Back</button>
        <button className="btn-primary ob-nav-main" onClick={onNext}>Continue</button>
      </div>
    </div>
  );
}

// ── Step 3: Start ─────────────────────────────────────────────
function StepStart({ onComplete, onPrev }) {
  const [choice, setChoice] = useState(null);
  const options = [
    {
      id: 'example',
      icon: '📋',
      title: 'Start with sample data',
      desc: 'Explore Sprout with pre-filled Malaysian sample data.',
    },
    {
      id: 'fresh',
      icon: '✨',
      title: 'Start fresh',
      desc: 'Begin with a clean slate and add your own entries.',
    },
  ];
  return (
    <div className="ob-screen">
      <ProgressDots current={4} />
      <h2 className="ob-step-title">You're all set</h2>
      <p className="ob-step-sub">How would you like to begin?</p>

      <div className="ob-start-options">
        {options.map((o) => (
          <button
            key={o.id}
            className={`ob-start-option ${choice === o.id ? 'active' : ''}`}
            onClick={() => setChoice(o.id)}
          >
            <div className={`ob-start-icon ${choice === o.id ? 'active' : ''}`}>{o.icon}</div>
            <div className="ob-start-text">
              <strong>{o.title}</strong>
              <span>{o.desc}</span>
            </div>
            <div className={`ob-radio ${choice === o.id ? 'active' : ''}`}>
              {choice === o.id && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 4l3 3 5-6" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="ob-nav">
        <button className="btn-ghost" onClick={onPrev}>Back</button>
        <button
          className="btn-primary ob-nav-main"
          disabled={!choice}
          onClick={() => choice && onComplete(choice)}
        >
          {choice === 'example' ? 'Load sample data' : choice === 'fresh' ? 'Begin' : 'Choose to continue'}
        </button>
      </div>
    </div>
  );
}
