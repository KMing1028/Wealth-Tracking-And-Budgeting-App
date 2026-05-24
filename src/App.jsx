import React, { useState } from 'react';
import { isOnboardingComplete } from './utils/storage';
import { useAppData } from './hooks/useAppData';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import Dashboard from './components/dashboard/Dashboard';
import WealthTracker from './components/wealth/WealthTracker';
import BudgetTracker from './components/budget/BudgetTracker';
import DebtTracker from './components/debt/DebtTracker';
import SavingsGoals from './components/goals/SavingsGoals';
import Analytics from './components/analytics/Analytics';
import Settings from './components/settings/Settings';
import BottomNav from './components/common/BottomNav';
import NotificationModals from './components/notifications/NotificationModals';
import './App.css';

export default function App() {
  const [onboarded, setOnboarded] = useState(() => isOnboardingComplete());
  const [activeTab, setActiveTab] = useState('dashboard');

  const {
    wealthData, setWealthData,
    budgetHistory,
    currentBudget, updateCurrentBudget,
    settings, updateSettings,
    goals, setGoals,
    customCategories, setCustomCategories,
    debts, setDebts,
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
      {onboarded && (
        <NotificationModals
          goals={goals}
          wealthData={wealthData}
          settings={settings}
          onNavigate={setActiveTab}
        />
      )}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            wealthData={wealthData}
            currentBudget={currentBudget}
            settings={settings}
            goals={goals}
            debts={debts}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'debt' && (
          <DebtTracker
            debts={debts}
            setDebts={setDebts}
            settings={settings}
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
