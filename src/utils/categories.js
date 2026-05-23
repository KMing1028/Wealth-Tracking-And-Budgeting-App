// Predefined categories — cannot be deleted
export const PREDEFINED_CATEGORIES = {
  needs: [
    { id: 'housing', name: 'Housing', icon: '🏠' },
    { id: 'utilities', name: 'Utilities', icon: '💡' },
    { id: 'transportation', name: 'Transportation', icon: '🚗' },
    { id: 'groceries', name: 'Groceries & Food', icon: '🛒' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️' },
    { id: 'education', name: 'Education', icon: '📚' },
  ],
  wants: [
    { id: 'dining', name: 'Dining Out & Entertainment', icon: '🍽️' },
    { id: 'shopping', name: 'Shopping & Personal Care', icon: '🛍️' },
    { id: 'subscriptions', name: 'Subscriptions', icon: '📺' },
    { id: 'travel', name: 'Travel & Leisure', icon: '✈️' },
    { id: 'hobbies', name: 'Hobbies & Recreation', icon: '🎮' },
  ],
  save_invest: [
    { id: 'emergency', name: 'Emergency Fund Top-ups', icon: '🏦' },
    { id: 'stocks', name: 'Stock Market Investments', icon: '📈' },
    { id: 'retirement', name: 'Retirement Account Contributions', icon: '🎯' },
    { id: 'crypto', name: 'Crypto/Alternative Investments', icon: '🪙' },
    { id: 'goals', name: 'Savings Goals', icon: '💰' },
  ],
};

export function getAllCategories(customCategories, bucket) {
  const predef = PREDEFINED_CATEGORIES[bucket].map(c => ({ ...c, isCustom: false }));
  const custom = (customCategories[bucket] || []).map(c => ({ ...c, isCustom: true }));
  return [...predef, ...custom];
}

export function getCategoryIcon(name, customCategories) {
  for (const bucket of ['needs', 'wants', 'save_invest']) {
    const all = getAllCategories(customCategories, bucket);
    const found = all.find(c => c.name === name);
    if (found) return found.icon || '💰';
  }
  return '💰';
}

export function validateCategoryName(name, bucket, customCategories) {
  const trimmed = name.trim();
  if (!trimmed) return 'Category name is required';
  if (trimmed.length > 50) return 'Name must be 50 characters or fewer';
  const all = getAllCategories(customCategories, bucket);
  if (all.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
    return 'A category with this name already exists';
  }
  return null;
}

export function addCustomCategory(customCategories, bucket, name, icon) {
  const trimmed = name.trim();
  const newCat = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: trimmed,
    icon: icon || '🏷️',
  };
  return {
    ...customCategories,
    [bucket]: [...(customCategories[bucket] || []), newCat],
  };
}

export function deleteCustomCategory(customCategories, bucket, id) {
  return {
    ...customCategories,
    [bucket]: (customCategories[bucket] || []).filter(c => c.id !== id),
  };
}

export function updateCustomCategory(customCategories, bucket, id, updates) {
  return {
    ...customCategories,
    [bucket]: (customCategories[bucket] || []).map(c => c.id === id ? { ...c, ...updates } : c),
  };
}
