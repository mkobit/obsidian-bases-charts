import { test, expect } from '@playwright/test'

test.describe('Sandbox Smoke Test', () => {
  test('renders chart buttons and loads chart', async ({ page }) => {
    // Navigate to the sandbox (assuming Vite runs on port 3000)
    await page.goto('http://localhost:3000')

    // Check if sidebar buttons exist
    const buttons = page.locator('#chart-list button')
    await expect(buttons.first()).toBeVisible()

    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)

    // Click each button and verify chart container is not empty
    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < count; i++) {
      await buttons.nth(i).click()

      // Wait for chart canvas to be present
      const canvas = page.locator('#chart canvas').first()
      await expect(canvas).toBeVisible()

      // Optional: Check for console errors (handled by Playwright's automatic error capturing usually, but explicit check is good)
    }
  })

  test('toggles mobile mode', async ({ page }) => {
    await page.goto('http://localhost:3000')
    const checkbox = page.locator('#mobile-toggle')
    await expect(checkbox).toBeVisible()
    await checkbox.check()
    await expect(checkbox).toBeChecked()
  })
})
