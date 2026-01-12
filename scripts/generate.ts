import { Command } from 'commander';
import * as fc from 'fast-check';
import { Temporal } from 'temporal-polyfill';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

interface GenerateOptions {
    readonly output: string;
}

program
    .name('generate')
    .description('Generate hello world samples')
    .option('-o, --output <path>', 'Output file path (JSON)', 'hello.json')
    .action((options: GenerateOptions) => {
        // Simple hello world arbitrary
        // Using Temporal to demonstrate compliance (e.g. including a timestamp)
        const helloArbitrary = fc.record({
            message: fc.constant('Hello World'),
            timestamp: fc.constant(Temporal.Now.plainDateTimeISO().toString()),
            randomInt: fc.integer()
        });

        const data = fc.sample(helloArbitrary, 1);

        const outputPath = path.resolve(process.cwd(), options.output);
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

        console.log(`Generated data written to ${outputPath}`);
    });

program.parse();
