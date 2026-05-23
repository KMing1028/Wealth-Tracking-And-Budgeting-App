import { useState, useCallback } from 'react';
import {
  getWealth, saveWealth,
  getBudgetHistory, saveBudgetHistory,
  getSettings, saveSettings,
} from '../utils/storage';
import { getOrCreateCurrentBudget } from '../utils/calculations';

export function useAppData() {
  const [wealthData, setWealthDataState] = useState(() => getWealth());
  const [budgetHistory, setBudgetHistoryState] = useState(() => getBudgetHistory());
  const [settings, setSettingsState] = useState(() => getSettings());

  const setWealthData = useCallback((data) => {
    const next = typeof data === 'function' ? data(getWealth()) : data;
    saveWealth(next);
    setWealthDataState(next);
  }, []);

  const setBudgetHistory = useCallback((data) => {
    const next = typeof data === 'function' ? data(getBudgetHistory()) : data;
    saveBudgetHistory(next);
    setBudgetHistoryState(next);
  }, []);

  const updateSettings = useCallback((updates) => {
    setSettingsState(prev => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  // Reload from storage (for after onboarding clears/keeps example data)
  const reload = useCallback(() => {
    setWealthDataState(getWealth());
    setBudgetHistoryState(getBudgetHistory());
    setSettingsState(getSettings());
  }, []);

  const currentBudget = getOrCreateCurrentBudget(budgetHistory);

  const updateCurrentBudget = useCallback((updater) => {
    setBudgetHistory(prev => {
      const current = getOrCreateCurrentBudget(prev);
      const updated = typeof updater === 'function' ? updater(current) : updater;
      const exists = prev.find(b => b.id === updated.id);
      if (exists) {
        return prev.map(b => b.id === updated.id ? updated : b);
      }
      return [...prev, updated];
    });
  }, [setBudgetHistory]);

  return {
    wealthData, setWealthData,
    budgetHistory, setBudgetHistory,
    currentBudget, updateCurrentBudget,
    settings, updateSettings,
    reload,
  };
}
