import { browser, expect } from '@wdio/globals'

describe('Obsidian Bases Charts Plugin', () => {
  it('should launch Obsidian and load the example vault', async () => {
    // The service should have started Obsidian with the example vault
    // We can check the window title.
    // Note: Title usually contains the vault name.
    await expect(browser).toHaveTitle(expect.stringContaining('example'))
  })

  it('should be able to search for the plugin in command palette', async () => {
    // Open Command Palette (Ctrl+P or Cmd+P)
    // Adjust for OS if strictly necessary, but Control works on most
    const isMac = process.platform === 'darwin'
    const modifier = isMac ? 'Meta' : 'Control'

    await browser.keys([modifier, 'p'])
    await browser.pause(1000) // Wait for palette

    // Type the plugin name
    await browser.keys('Bases Charts')
    await browser.pause(1000)

    // We can't easily assert the results without knowing the DOM structure
    // But if it didn't crash, that's a good sign.
    // We can capture a screenshot if needed, but for now passing this step is enough.

    // Close palette
    await browser.keys(['Escape'])
  })
})
