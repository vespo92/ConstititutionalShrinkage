import React from 'react';
import { VisuallyHidden } from './VisuallyHidden';

export interface AccessibleIconProps {
  children: React.ReactNode;
  label: string;
  className?: string;
}

/**
 * Accessible icon wrapper that provides screen reader label
 * Use when icon conveys meaning that should be accessible
 */
export function AccessibleIcon({ children, label, className = '' }: AccessibleIconProps) {
  return (
    <span className={`accessible-icon ${className}`.trim()} role="img" aria-label={label}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ 'aria-hidden'?: boolean }>, {
            'aria-hidden': true,
          });
        }
        return child;
      })}
    </span>
  );
}

export interface DecorativeIconProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Decorative icon wrapper that hides icon from screen readers
 * Use when icon is purely decorative and adds no information
 */
export function DecorativeIcon({ children, className = '' }: DecorativeIconProps) {
  return (
    <span className={`decorative-icon ${className}`.trim()} aria-hidden="true">
      {children}
    </span>
  );
}

export default AccessibleIcon;
