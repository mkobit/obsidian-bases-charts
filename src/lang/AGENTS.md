# Localization (i18n) Protocol

This directory (`src/lang/`) contains the localization logic for the plugin. We utilize **i18next** with a strict type-safety layer to ensure robust translation management.

## Core Principles

1.  **Type Safety is Mandatory**:
    -   We rely on TypeScript to validate translation keys at build time.
    -   Strings passed to `t()` functions must match keys defined in the English locale.
    -   Missing or typoed keys will cause compilation errors, preventing runtime issues.

2.  **English as Source of Truth**:
    -   The file `src/lang/locales/en.json` is the single source of truth for all translation keys.
    -   TypeScript types are inferred directly from this JSON file.

## Directory Structure

```text
src/lang/
├── locales/
│   └── en.json       # The master language file.
├── i18n.ts           # Initialization logic.
└── AGENTS.md         # This documentation.
src/@types/
└── i18next.d.ts      # Type augmentation for i18next.
```

## How to Add a New Translation

1.  **Open `src/lang/locales/en.json`**.
2.  **Add your key-value pair**. Nesting is supported and encouraged for organization.
    ```json
    {
      "settings": {
        "section_title": "General Settings",
        "save_button": "Save"
      }
    }
    ```
3.  **Use the key in your code**.
    -   Import `i18next`.
    -   Call `t` with your new key.
    ```typescript
    import i18next from 'i18next';

    const title = i18next.t('settings.section_title');
    ```

## Troubleshooting

### TypeScript Error: `Argument of type '"wrong.key"' is not assignable to parameter of type ...`

This means the key you are trying to use does not exist in `en.json`.
-   **Check for typos**.
-   **Verify nesting** in the JSON file.
-   **Ensure the file is saved**.

### Runtime: Text appears as `key.name` instead of value

This usually means `i18next` was not initialized before the code ran.
-   Ensure `initializeI18n()` is awaited in `main.ts` inside the `onload` method.
-   Ensure `initializeI18n()` is called *before* any views or settings tabs are registered/rendered.

## External Resources

-   [i18next Documentation](https://www.i18next.com/)
-   [obsidian-tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) (Architecture reference)
