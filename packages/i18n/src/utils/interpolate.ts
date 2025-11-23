import type { TranslationValues } from '../types';

/**
 * Interpolate variables in a translation string
 * Supports {{variable}} syntax
 */
export function interpolate(template: string, values: TranslationValues = {}): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = values[key];
    if (value === undefined) {
      console.warn(`Missing interpolation value for key: ${key}`);
      return match;
    }
    return String(value);
  });
}

/**
 * Check if a string contains interpolation placeholders
 */
export function hasInterpolation(template: string): boolean {
  return /\{\{\w+\}\}/.test(template);
}

/**
 * Extract variable names from a template
 */
export function extractVariables(template: string): string[] {
  const matches = template.matchAll(/\{\{(\w+)\}\}/g);
  return Array.from(matches, (m) => m[1]);
}

/**
 * Validate that all required variables are provided
 */
export function validateInterpolation(
  template: string,
  values: TranslationValues
): { valid: boolean; missing: string[] } {
  const required = extractVariables(template);
  const provided = Object.keys(values);
  const missing = required.filter((key) => !provided.includes(key));

  return {
    valid: missing.length === 0,
    missing,
  };
}

export default interpolate;
