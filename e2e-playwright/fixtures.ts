import { test as base, Page, ElectronApplication, _electron as electron } from '@playwright/test';
import { prepareEnvironment } from '../scripts/test-harness';
import path from 'path';

type ObsidianFixtures = {
  app: ElectronApplication;
  obsidianPage: Page;
  executeObsidian: <T>(fn: (params: { app: any }, ...args: any[]) => T, ...args: any[]) => Promise<T>;
};

export const test = base.extend<ObsidianFixtures>({
  app: async ({}, use) => {
    // 1. Prepare Environment
    // This handles downloading Obsidian, creating a vault, and installing the plugin.
    const env = await prepareEnvironment();

    // 2. Launch Electron
    console.log(`Launching Obsidian from ${env.executablePath}`);
    const app = await electron.launch({
      executablePath: env.executablePath,
      args: [
        env.vaultPath,
        `--user-data-dir=${env.configDir}`,
        '--no-sandbox',
        '--disable-gpu'
      ],
      env: {
        ...process.env,
      }
    });

    await use(app);

    await app.close();
  },

  obsidianPage: async ({ app }, use) => {
    const page = await app.firstWindow();

    // Wait for Obsidian to be ready.
    // The workspace leaf is a good indicator that the UI has loaded.
    await page.waitForSelector('.workspace-leaf', { timeout: 30000 });

    await use(page);
  },

  executeObsidian: async ({ obsidianPage }, use) => {
    await use(async (fn: Function, ...args: any[]) => {
      // Serialize function and arguments to pass to the browser context
      return obsidianPage.evaluate(async ({ fnStr, args }: { fnStr: string, args: any[] }) => {
        const app = (window as any).app;
        // 'obsidian' module is not globally exposed in window.obsidian usually.
        // We expose 'app' which is the main entry point.

        // Reconstruct the function from string
        const fn = new Function('return ' + fnStr)();

        return await fn({ app }, ...args);
      }, { fnStr: fn.toString(), args });
    });
  }
});

export { expect } from '@playwright/test';
