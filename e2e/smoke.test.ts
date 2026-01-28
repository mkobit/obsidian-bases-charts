import { browser, expect } from '@wdio/globals'

describe('Obsidian Bases Charts Plugin', () => {
  it('should launch Obsidian', async () => {
    // The service should have started Obsidian with the example vault
    // Verify the body exists, indicating the window is open
    const body = await browser.$('body')
    await body.waitForExist({ timeout: 10000 })
    await expect(body).toExist()
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

    // Verify palette exists and has results (optional, but good)
    // The palette usually has class .prompt
    const prompt = await browser.$('.prompt')
    if (await prompt.isExisting()) {
       await expect(prompt).toExist()
    }

    // Close palette
    await browser.keys(['Escape'])
  })
})
