import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './',
  timeout: 60_000,
  retries: 0,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
    headless: false, // Electron apps are always headed (or use xvfb in CI)
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'electron',
      testMatch: /.*\.spec\.ts/,
    },
  ],
  outputDir: '../test-results',
})
