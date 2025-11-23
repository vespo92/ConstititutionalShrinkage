# @constitutional-shrinkage/a11y

Accessibility components, hooks, and utilities for the Constitutional Shrinkage platform. Ensures WCAG 2.1 AAA compliance across all applications.

## Features

- **Skip Links** - Keyboard navigation shortcuts
- **Live Regions** - Screen reader announcements
- **Focus Management** - Modal focus trapping and return
- **Visually Hidden** - Content for screen readers only
- **Accessible Icons** - Icons with proper alt text
- **Accessible Tables** - Tables with proper semantics
- **Accessible Forms** - Forms with labels and error handling

## Hooks

- `useAnnounce` - Screen reader announcements
- `useFocusReturn` - Return focus after modal close
- `useKeyboardNav` - Keyboard navigation helpers
- `useReducedMotion` - Respect motion preferences
- `useHighContrast` - High contrast mode detection
- `useFocusVisible` - Focus visible polyfill

## Usage

```tsx
import {
  SkipLinks,
  LiveRegion,
  FocusTrap,
  useAnnounce,
  useReducedMotion
} from '@constitutional-shrinkage/a11y';

function App() {
  const { announce } = useAnnounce();
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <SkipLinks />
      <main id="main-content">
        {/* Your content */}
      </main>
      <LiveRegion message="Content updated" />
    </>
  );
}
```

## WCAG 2.1 AAA Compliance

This package helps achieve:
- Color contrast ratio of 7:1 (AAA)
- Focus visible on all interactive elements
- Keyboard navigation throughout
- Screen reader compatibility
- Reduced motion support
- Target size of 44x44 pixels minimum
