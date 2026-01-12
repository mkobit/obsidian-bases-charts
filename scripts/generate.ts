import { Command } from 'commander';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { generateCommandString, getDeterministicSample } from './generators/utils';
import { barChartArbitrary } from './generators/bar';
import { lineChartArbitrary } from './generators/line';
import { pieChartArbitrary } from './generators/pie';
import { scatterChartArbitrary } from './generators/scatter';

const program = new Command();

program
	.name('generate')
	.description('Generate chart examples')
	.option(
		'-s, --seed <seed>',
		'Seed for random generation',
	)
	.option(
		'--skip-confirm',
		'Skip confirmation prompt',
		false,
	)
	.action(async (options: { seed?: string;
		skipConfirm: boolean }) => {
		const seed = options.seed
			? parseInt(
				options.seed,
				10,
			)
			: Date.now();

		if (Number.isNaN(seed)) {
			console.error('Invalid seed provided. Must be an integer.');
			process.exit(1);
		}

		const commandString = generateCommandString(seed);

		if (!options.skipConfirm) {
			console.log(`This will generate examples using seed: ${seed}`);
			console.log('Proceed? (y/N)');
			const rl = readline.createInterface({ input,
				output });
			const answer = await rl.question('> ');
			rl.close();
			if (answer.trim().toLowerCase() !== 'y') {
				console.log('Aborted.');
				process.exit(0);
			}
		}

		console.log(`Command: ${commandString}`);

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
		};

		console.log(JSON.stringify(
			results,
			null,
			2,
		));
	});

program.parse();
