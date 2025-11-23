import { useState, useEffect } from 'react';

const HIGH_CONTRAST_QUERY = '(prefers-contrast: more)';
const FORCED_COLORS_QUERY = '(forced-colors: active)';

export interface ContrastPreferences {
  prefersHighContrast: boolean;
  forcedColors: boolean;
  isHighContrastMode: boolean;
}

/**
 * Hook to detect user's high contrast preference
 * Detects both prefers-contrast and forced-colors (Windows High Contrast Mode)
 */
export function useHighContrast(): ContrastPreferences {
  const [preferences, setPreferences] = useState<ContrastPreferences>(() => {
    if (typeof window === 'undefined') {
      return {
        prefersHighContrast: false,
        forcedColors: false,
        isHighContrastMode: false,
      };
    }

    const prefersHighContrast = window.matchMedia(HIGH_CONTRAST_QUERY).matches;
    const forcedColors = window.matchMedia(FORCED_COLORS_QUERY).matches;

    return {
      prefersHighContrast,
      forcedColors,
      isHighContrastMode: prefersHighContrast || forcedColors,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const highContrastQuery = window.matchMedia(HIGH_CONTRAST_QUERY);
    const forcedColorsQuery = window.matchMedia(FORCED_COLORS_QUERY);

    const updatePreferences = () => {
      const prefersHighContrast = highContrastQuery.matches;
      const forcedColors = forcedColorsQuery.matches;

      setPreferences({
        prefersHighContrast,
        forcedColors,
        isHighContrastMode: prefersHighContrast || forcedColors,
      });
    };

    const handleHighContrastChange = () => updatePreferences();
    const handleForcedColorsChange = () => updatePreferences();

    if (highContrastQuery.addEventListener) {
      highContrastQuery.addEventListener('change', handleHighContrastChange);
      forcedColorsQuery.addEventListener('change', handleForcedColorsChange);
    } else {
      highContrastQuery.addListener(handleHighContrastChange);
      forcedColorsQuery.addListener(handleForcedColorsChange);
    }

    return () => {
      if (highContrastQuery.removeEventListener) {
        highContrastQuery.removeEventListener('change', handleHighContrastChange);
        forcedColorsQuery.removeEventListener('change', handleForcedColorsChange);
      } else {
        highContrastQuery.removeListener(handleHighContrastChange);
        forcedColorsQuery.removeListener(handleForcedColorsChange);
      }
    };
  }, []);

  return preferences;
}

/**
 * Simple hook that returns just the boolean for high contrast mode
 */
export function usePrefersHighContrast(): boolean {
  const { isHighContrastMode } = useHighContrast();
  return isHighContrastMode;
}

export default useHighContrast;
