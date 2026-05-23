const KEYS = {
  WEALTH: 'wealthData',
  BUDGET: 'budgetHistory',
  SETTINGS: 'appSettings',
  ONBOARDING: 'onboardingComplete',
  EXAMPLE_CLEARED: 'exampleDataCleared',
  GOALS: 'savingsGoals',
  CUSTOM_CATEGORIES: 'customCategories',
};

function read(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write failed', e);
  }
}

export const DEFAULT_SETTINGS = {
  currency: 'MYR',
  dateFormat: 'DD MMM YYYY',
  theme: 'light',
  budgetCycleDay: 27,
};

export const EMPTY_CUSTOM_CATEGORIES = { needs: [], wants: [], save_invest: [] };

// Wealth
export const getWealth = () => read(KEYS.WEALTH, []);
export const saveWealth = (data) => write(KEYS.WEALTH, data);

// Budget
export const getBudgetHistory = () => read(KEYS.BUDGET, []);
export const saveBudgetHistory = (data) => write(KEYS.BUDGET, data);

// Settings — merge with defaults so legacy users get new fields
export const getSettings = () => ({ ...DEFAULT_SETTINGS, ...(read(KEYS.SETTINGS, {}) || {}) });
export const saveSettings = (data) => write(KEYS.SETTINGS, data);

// Savings Goals
export const getGoals = () => read(KEYS.GOALS, []);
export const saveGoals = (data) => write(KEYS.GOALS, data);

// Custom Categories
export const getCustomCategories = () => ({ ...EMPTY_CUSTOM_CATEGORIES, ...(read(KEYS.CUSTOM_CATEGORIES, {}) || {}) });
export const saveCustomCategories = (data) => write(KEYS.CUSTOM_CATEGORIES, data);

// Onboarding
export const isOnboardingComplete = () => read(KEYS.ONBOARDING, false);
export const setOnboardingComplete = () => write(KEYS.ONBOARDING, true);

// Example data
export const isExampleDataCleared = () => read(KEYS.EXAMPLE_CLEARED, false);
export const setExampleDataCleared = () => write(KEYS.EXAMPLE_CLEARED, true);

// Clear all
export const clearAllData = () => {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
};
