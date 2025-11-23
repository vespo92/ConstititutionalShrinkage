import { useCallback, useEffect, RefObject } from 'react';

export type NavigationDirection = 'horizontal' | 'vertical' | 'both';

export interface UseKeyboardNavOptions {
  direction?: NavigationDirection;
  loop?: boolean;
  onSelect?: (element: HTMLElement, index: number) => void;
  onEscape?: () => void;
  selector?: string;
}

/**
 * Hook for keyboard navigation within a container
 * Supports arrow key navigation, home/end, and selection
 */
export function useKeyboardNav(
  containerRef: RefObject<HTMLElement>,
  options: UseKeyboardNavOptions = {}
): void {
  const {
    direction = 'vertical',
    loop = true,
    onSelect,
    onEscape,
    selector = '[tabindex], button, a, input',
  } = options;

  const getNavigableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(selector)
    ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
  }, [containerRef, selector]);

  const focusElement = useCallback((elements: HTMLElement[], index: number) => {
    const element = elements[index];
    if (element) {
      element.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const elements = getNavigableElements();
      if (elements.length === 0) return;

      const currentIndex = elements.indexOf(document.activeElement as HTMLElement);
      let nextIndex = currentIndex;
      let handled = false;

      switch (event.key) {
        case 'ArrowUp':
          if (direction === 'vertical' || direction === 'both') {
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) {
              nextIndex = loop ? elements.length - 1 : 0;
            }
            handled = true;
          }
          break;
        case 'ArrowDown':
          if (direction === 'vertical' || direction === 'both') {
            nextIndex = currentIndex + 1;
            if (nextIndex >= elements.length) {
              nextIndex = loop ? 0 : elements.length - 1;
            }
            handled = true;
          }
          break;
        case 'ArrowLeft':
          if (direction === 'horizontal' || direction === 'both') {
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) {
              nextIndex = loop ? elements.length - 1 : 0;
            }
            handled = true;
          }
          break;
        case 'ArrowRight':
          if (direction === 'horizontal' || direction === 'both') {
            nextIndex = currentIndex + 1;
            if (nextIndex >= elements.length) {
              nextIndex = loop ? 0 : elements.length - 1;
            }
            handled = true;
          }
          break;
        case 'Home':
          nextIndex = 0;
          handled = true;
          break;
        case 'End':
          nextIndex = elements.length - 1;
          handled = true;
          break;
        case 'Enter':
        case ' ':
          if (currentIndex >= 0 && onSelect) {
            onSelect(elements[currentIndex], currentIndex);
            handled = true;
          }
          break;
        case 'Escape':
          if (onEscape) {
            onEscape();
            handled = true;
          }
          break;
      }

      if (handled) {
        event.preventDefault();
        if (nextIndex !== currentIndex) {
          focusElement(elements, nextIndex);
        }
      }
    },
    [direction, loop, onSelect, onEscape, getNavigableElements, focusElement]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, handleKeyDown]);
}

export default useKeyboardNav;
