import { useState, useCallback, useEffect } from 'react';

let hadKeyboardEvent = false;
let hadFocusVisibleRecently = false;
let hadFocusVisibleRecentlyTimeout: ReturnType<typeof setTimeout> | null = null;

const inputTypesWhitelist: Record<string, boolean> = {
  text: true,
  search: true,
  url: true,
  tel: true,
  email: true,
  password: true,
  number: true,
  date: true,
  month: true,
  week: true,
  time: true,
  datetime: true,
  'datetime-local': true,
};

/**
 * Determines if focus should be visible based on input modality
 */
function focusTriggersKeyboardModality(el: Element): boolean {
  const type = (el as HTMLInputElement).type;
  const tagName = el.tagName;

  if (tagName === 'INPUT' && inputTypesWhitelist[type] && !(el as HTMLInputElement).readOnly) {
    return true;
  }

  if (tagName === 'TEXTAREA' && !(el as HTMLTextAreaElement).readOnly) {
    return true;
  }

  if ((el as HTMLElement).isContentEditable) {
    return true;
  }

  return false;
}

/**
 * Setup global keyboard/pointer event tracking
 */
function setupListeners(): void {
  if (typeof document === 'undefined') return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.altKey || e.ctrlKey) return;
    hadKeyboardEvent = true;
  };

  const handlePointerDown = () => {
    hadKeyboardEvent = false;
  };

  const handleFocus = (e: FocusEvent) => {
    if (!e.target) return;

    const target = e.target as Element;
    if (hadKeyboardEvent || focusTriggersKeyboardModality(target)) {
      target.setAttribute('data-focus-visible', 'true');
    }
  };

  const handleBlur = (e: FocusEvent) => {
    if (!e.target) return;

    const target = e.target as Element;
    if (target.hasAttribute('data-focus-visible')) {
      hadFocusVisibleRecently = true;
      if (hadFocusVisibleRecentlyTimeout) {
        clearTimeout(hadFocusVisibleRecentlyTimeout);
      }
      hadFocusVisibleRecentlyTimeout = setTimeout(() => {
        hadFocusVisibleRecently = false;
      }, 100);
      target.removeAttribute('data-focus-visible');
    }
  };

  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('mousedown', handlePointerDown, true);
  document.addEventListener('pointerdown', handlePointerDown, true);
  document.addEventListener('touchstart', handlePointerDown, true);
  document.addEventListener('focus', handleFocus, true);
  document.addEventListener('blur', handleBlur, true);
}

// Initialize listeners
if (typeof document !== 'undefined') {
  setupListeners();
}

/**
 * Hook for focus-visible polyfill
 * Returns whether focus should be visually indicated
 */
export function useFocusVisible(): {
  isFocusVisible: boolean;
  focusProps: {
    onFocus: () => void;
    onBlur: () => void;
  };
} {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  const onFocus = useCallback(() => {
    if (hadKeyboardEvent) {
      setIsFocusVisible(true);
    }
  }, []);

  const onBlur = useCallback(() => {
    setIsFocusVisible(false);
  }, []);

  return {
    isFocusVisible,
    focusProps: {
      onFocus,
      onBlur,
    },
  };
}

/**
 * Hook for tracking focus-visible state on a specific element
 */
export function useFocusVisibleWithin(): boolean {
  const [hasFocusVisibleWithin, setHasFocusVisibleWithin] = useState(false);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as Element;
      if (target?.hasAttribute('data-focus-visible')) {
        setHasFocusVisibleWithin(true);
      }
    };

    const handleFocusOut = () => {
      setHasFocusVisibleWithin(false);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return hasFocusVisibleWithin;
}

export default useFocusVisible;
