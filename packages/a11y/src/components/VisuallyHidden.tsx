import React from 'react';

export interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  focusable?: boolean;
  className?: string;
}

const visuallyHiddenStyles: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const focusableStyles: React.CSSProperties = {
  position: 'static',
  width: 'auto',
  height: 'auto',
  padding: 'inherit',
  margin: 'inherit',
  overflow: 'visible',
  clip: 'auto',
  whiteSpace: 'normal',
};

/**
 * Visually hidden component for screen reader only content
 * Content is hidden visually but accessible to screen readers
 */
export function VisuallyHidden({
  children,
  as: Component = 'span',
  focusable = false,
  className = '',
}: VisuallyHiddenProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  const styles = focusable && isFocused ? focusableStyles : visuallyHiddenStyles;

  return React.createElement(
    Component,
    {
      className: `visually-hidden ${className}`.trim(),
      style: styles,
      onFocus: focusable ? () => setIsFocused(true) : undefined,
      onBlur: focusable ? () => setIsFocused(false) : undefined,
    },
    children
  );
}

export default VisuallyHidden;
