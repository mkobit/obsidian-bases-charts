# E2E Testing (WebdriverIO)

## Core Strategy
**Avoid UI Scraping**: Use `browser.executeObsidian` to interact with the internal Obsidian API for robust state verification.

```typescript
// Good: Verify file existence via internal API
const exists = await browser.executeObsidian(({ app }) => {
  return app.vault.getAbstractFileByPath("MyFile.md") !== null;
});
```

## Context Isolation
Variables from the test scope are **not** available inside `executeObsidian`. Pass them explicitly as arguments.

```typescript
const filename = "note.md";
await browser.executeObsidian(({ app }, name) => {
  // 'name' is available here, 'filename' is NOT
  app.vault.create(name, "");
}, filename);
```
