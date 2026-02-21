/* eslint-disable no-console */
import { _electron as electron, test, expect } from '@playwright/test'

interface ObsidianApp {
  plugins: {
    plugins: Record<string, unknown>
  }
}

test('Obsidian launches and loads the plugin', async () => {
  const executablePath = process.env.OBSIDIAN_EXECUTABLE_PATH
  const vaultPath = process.env.TEST_VAULT_PATH
  const configDir = process.env.OBSIDIAN_CONFIG_DIR
  const pluginId = process.env.PLUGIN_ID || 'obsidian-bases-charts'

  if (!executablePath || !vaultPath || !configDir) {
    throw new Error('OBSIDIAN_EXECUTABLE_PATH, TEST_VAULT_PATH, and OBSIDIAN_CONFIG_DIR must be set')
  }

  console.log(`Launching Obsidian from: ${executablePath}`)

  const app = await electron.launch({
    executablePath,
    args: [
      vaultPath,
      `--user-data-dir=${configDir}`,
      '--disable-gpu',
      '--headless',
      '--no-sandbox',
    ],
  })

  const window = await app.firstWindow()
  await window.waitForLoadState('domcontentloaded')

  const title = await window.title()
  console.log(`Window title: ${title}`)

  const isPluginLoaded = await window.evaluate(async (id) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const win = window as any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const obsidianApp = win.app as ObsidianApp

    if (!obsidianApp || !obsidianApp.plugins) {
      return false
    }

    return !!obsidianApp.plugins.plugins[id]
  }, pluginId)

  expect(isPluginLoaded).toBe(true)
  await app.close()
})
