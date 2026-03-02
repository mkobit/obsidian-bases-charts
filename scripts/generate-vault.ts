import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { VaultBuilder } from '../e2e/helpers/vault-builder'
import {
  salesDataset,
  ganttDataset,
  stockDataset,
  scoreDataset,
  countryDataset,
  characterDataset,
  serverMetricsDataset,
} from '../e2e/fixtures/datasets'

const OUTPUT_DIR = path.join(__dirname, '../example/Charts')

async function clearMarkdownFiles(dir: string): Promise<void> {
  try {
    const files = await fs.readdir(dir)
    for (const file of files) {
      if (file.endsWith('.md')) {
        await fs.rm(path.join(dir, file))
      }
    }
  }
  catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
}

async function main() {
  console.log(`Clearing existing markdown files in ${OUTPUT_DIR}...`)
  await clearMarkdownFiles(OUTPUT_DIR)

  console.log('Generating new vault data...')
  const builder = VaultBuilder.create()
    .withNotes(salesDataset)
    .withNotes(ganttDataset)
    .withNotes(stockDataset)
    .withNotes(scoreDataset)
    .withNotes(countryDataset)
    .withNotes(characterDataset)
    .withNotes(serverMetricsDataset)

  await builder.build(OUTPUT_DIR)

  console.log('\nGeneration Summary:')
  console.log(`- Sales Notes: ${salesDataset.length}`)
  console.log(`- Gantt Task Notes: ${ganttDataset.length}`)
  console.log(`- Stock Price Notes: ${stockDataset.length}`)
  console.log(`- Academic Score Notes: ${scoreDataset.length}`)
  console.log(`- Country Stat Notes: ${countryDataset.length}`)
  console.log(`- RPG Character Notes: ${characterDataset.length}`)
  console.log(`- Server Metric Notes: ${serverMetricsDataset.length}`)
  console.log(`\nTotal notes generated: ${
    salesDataset.length
    + ganttDataset.length
    + stockDataset.length
    + scoreDataset.length
    + countryDataset.length
    + characterDataset.length
    + serverMetricsDataset.length
  }`)
  console.log('\nVault generated successfully!')
}

main().catch((error) => {
  console.error('Failed to generate vault:', error)
  process.exit(1)
})
