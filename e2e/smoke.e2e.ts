import { browser, expect } from '@wdio/globals'
import { obsidianPage } from 'wdio-obsidian-service'

describe('Obsidian Bases Charts Plugin', () => {
  it('should launch Obsidian and load the plugin', async () => {
    // The service should have started Obsidian with the example vault
    const body = browser.$('body')
    await body.waitForExist({ timeout: 10_000 })
    await expect(body).toExist()

    // Verify the plugin is loaded in the internal registry
    const isLoaded = await browser.executeObsidian(({ app }) => {
      // 'plugins' is not in the public API but exists at runtime
      const internalApp = app as unknown as { plugins: { plugins: Record<string, unknown> } }
      return internalApp.plugins.plugins['obsidian-bases-charts'] !== undefined
    })
    expect(isLoaded).toBe(true)
  })

  it('should register the settings tab', async () => {
    // Verify that the plugin registered its settings tab
    const hasSettingsTab = await browser.executeObsidian(({ app }) => {
      // 'setting' is internal
      const internalApp = app as unknown as { setting: { pluginTabs: { id: string }[] } }
      return internalApp.setting.pluginTabs.some(t => t.id === 'obsidian-bases-charts')
    })
    expect(hasSettingsTab).toBe(true)
  })

  it('should be able to create a file in the vault', async () => {
    // Demonstrate best practice: interacting with the vault directly
    const filename = 'test-chart.md'
    const content = '```chart\n\n```'

    // Create file
    await browser.executeObsidian(async ({ app }, name, data) => {
      await app.vault.create(name, data)
    }, filename, content)

    // Verify it exists via internal API
    const fileExists = await browser.executeObsidian(({ app }, name) => {
      return app.vault.getAbstractFileByPath(name) !== null
    }, filename)
    expect(fileExists).toBe(true)
  })

  afterEach(async () => {
    // Clean up the vault after each test (best practice)
    // We use the default vault path from wdio.conf.mts
    await obsidianPage.resetVault('example')
  })
})
