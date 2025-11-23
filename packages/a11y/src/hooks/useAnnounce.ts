import { useCallback, useRef } from 'react';

export type AnnouncementPriority = 'polite' | 'assertive';

export interface UseAnnounceReturn {
  announce: (message: string, priority?: AnnouncementPriority) => void;
  clear: () => void;
}

/**
 * Hook for making screen reader announcements
 * Creates a live region and announces messages to screen readers
 */
export function useAnnounce(): UseAnnounceReturn {
  const politeRegion = useRef<HTMLDivElement | null>(null);
  const assertiveRegion = useRef<HTMLDivElement | null>(null);

  const getOrCreateRegion = useCallback(
    (priority: AnnouncementPriority): HTMLDivElement => {
      const ref = priority === 'polite' ? politeRegion : assertiveRegion;
      const regionId = `a11y-announce-${priority}`;

      if (!ref.current) {
        let region = document.getElementById(regionId) as HTMLDivElement | null;

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

        ref.current = region;
      }

      return ref.current;
    },
    []
  );

  const announce = useCallback(
    (message: string, priority: AnnouncementPriority = 'polite') => {
      const region = getOrCreateRegion(priority);

      // Clear and reset to trigger announcement
      region.textContent = '';

      // Use requestAnimationFrame to ensure the clear is processed
      requestAnimationFrame(() => {
        region.textContent = message;
      });
    },
    [getOrCreateRegion]
  );

  const clear = useCallback(() => {
    if (politeRegion.current) {
      politeRegion.current.textContent = '';
    }
    if (assertiveRegion.current) {
      assertiveRegion.current.textContent = '';
    }
  }, []);

  return { announce, clear };
}

export default useAnnounce;
