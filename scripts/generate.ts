import { Command } from 'commander';
import * as fc from 'fast-check';
import { Temporal } from 'temporal-polyfill';

const program = new Command();

program
	.name('generate')
	.description('Generate hello world samples')
	.action((_?: unknown) => {
		// Simple hello world arbitrary
		// Using Temporal to demonstrate compliance (e.g. including a timestamp)
		const helloArbitrary = fc.record({
			message: fc.constant('Hello World'),
			timestamp: fc.constant(Temporal.Now.plainDateTimeISO().toString()),
			randomInt: fc.integer(),
		});

		const data = fc.sample(
			helloArbitrary,
			1,
		);

		console.log(JSON.stringify(
			data,
			null,
			2,
		));
	});

program.parse();
