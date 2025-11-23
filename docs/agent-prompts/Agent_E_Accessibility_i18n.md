# Agent_E: Accessibility & Internationalization

## Mission
Ensure the Constitutional Shrinkage platform is accessible to ALL citizens regardless of ability, language, or technology access. Implement WCAG 2.1 AAA compliance, multi-language support, and inclusive design patterns.

## Branch
```
claude/agent-E-accessibility-i18n-{session-id}
```

## Priority: CRITICAL

## Context
Government systems MUST be accessible to everyone:
- Vision impaired users (screen readers, high contrast)
- Hearing impaired users (captions, visual alerts)
- Motor impaired users (keyboard navigation, large targets)
- Cognitive accessibility (plain language, consistent UI)
- Multiple languages (initially English, Spanish, Chinese)
- Low bandwidth / older devices
- Public terminal compatibility

## Target Directories
```
packages/a11y/
packages/i18n/
apps/*/          (updates to all apps)
```

## Your Deliverables

### 1. Accessibility Package

```
packages/a11y/
├── src/
│   ├── components/
│   │   ├── SkipLinks.tsx           # Skip to main content
│   │   ├── LiveRegion.tsx          # Announcements
│   │   ├── FocusTrap.tsx           # Modal focus management
│   │   ├── VisuallyHidden.tsx      # Screen reader only
│   │   ├── AccessibleIcon.tsx      # Icon with alt text
│   │   ├── AccessibleTable.tsx     # Proper table semantics
│   │   └── AccessibleForm.tsx      # Form with labels/errors
│   ├── hooks/
│   │   ├── useAnnounce.ts          # Screen reader announcements
│   │   ├── useFocusReturn.ts       # Return focus after modal
│   │   ├── useKeyboardNav.ts       # Keyboard navigation
│   │   ├── useReducedMotion.ts     # Respect motion preferences
│   │   ├── useHighContrast.ts      # High contrast detection
│   │   └── useFocusVisible.ts      # Focus visible polyfill
│   ├── utils/
│   │   ├── a11y-testing.ts         # Testing utilities
│   │   ├── color-contrast.ts       # Contrast checking
│   │   └── aria-helpers.ts         # ARIA utilities
│   ├── context/
│   │   └── A11yContext.tsx         # Accessibility preferences
│   └── index.ts
├── package.json
└── tsconfig.json
```

#### Accessibility Components
```typescript
// SkipLinks component for keyboard users
export function SkipLinks() {
  return (
    <nav aria-label="Skip links" className="skip-links">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#main-nav" className="skip-link">
        Skip to navigation
      </a>
      <a href="#search" className="skip-link">
        Skip to search
      </a>
    </nav>
  );
}

// LiveRegion for dynamic announcements
export function LiveRegion({
  message,
  priority = 'polite'
}: {
  message: string;
  priority?: 'polite' | 'assertive';
}) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="visually-hidden"
    >
      {message}
    </div>
  );
}

// Accessible voting confirmation
export function VoteConfirmation({ choice }: { choice: string }) {
  const { announce } = useAnnounce();

  useEffect(() => {
    announce(`Vote cast successfully. You voted ${choice}.`, 'assertive');
  }, [choice, announce]);

  return (
    <div role="alert" aria-live="assertive">
      <h2>Vote Confirmed</h2>
      <p>Your vote of <strong>{choice}</strong> has been recorded.</p>
    </div>
  );
}
```

### 2. Internationalization Package

```
packages/i18n/
├── src/
│   ├── provider/
│   │   └── I18nProvider.tsx        # React context provider
│   ├── hooks/
│   │   ├── useTranslation.ts       # Translation hook
│   │   ├── useLocale.ts            # Current locale
│   │   ├── useFormatters.ts        # Date/number formatters
│   │   └── useDirection.ts         # RTL support
│   ├── utils/
│   │   ├── plural.ts               # Pluralization rules
│   │   ├── interpolate.ts          # Variable interpolation
│   │   └── detector.ts             # Locale detection
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── voting.json
│   │   ├── bills.json
│   │   ├── delegation.json
│   │   ├── auth.json
│   │   └── errors.json
│   ├── es/
│   │   ├── common.json
│   │   ├── voting.json
│   │   ├── bills.json
│   │   ├── delegation.json
│   │   ├── auth.json
│   │   └── errors.json
│   └── zh/
│       ├── common.json
│       ├── voting.json
│       ├── bills.json
│       ├── delegation.json
│       ├── auth.json
│       └── errors.json
├── package.json
└── tsconfig.json
```

