import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface A11yPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'x-large';
  screenReaderAnnouncements: boolean;
}

export interface A11yContextValue {
  preferences: A11yPreferences;
  updatePreference: <K extends keyof A11yPreferences>(
    key: K,
    value: A11yPreferences[K]
  ) => void;
  resetPreferences: () => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const defaultPreferences: A11yPreferences = {
  reducedMotion: false,
  highContrast: false,
  fontSize: 'normal',
  screenReaderAnnouncements: true,
};

const A11yContext = createContext<A11yContextValue | null>(null);

export interface A11yProviderProps {
  children: React.ReactNode;
  initialPreferences?: Partial<A11yPreferences>;
  onPreferencesChange?: (preferences: A11yPreferences) => void;
}

/**
 * Provider for accessibility preferences and utilities
 */
export function A11yProvider({
  children,
  initialPreferences = {},
  onPreferencesChange,
}: A11yProviderProps) {
  const [preferences, setPreferences] = useState<A11yPreferences>({
    ...defaultPreferences,
    ...initialPreferences,
  });

  const updatePreference = useCallback(
    <K extends keyof A11yPreferences>(key: K, value: A11yPreferences[K]) => {
      setPreferences((prev) => {
        const next = { ...prev, [key]: value };
        onPreferencesChange?.(next);
        return next;
      });
    },
    [onPreferencesChange]
  );

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    onPreferencesChange?.(defaultPreferences);
  }, [onPreferencesChange]);

  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!preferences.screenReaderAnnouncements) return;

      const regionId = `a11y-announce-${priority}`;
      let region = document.getElementById(regionId);

      if (!region) {
        region = document.createElement('div');
        region.id = regionId;
        region.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
        region.setAttribute('aria-live', priority);
        region.setAttribute('aria-atomic', 'true');
        Object.assign(region.style, {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        });
        document.body.appendChild(region);
      }

      region.textContent = '';
      requestAnimationFrame(() => {
        region!.textContent = message;
      });
    },
    [preferences.screenReaderAnnouncements]
  );

  const value = useMemo<A11yContextValue>(
    () => ({
      preferences,
      updatePreference,
      resetPreferences,
      announce,
    }),
    [preferences, updatePreference, resetPreferences, announce]
  );

  return (
    <A11yContext.Provider value={value}>
      <div
        data-a11y-reduced-motion={preferences.reducedMotion}
        data-a11y-high-contrast={preferences.highContrast}
        data-a11y-font-size={preferences.fontSize}
      >
        {children}
      </div>
    </A11yContext.Provider>
  );
}

/**
 * Hook to access accessibility context
 */
export function useA11y(): A11yContextValue {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used within an A11yProvider');
  }
  return context;
}

/**
 * Hook to access just the preferences
 */
export function useA11yPreferences(): A11yPreferences {
  const { preferences } = useA11y();
  return preferences;
}

export default A11yContext;
