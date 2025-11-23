import { useMemo } from 'react';
import { useI18n } from '../provider/I18nProvider';
import type { Direction } from '../types';

export interface UseDirectionReturn {
  direction: Direction;
  isRTL: boolean;
  isLTR: boolean;
  align: (ltr: string, rtl: string) => string;
  marginStart: string;
  marginEnd: string;
  paddingStart: string;
  paddingEnd: string;
  borderStart: string;
  borderEnd: string;
}

/**
 * Hook for direction-aware styling utilities
 */
export function useDirection(): UseDirectionReturn {
  const { direction } = useI18n();

  return useMemo(() => {
    const isRTL = direction === 'rtl';
    const isLTR = direction === 'ltr';

    return {
      direction,
      isRTL,
      isLTR,
      align: (ltr: string, rtl: string) => (isRTL ? rtl : ltr),
      marginStart: isRTL ? 'marginRight' : 'marginLeft',
      marginEnd: isRTL ? 'marginLeft' : 'marginRight',
      paddingStart: isRTL ? 'paddingRight' : 'paddingLeft',
      paddingEnd: isRTL ? 'paddingLeft' : 'paddingRight',
      borderStart: isRTL ? 'borderRight' : 'borderLeft',
      borderEnd: isRTL ? 'borderLeft' : 'borderRight',
    };
  }, [direction]);
}

/**
 * Get logical CSS properties for direction-aware styling
 */
export function getLogicalProperties(isRTL: boolean) {
  return {
    inlineStart: isRTL ? 'right' : 'left',
    inlineEnd: isRTL ? 'left' : 'right',
    textAlign: isRTL ? 'right' : 'left',
  };
}

export default useDirection;
