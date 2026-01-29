# E2E Testing with WebdriverIO

## Overview
We use **WebdriverIO** (v9+) with the **wdio-obsidian-service** to perform end-to-end testing of the plugin. This allows us to run tests in a real Obsidian environment, interacting with the app as a user would.

## Structure
- `wdio.conf.mts`: The WebdriverIO configuration file. Configured to use `obsidian` as the browser.
- `e2e/`: Directory containing test files (`*.e2e.ts`) and this documentation.
- `e2e/smoke.e2e.ts`: A smoke test to verify the plugin loads and basic functionality works.

## Configuration Strategy
We target the **specified dependency version** (defined in `package.json` and `manifest.json`) to verify the plugin works on the minimum supported environment.

-   **App Version (`browserVersion`)**: Set to `'earliest'`, which resolves to `minAppVersion` from `manifest.json` (e.g., `1.11.4`).
-   **Installer Version**: Set to `'earliest'`, which selects the oldest installer compatible with the App Version.

## Best Practices
We follow the patterns established in the [wdio-obsidian-service-sample-plugin](https://github.com/jesse-r-s-hines/wdio-obsidian-service-sample-plugin).

### 1. Direct Execution over UI Interaction
Where possible, prefer executing code within the Obsidian context rather than relying on brittle UI interactions (like typing in the command palette).

-   **Commands**: Use `browser.executeObsidianCommand("plugin-id:command-id")` instead of typing `Ctrl+P`.
-   **State Inspection**: Use `browser.executeObsidian(({ app }) => ...)` to check internal state (e.g., checks if a file exists in `app.vault`).

```typescript
// Good: Direct verification
const fileExists = await browser.executeObsidian(({ app }) => {
    return app.vault.getAbstractFileByPath("MyFile.md") !== null;
});

// Avoid: Relying solely on visual existence if logical verification is possible
```

### 2. Vault Management
Ensure a clean state for tests.
-   Use `obsidianPage.resetVault()` or `browser.reloadObsidian()` to reset the vault state between tests.
-   `resetVault` is faster as it cleans files without restarting the app.

### 3. Context Isolation
When using `browser.executeObsidian`, remember that variables from the test scope are **not** automatically available. You must pass them explicitly.

```typescript
const fileName = "test.md";
await browser.executeObsidian(async ({ app }, name) => {
    await app.vault.create(name, "content");
}, fileName); // Pass 'fileName' as the second argument
```

## Running Tests

### Locally
To run the E2E tests locally:

```bash
bun run test:e2e
```

**Note:** On Linux, you might need a display server like `xvfb` if running in a headless environment.

## References
-   [wdio-obsidian-service Documentation](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/main/packages/wdio-obsidian-service/README.md)
-   [Sample Plugin Tests](https://github.com/jesse-r-s-hines/wdio-obsidian-service-sample-plugin/blob/main/test/specs/test.e2e.ts)
