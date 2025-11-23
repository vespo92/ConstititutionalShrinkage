# @constitutional-shrinkage/i18n

Internationalization package for the Constitutional Shrinkage platform. Provides multi-language support with RTL-ready architecture.

## Supported Languages

- **English (en)** - Primary language
- **Spanish (es)** - Spanish translations
- **Chinese (zh)** - Simplified Chinese translations

## Features

- React context-based translation system
- Variable interpolation: `{{variable}}`
- Pluralization support
- Date/number formatting with Intl API
- RTL (Right-to-Left) support
- Automatic locale detection
- Fallback to default language

## Usage

```tsx
import { I18nProvider, useTranslation, useLocale } from '@constitutional-shrinkage/i18n';

function App() {
  return (
    <I18nProvider locale="en" fallbackLocale="en">
      <MyComponent />
    </I18nProvider>
  );
}

function MyComponent() {
  const { t } = useTranslation('voting');
  const { locale, setLocale, formatDate, formatNumber } = useLocale();

  return (
    <div>
      <h1>{t('vote.title')}</h1>
      <p>{t('vote.confirm.message', { choice: 'Yes', billTitle: 'HB-123' })}</p>
      <p>{formatDate(new Date())}</p>
      <button onClick={() => setLocale('es')}>Español</button>
    </div>
  );
}
```

## Translation Files

Translations are organized by namespace:

```
locales/
├── en/
│   ├── common.json
│   ├── voting.json
│   ├── bills.json
│   ├── delegation.json
│   ├── auth.json
│   └── errors.json
├── es/
│   └── ...
└── zh/
    └── ...
```

## Adding Translations

1. Add your translation key to the English file first
2. Run the translation check to identify missing keys
3. Add translations for other languages

```json
{
  "key.nested.value": "Your translation here",
  "interpolated": "Hello, {{name}}!",
  "plural": {
    "one": "{{count}} item",
    "other": "{{count}} items"
  }
}
```