#### Translation Example
```json
// locales/en/voting.json
{
  "vote": {
    "title": "Cast Your Vote",
    "choices": {
      "yes": "Yes, I support this bill",
      "no": "No, I oppose this bill",
      "abstain": "Abstain from voting"
    },
    "confirm": {
      "title": "Confirm Your Vote",
      "message": "You are about to vote {{choice}} on {{billTitle}}. This action cannot be undone until voting closes.",
      "button": "Confirm Vote"
    },
    "success": {
      "title": "Vote Recorded",
      "message": "Your vote has been securely recorded. You can verify it anytime.",
      "viewReceipt": "View Receipt"
    },
    "delegation": {
      "notice": "Your vote will be cast by {{delegateName}} on your behalf.",
      "override": "Vote Directly Instead"
    },
    "deadline": {
      "remaining": "{{days}} days, {{hours}} hours remaining",
      "ending_soon": "Voting ends in {{hours}} hours",
      "ended": "Voting has ended"
    }
  }
}

// locales/es/voting.json
{
  "vote": {
    "title": "Emitir Su Voto",
    "choices": {
      "yes": "Sí, apoyo este proyecto de ley",
      "no": "No, me opongo a este proyecto de ley",
      "abstain": "Abstenerme de votar"
    },
    "confirm": {
      "title": "Confirmar Su Voto",
      "message": "Está a punto de votar {{choice}} en {{billTitle}}. Esta acción no se puede deshacer hasta que cierre la votación.",
      "button": "Confirmar Voto"
    }
    // ... etc
  }
}
```

### 3. WCAG 2.1 AAA Compliance Checklist

```typescript
// a11y-testing.ts - Automated a11y testing utilities

import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

export async function checkA11y(container: HTMLElement) {
  const results = await axe(container, {
    rules: {
      // WCAG 2.1 AAA rules
      'color-contrast-enhanced': { enabled: true },
      'focus-visible': { enabled: true },
      'target-size': { enabled: true },
    }
  });

  return {
    violations: results.violations,
    passes: results.passes,
    score: calculateA11yScore(results)
  };
}

// Contrast checker
export function checkContrast(foreground: string, background: string): {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
} {
  const ratio = calculateContrastRatio(foreground, background);
  return {
    ratio,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7.0
  };
}
```

### 4. Accessible Design Patterns

#### Accessible Voting Interface
```typescript
// Keyboard-navigable voting with screen reader support
export function VotingInterface({ bill, session }: VotingProps) {
  const { t } = useTranslation('voting');
  const { announce } = useAnnounce();
  const [choice, setChoice] = useState<string | null>(null);

  const handleVote = (value: string) => {
    setChoice(value);
    announce(t('vote.selected', { choice: t(`vote.choices.${value}`) }));
  };

  return (
    <div role="region" aria-labelledby="voting-title">
      <h2 id="voting-title">{t('vote.title')}</h2>

      <fieldset>
        <legend className="visually-hidden">
          {t('vote.legend', { billTitle: bill.title })}
        </legend>

        <div role="radiogroup" aria-labelledby="voting-title">
          {['yes', 'no', 'abstain'].map((option) => (
            <label
              key={option}
              className={`vote-option ${choice === option ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="vote"
                value={option}
                checked={choice === option}
                onChange={() => handleVote(option)}
                aria-describedby={`${option}-description`}
              />
              <span className="vote-label">{t(`vote.choices.${option}`)}</span>
              <span id={`${option}-description`} className="visually-hidden">
                {t(`vote.descriptions.${option}`)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={!choice}
        aria-disabled={!choice}
        onClick={handleSubmit}
      >
        {t('vote.confirm.button')}
      </button>
    </div>
  );
}
```

### 5. Low Bandwidth / Progressive Enhancement

```typescript
// Progressive enhancement for low bandwidth
export function BillViewer({ billId }: { billId: string }) {
  const { isSlowConnection } = useNetworkStatus();

  if (isSlowConnection) {
    // Minimal HTML, no images, essential content only
    return <BillViewerLite billId={billId} />;
  }

  return <BillViewerFull billId={billId} />;
}

// Service worker for offline access
export function registerOfflineSupport() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}

// Critical CSS inlining
export function CriticalStyles() {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        /* Critical above-the-fold styles */
        .skip-links { /* ... */ }
        .main-nav { /* ... */ }
        .vote-button { /* ... */ }
      `
    }} />
  );
}
```

### 6. Accessibility Testing Suite

```
tests/a11y/
├── axe-core.test.ts                # Automated axe testing
├── keyboard-navigation.test.ts     # Keyboard-only testing
├── screen-reader.test.ts           # Screen reader testing
├── color-contrast.test.ts          # Contrast testing
├── focus-management.test.ts        # Focus order testing
└── reduced-motion.test.ts          # Motion preference testing
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| A11y Components | 15-20 |
| Languages Supported | 3 (en, es, zh) |
| Translation Keys | 500+ |
| WCAG Compliance | AAA |
| Lighthouse A11y Score | 100 |
| Test Coverage | 90%+ |

## Success Criteria

1. [ ] All apps pass axe-core with 0 violations
2. [ ] Keyboard navigation working throughout
3. [ ] Screen reader testing passed
4. [ ] All colors pass AAA contrast (7:1)
5. [ ] English, Spanish, Chinese translations complete
6. [ ] RTL support working (for future Arabic/Hebrew)
7. [ ] Reduced motion respected
8. [ ] Focus visible on all interactive elements
9. [ ] Skip links working
10. [ ] All forms have proper labels and error messages

---

*Agent_E Assignment - Accessibility & Internationalization*
