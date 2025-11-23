export type Locale = 'en' | 'es' | 'zh';

export type Direction = 'ltr' | 'rtl';

export type TranslationNamespace =
  | 'common'
  | 'voting'
  | 'bills'
  | 'delegation'
  | 'auth'
  | 'errors';

export interface TranslationValues {
  [key: string]: string | number | boolean | undefined;
}

export interface PluralTranslation {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

export type TranslationValue = string | PluralTranslation | NestedTranslations;

export interface NestedTranslations {
  [key: string]: TranslationValue;
}

export interface TranslationResource {
  [namespace: string]: NestedTranslations;
}

export interface LocaleConfig {
  locale: Locale;
  direction: Direction;
  displayName: string;
  nativeName: string;
  dateFormat: Intl.DateTimeFormatOptions;
  numberFormat: Intl.NumberFormatOptions;
  currencyFormat: Intl.NumberFormatOptions;
}

export const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
  en: {
    locale: 'en',
    direction: 'ltr',
    displayName: 'English',
    nativeName: 'English',
    dateFormat: { year: 'numeric', month: 'long', day: 'numeric' },
    numberFormat: { style: 'decimal' },
    currencyFormat: { style: 'currency', currency: 'USD' },
  },
  es: {
    locale: 'es',
    direction: 'ltr',
    displayName: 'Spanish',
    nativeName: 'Español',
    dateFormat: { year: 'numeric', month: 'long', day: 'numeric' },
    numberFormat: { style: 'decimal' },
    currencyFormat: { style: 'currency', currency: 'USD' },
  },
  zh: {
    locale: 'zh',
    direction: 'ltr',
    displayName: 'Chinese',
    nativeName: '中文',
    dateFormat: { year: 'numeric', month: 'long', day: 'numeric' },
    numberFormat: { style: 'decimal' },
    currencyFormat: { style: 'currency', currency: 'CNY' },
  },
};

export const SUPPORTED_LOCALES: Locale[] = ['en', 'es', 'zh'];

export const DEFAULT_LOCALE: Locale = 'en';

export function isValidLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}
