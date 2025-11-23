import React from 'react';

export interface SkipLink {
  href: string;
  label: string;
}

export interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#main-nav', label: 'Skip to navigation' },
  { href: '#search', label: 'Skip to search' },
];

/**
 * Skip links component for keyboard users to bypass navigation
 * Visible only on focus for keyboard users
 */
export function SkipLinks({ links = defaultLinks, className = '' }: SkipLinksProps) {
  return (
    <nav aria-label="Skip links" className={`skip-links ${className}`.trim()}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="skip-link"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 'auto',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
          onFocus={(e) => {
            e.currentTarget.style.position = 'fixed';
            e.currentTarget.style.left = '10px';
            e.currentTarget.style.top = '10px';
            e.currentTarget.style.width = 'auto';
            e.currentTarget.style.height = 'auto';
            e.currentTarget.style.overflow = 'visible';
            e.currentTarget.style.zIndex = '9999';
            e.currentTarget.style.padding = '8px 16px';
            e.currentTarget.style.backgroundColor = '#000';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.textDecoration = 'none';
            e.currentTarget.style.borderRadius = '4px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.position = 'absolute';
            e.currentTarget.style.left = '-9999px';
            e.currentTarget.style.width = '1px';
            e.currentTarget.style.height = '1px';
            e.currentTarget.style.overflow = 'hidden';
          }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

export default SkipLinks;
