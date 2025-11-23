import React from 'react';

export interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
  role?: 'status' | 'alert' | 'log';
  className?: string;
}

/**
 * Live region component for screen reader announcements
 * Polite: waits for current speech to finish
 * Assertive: interrupts current speech
 */
export function LiveRegion({
  message,
  priority = 'polite',
  atomic = true,
  role = 'status',
  className = '',
}: LiveRegionProps) {
  return (
    <div
      role={role}
      aria-live={priority}
      aria-atomic={atomic}
      className={`visually-hidden ${className}`.trim()}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {message}
    </div>
  );
}

export default LiveRegion;
