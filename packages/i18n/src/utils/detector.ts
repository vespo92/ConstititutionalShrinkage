import { type Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE, isValidLocale } from '../types';

export interface DetectorOptions {
  order?: DetectionSource[];
  lookupQuerystring?: string;
  lookupLocalStorage?: string;
  lookupSessionStorage?: string;
  lookupCookie?: string;
  caches?: CacheType[];
}

export type DetectionSource =
  | 'querystring'
  | 'localStorage'
  | 'sessionStorage'
  | 'cookie'
  | 'navigator'
  | 'htmlTag';

export type CacheType = 'localStorage' | 'sessionStorage' | 'cookie';

const DEFAULT_OPTIONS: DetectorOptions = {
  order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
  lookupQuerystring: 'lang',
  lookupLocalStorage: 'i18n-locale',
  lookupSessionStorage: 'i18n-locale',
  lookupCookie: 'i18n-locale',
  caches: ['localStorage'],
};

/**
 * Detect user's preferred locale from various sources
 */
export function detectLocale(options: DetectorOptions = {}): Locale {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  for (const source of opts.order || []) {
    const detected = detectFromSource(source, opts);
    if (detected && isValidLocale(detected)) {
      return detected;
    }
  }

  return DEFAULT_LOCALE;
}

function detectFromSource(source: DetectionSource, options: DetectorOptions): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  switch (source) {
    case 'querystring':
      return detectFromQuerystring(options.lookupQuerystring || 'lang');

    case 'localStorage':
      return detectFromStorage('localStorage', options.lookupLocalStorage || 'i18n-locale');

    case 'sessionStorage':
      return detectFromStorage('sessionStorage', options.lookupSessionStorage || 'i18n-locale');

    case 'cookie':
      return detectFromCookie(options.lookupCookie || 'i18n-locale');

    case 'navigator':
      return detectFromNavigator();

    case 'htmlTag':
      return detectFromHtmlTag();

    default:
      return null;
  }
}

function detectFromQuerystring(key: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function detectFromStorage(
  type: 'localStorage' | 'sessionStorage',
  key: string
): string | null {
  try {
    const storage = type === 'localStorage' ? window.localStorage : window.sessionStorage;
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function detectFromCookie(key: string): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === key) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

function detectFromNavigator(): string | null {
  const languages = navigator.languages || [navigator.language];

  for (const lang of languages) {
    // Try exact match first
    const exact = lang.toLowerCase();
    if (isValidLocale(exact)) {
      return exact;
    }

    // Try language code without region
    const short = lang.split('-')[0].toLowerCase();
    if (isValidLocale(short)) {
      return short;
    }
  }

  return null;
}

function detectFromHtmlTag(): string | null {
  const lang = document.documentElement.getAttribute('lang');
  if (lang) {
    const short = lang.split('-')[0].toLowerCase();
    if (isValidLocale(short)) {
      return short;
    }
  }
  return null;
}

/**
 * Cache the locale in the specified storage
 */
export function cacheLocale(locale: Locale, options: DetectorOptions = {}): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  for (const cache of opts.caches || []) {
    switch (cache) {
      case 'localStorage':
        try {
          window.localStorage.setItem(opts.lookupLocalStorage || 'i18n-locale', locale);
        } catch {
          // Storage not available
        }
        break;

      case 'sessionStorage':
        try {
          window.sessionStorage.setItem(opts.lookupSessionStorage || 'i18n-locale', locale);
        } catch {
          // Storage not available
        }
        break;

      case 'cookie':
        document.cookie = `${opts.lookupCookie || 'i18n-locale'}=${locale};path=/;max-age=31536000`;
        break;
    }
  }
}

export default {
  detectLocale,
  cacheLocale,
};
