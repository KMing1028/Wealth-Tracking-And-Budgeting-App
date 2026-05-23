const KEYS = {
  WEALTH: 'wealthData',
  BUDGET: 'budgetHistory',
  SETTINGS: 'appSettings',
  ONBOARDING: 'onboardingComplete',
  EXAMPLE_CLEARED: 'exampleDataCleared',
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

// Wealth
export const getWealth = () => read(KEYS.WEALTH, []);
export const saveWealth = (data) => write(KEYS.WEALTH, data);

// Budget
export const getBudgetHistory = () => read(KEYS.BUDGET, []);
export const saveBudgetHistory = (data) => write(KEYS.BUDGET, data);

// Settings
export const getSettings = () => read(KEYS.SETTINGS, { currency: 'MYR', dateFormat: 'DD MMM YYYY' });
export const saveSettings = (data) => write(KEYS.SETTINGS, data);

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
