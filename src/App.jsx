import React, { useState } from 'react';
import { isOnboardingComplete } from './utils/storage';
import { useAppData } from './hooks/useAppData';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import Dashboard from './components/dashboard/Dashboard';
import WealthTracker from './components/wealth/WealthTracker';
import BudgetTracker from './components/budget/BudgetTracker';
import Settings from './components/settings/Settings';
import BottomNav from './components/common/BottomNav';
import './App.css';

export default function App() {
  const [onboarded, setOnboarded] = useState(() => isOnboardingComplete());
  const [activeTab, setActiveTab] = useState('dashboard');

  const {
    wealthData, setWealthData,
    budgetHistory,
    currentBudget, updateCurrentBudget,
    settings, updateSettings,
    reload,
  } = useAppData();

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
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            wealthData={wealthData}
            currentBudget={currentBudget}
            settings={settings}
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
          />
        )}
        {activeTab === 'settings' && (
          <Settings
            settings={settings}
            updateSettings={updateSettings}
            onDataCleared={handleDataCleared}
          />
        )}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
