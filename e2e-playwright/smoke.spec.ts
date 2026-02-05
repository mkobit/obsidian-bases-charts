import { test, expect } from './fixtures';

test('Obsidian loads and plugin is active', async ({ obsidianPage, executeObsidian }) => {
  // Verify title
  const title = await obsidianPage.title();
  console.log(`Page title: ${title}`);
  expect(title).toContain('Obsidian');

  // Verify plugin is loaded
  const pluginId = 'obsidian-bases-charts';

  const isLoaded = await executeObsidian(({ app }, id) => {
    // app.plugins.plugins is a registry of loaded plugins
    // Type casting might be needed if using strict TS
    const plugins = (app as any).plugins.plugins;
    return plugins[id] !== undefined;
  }, pluginId);

  expect(isLoaded).toBe(true);

  // Take a screenshot
  await obsidianPage.screenshot({ path: 'test_output/smoke_screenshot.png' });
});
