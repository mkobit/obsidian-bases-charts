import { test, expect } from '@playwright/test'

test.describe('Mobile Chart Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the script to load if necessary, but module scripts should handle it.
    // We can wait for window.renderChart to be defined.
    await page.waitForFunction(() => typeof window.renderChart === 'function')
  })

  test('Scatter Chart renders on mobile', async ({ page }) => {
    const data = [
      { x: 'A', y: 10, series: 'S1' },
      { x: 'B', y: 20, series: 'S1' },
      { x: 'C', y: 30, series: 'S2' },
      { x: 'D', y: 5, series: 'S2' },
    ]

    await page.evaluate(({ data }) => {
      window.renderChart('scatter', data, 'x', 'y', {
        seriesProp: 'series',
        xAxisLabel: 'Category',
        yAxisLabel: 'Value',
      })
    }, { data })

    const chart = page.locator('#chart canvas').first()
    await expect(chart).toBeVisible()

    // Allow animation to finish
    await page.waitForTimeout(1000)

    await expect(page).toHaveScreenshot('scatter-mobile.png')
  })

  test('Bar Chart renders on mobile', async ({ page }) => {
    const data = [
      { category: 'Mon', value: 120 },
      { category: 'Tue', value: 200 },
      { category: 'Wed', value: 150 },
      { category: 'Thu', value: 80 },
      { category: 'Fri', value: 70 },
      { category: 'Sat', value: 110 },
      { category: 'Sun', value: 130 },
    ]

    await page.evaluate(({ data }) => {
      window.renderChart('bar', data, 'category', 'value', {
        xAxisLabel: 'Day',
        yAxisLabel: 'Sales',
      })
    }, { data })

    const chart = page.locator('#chart canvas').first()
    await expect(chart).toBeVisible()
    await page.waitForTimeout(1000)

    await expect(page).toHaveScreenshot('bar-mobile.png')
  })

  test('Pie Chart renders on mobile', async ({ page }) => {
    const data = [
      { name: 'Direct', value: 335 },
      { name: 'Email', value: 310 },
      { name: 'Ad Networks', value: 234 },
      { name: 'Video Ads', value: 135 },
      { name: 'Search Engines', value: 1548 },
    ]

    await page.evaluate(({ data }) => {
      window.renderChart('pie', data, 'name', 'value', {
        xAxisLabel: 'Traffic Source',
      })
    }, { data })

    const chart = page.locator('#chart canvas').first()
    await expect(chart).toBeVisible()
    await page.waitForTimeout(1000)

    await expect(page).toHaveScreenshot('pie-mobile.png')
  })
})
