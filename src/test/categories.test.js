import { describe, it, expect } from 'vitest';
import {
  PREDEFINED_CATEGORIES,
  getAllCategories,
  getCategoryIcon,
  validateCategoryName,
  addCustomCategory,
  deleteCustomCategory,
  updateCustomCategory,
} from '../utils/categories';

const empty = { needs: [], wants: [], save_invest: [] };

describe('getAllCategories', () => {
  it('returns predefined when no custom', () => {
    const cats = getAllCategories(empty, 'needs');
    expect(cats.length).toBe(PREDEFINED_CATEGORIES.needs.length);
    expect(cats.every(c => c.isCustom === false)).toBe(true);
  });

  it('combines predefined and custom', () => {
    const custom = { needs: [{ id: 'c1', name: 'Pet', icon: '🐕' }], wants: [], save_invest: [] };
    const cats = getAllCategories(custom, 'needs');
    expect(cats.length).toBe(PREDEFINED_CATEGORIES.needs.length + 1);
    expect(cats[cats.length - 1].isCustom).toBe(true);
  });
});

describe('getCategoryIcon', () => {
  it('returns predefined icon', () => {
    expect(getCategoryIcon('Housing', empty)).toBe('🏠');
  });

  it('returns custom icon if found', () => {
    const custom = { needs: [{ id: 'c1', name: 'Pet Care', icon: '🐕' }], wants: [], save_invest: [] };
    expect(getCategoryIcon('Pet Care', custom)).toBe('🐕');
  });

  it('falls back to default for unknown', () => {
    expect(getCategoryIcon('Unknown', empty)).toBe('💰');
  });
});

describe('validateCategoryName', () => {
  it('rejects empty name', () => {
    expect(validateCategoryName('', 'needs', empty)).toBeTruthy();
    expect(validateCategoryName('   ', 'needs', empty)).toBeTruthy();
  });

  it('rejects name longer than 50 chars', () => {
    expect(validateCategoryName('x'.repeat(51), 'needs', empty)).toBeTruthy();
  });

  it('rejects duplicate of predefined', () => {
    expect(validateCategoryName('Housing', 'needs', empty)).toBeTruthy();
  });

  it('rejects duplicate of custom (case insensitive)', () => {
    const custom = { needs: [{ id: 'c1', name: 'Pet Care', icon: '🐕' }], wants: [], save_invest: [] };
    expect(validateCategoryName('pet care', 'needs', custom)).toBeTruthy();
  });

  it('accepts valid unique name', () => {
    expect(validateCategoryName('Gardening', 'needs', empty)).toBeNull();
  });
});

describe('addCustomCategory', () => {
  it('adds new category to specified bucket', () => {
    const result = addCustomCategory(empty, 'needs', 'Gardening', '🌱');
    expect(result.needs.length).toBe(1);
    expect(result.needs[0].name).toBe('Gardening');
    expect(result.needs[0].icon).toBe('🌱');
  });

  it('uses default icon when not provided', () => {
    const result = addCustomCategory(empty, 'needs', 'Pet');
    expect(result.needs[0].icon).toBe('🏷️');
  });

  it('does not mutate input', () => {
    const result = addCustomCategory(empty, 'needs', 'Gardening', '🌱');
    expect(empty.needs.length).toBe(0);
    expect(result).not.toBe(empty);
  });
});

describe('deleteCustomCategory', () => {
  it('removes category by id', () => {
    const state = { needs: [{ id: 'c1', name: 'Pet' }, { id: 'c2', name: 'Garden' }], wants: [], save_invest: [] };
    const result = deleteCustomCategory(state, 'needs', 'c1');
    expect(result.needs.length).toBe(1);
    expect(result.needs[0].id).toBe('c2');
  });

  it('returns unchanged if id not found', () => {
    const state = { needs: [{ id: 'c1', name: 'Pet' }], wants: [], save_invest: [] };
    const result = deleteCustomCategory(state, 'needs', 'nonexistent');
    expect(result.needs.length).toBe(1);
  });
});

describe('updateCustomCategory', () => {
  it('updates fields by id', () => {
    const state = { needs: [{ id: 'c1', name: 'Pet', icon: '🐕' }], wants: [], save_invest: [] };
    const result = updateCustomCategory(state, 'needs', 'c1', { name: 'Pet Care' });
    expect(result.needs[0].name).toBe('Pet Care');
    expect(result.needs[0].icon).toBe('🐕');
  });
});
