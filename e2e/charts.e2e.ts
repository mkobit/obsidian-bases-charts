import { $, browser, expect } from '@wdio/globals'

describe('Chart Rendering', () => {
  it('should render charts in Sales-Dashboard.base', async () => {
    // Open the Sales-Dashboard.base file using Quick Switcher
    // This avoids using browser.execute which has scope issues with 'app'

    // Determine modifier key (Meta for Mac, Control for others)
    const isMac = process.platform === 'darwin'
    const modifier = isMac ? 'Meta' : 'Control'

    // Open Quick Switcher (Ctrl/Cmd + O)
    // Modifier keys are sticky in WDIO, so we need to press them again to release
    await browser.keys([modifier, 'o', modifier])

    // Wait for Quick Switcher input to appear
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const quickSwitcherInput = await $('.prompt-input')
    await quickSwitcherInput.waitForExist({ timeout: 5000 })

    // Type the filename
    await browser.keys('Sales-Dashboard.base')

    // Wait for results to filter (heuristic wait as DOM changes are fast but async)
    await browser.pause(500)

    // Press Enter to select the top result
    await browser.keys(['Enter'])

    // Wait for the view to load and the chart container to be present
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const chartContainer = await $('.bases-echarts-container')
    await chartContainer.waitForExist({ timeout: 10_000 })

    // Verify that at least one chart container exists
    await expect(chartContainer).toExist()

    // Check for the canvas element inside the container
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const canvas = await chartContainer.$('canvas')
    await canvas.waitForExist({ timeout: 5000 })
    await expect(canvas).toExist()

    // Verify the canvas has dimensions (indicating it rendered)
    const size = await canvas.getSize()
    expect(size.width).toBeGreaterThan(0)
    expect(size.height).toBeGreaterThan(0)

    // Check for any error messages in the container
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const errorMsg = await chartContainer.$('.bases-error')
    // Assuming .bases-error is the class for errors, or checking for text content if generic
    // If we don't know the exact class, checking for absence of known error indicators is good
    if (await errorMsg.isExisting()) {
      const text = await errorMsg.getText()
      console.error('Chart error found:', text)
    }
    await expect(errorMsg).not.toExist()
  })
})
