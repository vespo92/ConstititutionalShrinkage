import type { Locale, PluralTranslation } from '../types';

export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/**
 * Get the plural category for a count in a given locale
 * Uses Intl.PluralRules for accurate pluralization
 */
export function getPluralCategory(count: number, locale: Locale): PluralCategory {
  const rules = new Intl.PluralRules(locale);
  return rules.select(count) as PluralCategory;
}

/**
 * Select the correct plural form from a translation object
 */
export function selectPlural(
  translation: PluralTranslation,
  count: number,
  locale: Locale
): string {
  const category = getPluralCategory(count, locale);

  // Check for exact match first
  if (translation[category]) {
    return translation[category]!;
  }

  // Fall back to 'other' which is required
  return translation.other;
}

/**
 * Check if a value is a plural translation object
 */
export function isPluralTranslation(value: unknown): value is PluralTranslation {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Must have 'other' key
  if (typeof obj.other !== 'string') {
    return false;
  }

  // Check that all keys are valid plural categories
  const validKeys: PluralCategory[] = ['zero', 'one', 'two', 'few', 'many', 'other'];
  return Object.keys(obj).every((key) => validKeys.includes(key as PluralCategory));
}

/**
 * Format a count with the appropriate plural form
 */
export function formatPlural(
  translation: PluralTranslation,
  count: number,
  locale: Locale
): string {
  const form = selectPlural(translation, count, locale);
  return form.replace('{{count}}', String(count));
}

export default {
  getPluralCategory,
  selectPlural,
  isPluralTranslation,
  formatPlural,
};
