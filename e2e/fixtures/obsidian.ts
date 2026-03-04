import { test as base, expect, _electron as electron } from '@playwright/test'
import type { ElectronApplication, Page } from '@playwright/test'
// eslint-disable-next-line import/no-nodejs-modules
import * as path from 'node:path'
// eslint-disable-next-line import/no-nodejs-modules
import * as os from 'node:os'
// eslint-disable-next-line import/no-nodejs-modules
import * as fs from 'node:fs'

// Helper to find the Obsidian executable based on the OS
function getObsidianExecutablePath(): string {
  const platform = os.platform()
  if (platform === 'darwin') {
    return process.env.OBSIDIAN_EXECUTABLE_PATH || '/Applications/Obsidian.app/Contents/MacOS/Obsidian'
  }
  else if (platform === 'win32') {
    return process.env.OBSIDIAN_EXECUTABLE_PATH || path.join(process.env.LOCALAPPDATA || '', 'Programs', 'obsidian', 'Obsidian.exe')
  }
  else if (platform === 'linux') {
    // Requires OBSIDIAN_EXECUTABLE_PATH to be set in CI (e.g., extracted AppImage)
    return process.env.OBSIDIAN_EXECUTABLE_PATH || '/opt/Obsidian/obsidian'
  }
  throw new Error(`Unsupported platform: ${platform}`)
}

type ObsidianFixtures = {
  obsidianApp: ElectronApplication
  obsidianPage: { page: Page }
}

export const test = base.extend<ObsidianFixtures>({
  // eslint-disable-next-line no-empty-pattern
  obsidianApp: async ({ }, use) => {
    // resolve to the root directory's example vault
    const rootDir = path.resolve(import.meta.dirname, '../../')
    const testVaultPath = path.join(rootDir, 'example')

    // Copy the built plugin files into the test vault
    const pluginId = 'obsidian-bases-charts'
    // eslint-disable-next-line obsidianmd/hardcoded-config-path
    const pluginDir = path.join(testVaultPath, '.obsidian', 'plugins', pluginId)
    fs.mkdirSync(pluginDir, { recursive: true })

    const filesToCopy = ['main.js', 'manifest.json', 'styles.css']
    for (const file of filesToCopy) {
      const src = path.join(rootDir, file)
      const dest = path.join(pluginDir, file)
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest)
      }
    }

    const executablePath = getObsidianExecutablePath()

    const app = await electron.launch({
      executablePath,
      args: [testVaultPath, '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--remote-debugging-port=9222'],
      env: { ...process.env, NODE_ENV: 'test' },
    })

    await use(app)
    await app.close()
  },

  obsidianPage: async ({ obsidianApp }, use) => {
    // Grab the first window to interact with the Obsidian UI
    // Sometimes it takes a moment to open
    let page = await obsidianApp.firstWindow()

    // It's possible for there to be a blank electron window first if we're too fast
    for (let i = 0; i < 20; i++) {
      const pages = obsidianApp.windows()
      if (pages.length > 0) {
        page = pages[0]!
        const url = page.url()
        if (url.includes('app.html') || url.includes('index.html')) {
          break
        }
      }
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Wait for Obsidian app to initialize
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.waitForFunction(() => typeof (window as any).app !== 'undefined', { timeout: 30_000 })

    await use({ page })
  },
})

export { expect }
