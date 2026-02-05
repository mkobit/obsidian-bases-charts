import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-playwright',
  timeout: 60000,
  retries: 0,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
  workers: 1, // Avoid parallel execution issues with Electron/Xvfb
});
