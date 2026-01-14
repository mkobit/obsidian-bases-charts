import { Command, InvalidArgumentError } from 'commander'
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { Temporal } from 'temporal-polyfill'
import { generateCommandString, getDeterministicSample } from './generators/utils'
import { barChartArbitrary } from './generators/bar'
import { lineChartArbitrary } from './generators/line'
import { pieChartArbitrary } from './generators/pie'
import { scatterChartArbitrary } from './generators/scatter'

const program = new Command()

function parseInteger(value: string) {
  const parsedValue = parseInt(
    value,
    10,
  )
  if (isNaN(parsedValue)) {
    // eslint-disable-next-line functional/no-throw-statements
    throw new InvalidArgumentError('Not a number.')
  }
  return parsedValue
}

program
  .name('generate')
  .description('Generate chart examples')
  .option(
    '-s, --seed <seed>',
    'Seed for random generation',
    parseInteger,
  )
  .option(
    '--skip-confirm',
    'Skip confirmation prompt',
    false,
  )
  .action(async (options: { seed?: number
    skipConfirm: boolean }) => {
    const seed = options.seed ?? Temporal.Now.instant().epochMilliseconds

    const commandString = generateCommandString(seed)

    if (!options.skipConfirm) {
      console.log(`This will generate examples using seed: ${seed}`)
      console.log('Proceed? (y/N)')
      const rl = readline.createInterface({ input,
        output })
      const answer = await rl.question('> ')
      rl.close()
      if (answer.trim().toLowerCase() !== 'y') {
        console.log('Aborted.')
        process.exit(0)
      }
    }

    console.log(`Command: ${commandString}`)

    const results = {
      bar: getDeterministicSample(
        barChartArbitrary,
        seed,
      ),
      line: getDeterministicSample(
        lineChartArbitrary,
        seed,
      ),
      pie: getDeterministicSample(
        pieChartArbitrary,
        seed,
      ),
      scatter: getDeterministicSample(
        scatterChartArbitrary,
        seed,
      ),
    }

    console.log(JSON.stringify(
      results,
      null,
      2,
    ))
  })

program.parse()
