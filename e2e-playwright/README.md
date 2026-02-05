# Playwright E2E Testing (Proof of Concept)

This directory contains a Proof of Concept (PoC) for testing the Obsidian plugin using **Playwright** instead of WebdriverIO.

## Setup

The testing infrastructure is decoupled from the runner:
1.  `scripts/test-harness.ts`: A runner-agnostic script that downloads Obsidian and sets up the test vault.
2.  `fixtures.ts`: Playwright fixtures that use the harness to launch Obsidian via `_electron.launch`.

## Running Tests

To run the Playwright tests:

```bash
bun run test:e2e:playwright
```

On Linux/CI, ensure you have a display server (Xvfb) running:

```bash
xvfb-run --auto-servernum bun run test:e2e:playwright
```

## Structure

-   `smoke.spec.ts`: A basic smoke test verifying the plugin loads.
-   `fixtures.ts`: Custom fixtures (`app`, `obsidianPage`, `executeObsidian`).
-   `playwright.config.ts`: Playwright configuration (at root).

## Comparison with WebdriverIO

| Feature | WebdriverIO (Current) | Playwright (PoC) |
| :--- | :--- | :--- |
| **Connection** | WebDriver Protocol (via ChromeDriver) | Chrome DevTools Protocol (Direct) |
| **Setup** | `wdio-obsidian-service` | `scripts/test-harness.ts` + `fixtures.ts` |
| **Execution** | `browser.executeObsidian` | `executeObsidian` fixture |
| **Performance** | Slower (WebDriver overhead) | Faster (Direct CDP) |

## Moving Forward

To fully migrate:
1.  Port existing tests from `e2e/*.e2e.ts` to Playwright specs.
2.  Update CI workflows to run `test:e2e:playwright`.
3.  Optimize the harness to copy only build artifacts (`main.js`, `manifest.json`, `styles.css`) instead of the entire project directory.
