import { useCallback, useMemo } from 'react';
import { useI18n } from '../provider/I18nProvider';
import type { TranslationValues, TranslationNamespace } from '../types';

export interface UseTranslationReturn {
  t: (key: string, values?: TranslationValues) => string;
  locale: string;
}

/**
 * Hook for translations with optional namespace
 */
export function useTranslation(namespace?: TranslationNamespace): UseTranslationReturn {
  const { t: translate, locale } = useI18n();

  const t = useCallback(
    (key: string, values?: TranslationValues): string => {
      // If namespace is provided and key doesn't already have a namespace, prepend it
      const fullKey = namespace && !key.includes('.') ? `${namespace}.${key}` : key;
      return translate(fullKey, values);
    },
    [translate, namespace]
  );

  return useMemo(
    () => ({
      t,
      locale,
    }),
    [t, locale]
  );
}

export default useTranslation;
