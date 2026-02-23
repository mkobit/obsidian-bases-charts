# Localization (i18n)

## Principles
1.  **Source of Truth**: `src/lang/locales/en.json` contains all valid translation keys.
2.  **Type Safety**: TypeScript validates all `i18next.t('key')` calls against this file at build time. Missing keys cause errors.

## Usage
Add keys to `en.json`, then use them in your code:

```typescript
// en.json: { "settings": { "title": "My Settings" } }
import i18next from 'i18next';
const title = i18next.t('settings.title');
```
