import { $, browser, expect } from '@wdio/globals'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: any

describe('Chart Rendering', () => {
  it('should render charts in Sales-Dashboard.base', async () => {
    // Open the Sales-Dashboard.base file
    // We use browser.execute to interact with the Obsidian API directly
    await browser.execute(async () => {
      // @ts-ignore - app is available in the global scope in Obsidian
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await window.app.workspace.openLinkText('Sales-Dashboard.base', '', false)
    })

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
