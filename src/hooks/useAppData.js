import { useState, useCallback, useEffect } from 'react';
import {
  getWealth, saveWealth,
  getBudgetHistory, saveBudgetHistory,
  getSettings, saveSettings,
  getGoals, saveGoals,
  getCustomCategories, saveCustomCategories,
  getDebts, saveDebts,
  getLastDebtCycleReset, setLastDebtCycleReset,
} from '../utils/storage';
import { getOrCreateCurrentBudget } from '../utils/calculations';
import { resetDebtsForCycle } from '../utils/debt';

export function useAppData() {
  const [wealthData, setWealthDataState] = useState(() => getWealth());
  const [budgetHistory, setBudgetHistoryState] = useState(() => getBudgetHistory());
  const [settings, setSettingsState] = useState(() => getSettings());
  const [goals, setGoalsState] = useState(() => getGoals());
  const [customCategories, setCustomCategoriesState] = useState(() => getCustomCategories());
  const [debts, setDebtsState] = useState(() => getDebts());

  // Apply theme to document
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme || 'light';
  }, [settings.theme]);

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

  const setGoals = useCallback((data) => {
    const next = typeof data === 'function' ? data(getGoals()) : data;
    saveGoals(next);
    setGoalsState(next);
  }, []);

  const setCustomCategories = useCallback((data) => {
    const next = typeof data === 'function' ? data(getCustomCategories()) : data;
    saveCustomCategories(next);
    setCustomCategoriesState(next);
  }, []);

  const setDebts = useCallback((data) => {
    const next = typeof data === 'function' ? data(getDebts()) : data;
    saveDebts(next);
    setDebtsState(next);
  }, []);

  const reload = useCallback(() => {
    setWealthDataState(getWealth());
    setBudgetHistoryState(getBudgetHistory());
    setSettingsState(getSettings());
    setGoalsState(getGoals());
    setCustomCategoriesState(getCustomCategories());
    setDebtsState(getDebts());
  }, []);

  const cycleDay = settings.budgetCycleDay || 27;
  const currentBudget = getOrCreateCurrentBudget(budgetHistory, cycleDay);

  // Reset debt payment status when a new budget cycle starts
  useEffect(() => {
    if (!currentBudget?.monthStartDate) return;
    const cycleKey = currentBudget.monthStartDate.split('T')[0];
    const last = getLastDebtCycleReset();
    if (last !== cycleKey) {
      const currentDebts = getDebts();
      if (currentDebts.some(d => d.paidThisCycle)) {
        const reset = resetDebtsForCycle(currentDebts);
        saveDebts(reset);
        setDebtsState(reset);
      }
      setLastDebtCycleReset(cycleKey);
    }
  }, [currentBudget?.monthStartDate]);

  const updateCurrentBudget = useCallback((updater) => {
    setBudgetHistory(prev => {
      const current = getOrCreateCurrentBudget(prev, cycleDay);
      const updated = typeof updater === 'function' ? updater(current) : updater;
      const exists = prev.find(b => b.id === updated.id);
      if (exists) {
        return prev.map(b => b.id === updated.id ? updated : b);
      }
      return [...prev, updated];
    });
  }, [setBudgetHistory, cycleDay]);

  return {
    wealthData, setWealthData,
    budgetHistory, setBudgetHistory,
    currentBudget, updateCurrentBudget,
    settings, updateSettings,
    goals, setGoals,
    customCategories, setCustomCategories,
    debts, setDebts,
    reload,
  };
}
