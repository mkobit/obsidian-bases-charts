import { test, expect } from './fixtures'

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/consistent-type-assertions */

test('Obsidian loads and plugin is active', async ({ obsidianPage, executeObsidian }) => {
  // Verify title
  const title = await obsidianPage.title()
  console.log(`Page title: ${title}`)
  expect(title).toContain('Obsidian')

  // Verify plugin is loaded
  const pluginId = 'obsidian-bases-charts'

  const isLoaded = await executeObsidian(({ app }, id) => {
    // app.plugins.plugins is a registry of loaded plugins
    // Type casting might be needed if using strict TS
    const plugins = (app).plugins.plugins
    return plugins[id as string] !== undefined
  }, pluginId)

  expect(isLoaded).toBe(true)
})
/* eslint-enable */
