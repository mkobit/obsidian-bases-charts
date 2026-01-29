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

## How it works
The `wdio-obsidian-service`:
1.  **Downloads Obsidian**: It fetches the requested version of Obsidian and the installer.
2.  **Creates a Sandbox**: It sets up a temporary vault (using `example/` as a template via the configuration) to ensure a clean state.
3.  **Launches Obsidian**: It starts the application with the plugin installed.
4.  **Runs Tests**: WebdriverIO executes the tests against the running Obsidian instance.

The setup also uses **wdio-obsidian-reporter**, which wraps the standard `@wdio/spec-reporter` to display the Obsidian version instead of the browser version in the output.

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
-   [wdio-obsidian-service Documentation](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/main/packages/wdio-obsidian-service/README.md)
-   [obsidian-launcher Documentation](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/main/packages/obsidian-launcher/README.md)
-   [WebdriverIO Documentation](https://webdriver.io/docs/gettingstarted)
