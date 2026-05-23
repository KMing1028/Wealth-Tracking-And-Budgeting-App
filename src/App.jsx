import React, { useState, useEffect } from 'react';
import { isOnboardingComplete } from './utils/storage';
import { useAppData } from './hooks/useAppData';
import { shouldShowDailyReminder, markDailyReminderShown } from './utils/notifications';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import Dashboard from './components/dashboard/Dashboard';
import WealthTracker from './components/wealth/WealthTracker';
import BudgetTracker from './components/budget/BudgetTracker';
import SavingsGoals from './components/goals/SavingsGoals';
import Analytics from './components/analytics/Analytics';
import Settings from './components/settings/Settings';
import BottomNav from './components/common/BottomNav';
import './App.css';

export default function App() {
  const [onboarded, setOnboarded] = useState(() => isOnboardingComplete());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showReminderBanner, setShowReminderBanner] = useState(false);

  const {
    wealthData, setWealthData,
    budgetHistory,
    currentBudget, updateCurrentBudget,
    settings, updateSettings,
    goals, setGoals,
    customCategories, setCustomCategories,
    reload,
  } = useAppData();

  useEffect(() => {
    if (onboarded && shouldShowDailyReminder()) {
      setShowReminderBanner(true);
      const timer = setTimeout(() => {
        setShowReminderBanner(false);
        markDailyReminderShown();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [onboarded]);

  function handleDismissReminder() {
    setShowReminderBanner(false);
    markDailyReminderShown();
  }

  function handleOnboardingComplete() {
    reload();
    setOnboarded(true);
  }

  function handleDataCleared() {
    reload();
    setActiveTab('dashboard');
    setOnboarded(false);
  }

  if (!onboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="app">
      {showReminderBanner && (
        <div className="notif-banner">
          <span className="notif-banner-icon">💸</span>
          <span className="notif-banner-text">Don't forget to log today's expenses!</span>
          <button className="notif-banner-close" onClick={handleDismissReminder} aria-label="Dismiss">×</button>
        </div>
      )}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            wealthData={wealthData}
            currentBudget={currentBudget}
            settings={settings}
            goals={goals}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'wealth' && (
          <WealthTracker
            wealthData={wealthData}
            setWealthData={setWealthData}
            settings={settings}
          />
        )}
        {activeTab === 'budget' && (
          <BudgetTracker
            budgetHistory={budgetHistory}
            currentBudget={currentBudget}
            updateCurrentBudget={updateCurrentBudget}
            settings={settings}
            customCategories={customCategories}
            goals={goals}
            setGoals={setGoals}
          />
        )}
        {activeTab === 'goals' && (
          <SavingsGoals
            goals={goals}
            setGoals={setGoals}
            settings={settings}
          />
        )}
        {activeTab === 'analytics' && (
          <Analytics
            budgetHistory={budgetHistory}
            currentBudget={currentBudget}
            settings={settings}
          />
        )}
        {activeTab === 'settings' && (
          <Settings
            settings={settings}
            updateSettings={updateSettings}
            customCategories={customCategories}
            setCustomCategories={setCustomCategories}
            onDataCleared={handleDataCleared}
          />
        )}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
