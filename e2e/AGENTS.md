# E2E Testing with WebdriverIO

## Overview
We use **WebdriverIO** (v9+) with the **wdio-obsidian-service** to perform end-to-end testing of the plugin. This allows us to run tests in a real Obsidian environment, interacting with the app as a user would.

## Structure
- `wdio.conf.mts`: The WebdriverIO configuration file.
- `e2e/`: Directory containing test files (`*.e2e.ts`) and this documentation.
- `e2e/smoke.e2e.ts`: A smoke test to verify the plugin loads and basic functionality works.

## How it works
The `wdio-obsidian-service`:
1.  **Downloads Obsidian**: It fetches the requested version of Obsidian (or the latest).
2.  **Creates a Sandbox**: It sets up a temporary vault (using `example/` as a template if configured) to ensure a clean state.
3.  **Launches Obsidian**: It starts the application with the plugin installed.
4.  **Runs Tests**: WebdriverIO executes the tests against the running Obsidian instance.

## Running Tests

### Locally
To run the E2E tests locally:

```bash
bun run test:e2e
```

**Note:** On Linux, you might need a display server like `xvfb` if running in a headless environment, though locally it should pop up the window. The CI uses `xvfb` and `herbstluftwm`.

### Troubleshooting
-   **Obsidian not starting**: Ensure you have a valid internet connection for the first run to download Obsidian.
-   **Selectors**: Obsidian is an Electron app, but it's not a standard website. Use robust selectors. The service creates a cache in `.obsidian-cache`.

## Writing Tests
-   **Files**: Create new test files in `e2e/` with the `.e2e.ts` extension.
-   **Globals**: `browser`, `$`, `$$`, `expect` are available globally (via `@wdio/globals`).
-   **Best Practices**:
    -   Avoid visual regression testing if possible, as it can be brittle across platforms.
    -   Focus on functional verification (e.g., "Does the chart element exist?", "Does the command palette show the command?").
    -   Use `await browser.pause()` sparingly; prefer `await element.waitForExist()`.

## References
-   [wdio-obsidian-service Documentation](https://webdriver.io/docs/wdio-obsidian-service)
-   [WebdriverIO Documentation](https://webdriver.io/docs/gettingstarted)
