import { Command } from 'commander';
import * as fc from 'fast-check';
import { Temporal } from 'temporal-polyfill';
import * as fs from 'fs';
import * as path from 'path';

interface GenerateOptions {
    readonly output: string;
    readonly count: string;
    readonly seed: string;
}

// Helper to format date
const formatDate = (date: Date): string => {
    return Temporal.Instant.fromEpochMilliseconds(date.getTime())
        .toZonedDateTimeISO('UTC')
        .toPlainDate()
        .toString();
};

const program = new Command();

program
    .name('generate')
    .description('Generate sample Obsidian properties using property-based testing principles')
    .option('-o, --output <path>', 'Output file path (JSON)', 'generated-properties.json')
    .option('-c, --count <number>', 'Number of items to generate', '10')
    .option('--seed <number>', 'Random seed', Temporal.Now.instant().epochMilliseconds.toString())
    .action((options: GenerateOptions) => {
        const count = parseInt(options.count, 10);
        const seed = parseInt(options.seed, 10);

        console.log(`Generating ${count} items with seed ${seed}...`);

        // Configure fast-check with seed
        fc.configureGlobal({ seed: seed });

        // Define Arbitrary for Obsidian Properties
        const propertiesArbitrary = fc.record({
            title: fc.lorem({ maxCount: 1 }),
            date: fc.date().map(formatDate),
            value: fc.integer({ min: 0, max: 1000 }),
            category: fc.constantFrom('Work', 'Personal', 'Health', 'Finance'),
            tags: fc.array(fc.constantFrom('obsidian', 'chart', 'plugin', 'test'), { minLength: 1, maxLength: 3 }),
            isActive: fc.boolean()
        });

        // Generate data
        const data = fc.sample(propertiesArbitrary, count);

        // Output
        const outputPath = path.resolve(process.cwd(), options.output);
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

        console.log(`Generated data written to ${outputPath}`);
    });

program.parse();
