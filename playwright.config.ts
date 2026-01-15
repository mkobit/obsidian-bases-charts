import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/smoke',
  fullyParallel: true,
  webServer: {
    command: 'npx vite --config sandbox/vite.config.ts',
    port: 3000,
    // eslint-disable-next-line no-undef
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
})
