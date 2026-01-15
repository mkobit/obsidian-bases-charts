import { test, expect } from '@playwright/test';

test('renders bar chart', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  // Vite serves from repo root by default
  await page.goto('/tests/visual/index.html');

  // Wait for chart canvas to be present and visible
  const chartCanvas = page.locator('canvas');
  await expect(chartCanvas).toBeVisible({ timeout: 10000 });

  // Allow some time for animation to settle (ECharts animates by default)
  await page.waitForTimeout(1000);

  // Take screenshot
  await expect(page).toHaveScreenshot();
});
