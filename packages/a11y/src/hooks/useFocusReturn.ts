import { useEffect, useRef, useCallback } from 'react';

export interface UseFocusReturnOptions {
  disabled?: boolean;
  onFocusReturn?: (element: HTMLElement) => void;
}

export interface UseFocusReturnReturn {
  setReturnFocus: () => void;
  returnFocus: () => void;
}

/**
 * Hook for returning focus to previous element after modal/dialog closes
 * Stores the previously focused element and returns focus when called
 */
export function useFocusReturn(options: UseFocusReturnOptions = {}): UseFocusReturnReturn {
  const { disabled = false, onFocusReturn } = options;
  const previousElement = useRef<HTMLElement | null>(null);

  const setReturnFocus = useCallback(() => {
    if (disabled) return;
    previousElement.current = document.activeElement as HTMLElement;
  }, [disabled]);

  const returnFocus = useCallback(() => {
    if (disabled) return;

    const element = previousElement.current;
    if (element && typeof element.focus === 'function') {
      element.focus();
      onFocusReturn?.(element);
    }

    previousElement.current = null;
  }, [disabled, onFocusReturn]);

  // Automatically set return focus on mount
  useEffect(() => {
    setReturnFocus();
  }, [setReturnFocus]);

  return { setReturnFocus, returnFocus };
}

/**
 * Hook that automatically captures and returns focus on unmount
 * Useful for modals and dialogs
 */
export function useFocusReturnOnUnmount(options: UseFocusReturnOptions = {}): void {
  const { returnFocus } = useFocusReturn(options);

  useEffect(() => {
    return () => {
      returnFocus();
    };
  }, [returnFocus]);
}

export default useFocusReturn;
