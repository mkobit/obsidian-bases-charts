import * as fs from 'fs';
import * as path from 'path';
import fc from 'fast-check';
import { Temporal } from 'temporal-polyfill';

const BASE_DIR = path.join(process.cwd(), 'example', 'Charts', 'Gen');

// Parse command line arguments
const args = process.argv.slice(2);
let seed = Date.now();
const seedArgIndex = args.indexOf('--seed');
if (seedArgIndex !== -1 && args[seedArgIndex + 1]) {
    const parsed = parseInt(args[seedArgIndex + 1], 10);
    if (!isNaN(parsed)) {
        seed = parsed;
    }
}

console.log(`Using seed: ${seed}`);

// Configure fast-check with the seed
const fcConfig = { seed: seed, numRuns: 1 }; // We only need 1 run of "generating a list of items"

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function writeMarkdownFile(dir: string, filename: string, data: Record<string, any>, meta: string) {
    const filePath = path.join(dir, filename);
    const frontmatter = Object.entries(data)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join('\n');

    const content = `---\n${frontmatter}\n---\n\n# ${filename.replace('.md', '')}\n${meta}`;
    fs.writeFileSync(filePath, content);
}

// --- Generators ---

// 1. Categorical Data (e.g. Sales by Day)
// Generates: { Category: string, Value: number }
function generateCategorical() {
    const dir = path.join(BASE_DIR, 'Categorical');
    ensureDir(dir);

    const arbitrary = fc.array(
        fc.record({
            Category: fc.constantFrom('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'),
            Value: fc.integer({ min: 10, max: 500 })
        }),
        { minLength: 7, maxLength: 7 } // Exact week
    ).map(data => {
        // Ensure uniqueness of categories for a cleaner demo (optional, but good for charts)
        // Since we picked 7 constant values and length 7, duplicates are possible.
        // Let's force a fixed set for this demo type.
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map((day, i) => ({
            Category: day,
            Value: data[i]?.Value ?? 0
        }));
    });

    fc.assert(
        fc.property(arbitrary, (dataset) => {
            console.log(`Generating ${dataset.length} Categorical files...`);
            dataset.forEach((item, i) => {
                writeMarkdownFile(
                    dir,
                    `DailySales-${i}.md`,
                    item,
                    `Generated with seed ${seed}`
                );
            });
            return true;
        }),
        fcConfig
    );
}

// 2. Time Series Data (e.g. Server Load)
// Generates: { Date: ISOString, Load: number, Users: number }
function generateTimeSeries() {
    const dir = path.join(BASE_DIR, 'TimeSeries');
    ensureDir(dir);

    // Generate a sequence of 20 days
    const startDate = Temporal.Now.plainDateISO();

    const arbitrary = fc.array(
        fc.record({
            Load: fc.integer({ min: 0, max: 100 }),
            Users: fc.integer({ min: 100, max: 5000 })
        }),
        { minLength: 20, maxLength: 20 }
    ).map((points) => {
        return points.map((p, i) => ({
            Date: startDate.add({ days: i }).toString(),
            Load: p.Load,
            Users: p.Users
        }));
    });

    fc.assert(
        fc.property(arbitrary, (dataset) => {
            console.log(`Generating ${dataset.length} TimeSeries files...`);
            dataset.forEach((item, i) => {
                writeMarkdownFile(
                    dir,
                    `ServerMetric-${i}.md`,
                    item,
                    `Generated with seed ${seed}`
                );
            });
            return true;
        }),
        fcConfig
    );
}

// 3. Scatter Data (e.g. Height vs Weight)
// Generates: { Height: number, Weight: number, Group: string }
function generateScatter() {
    const dir = path.join(BASE_DIR, 'Scatter');
    ensureDir(dir);

    const arbitrary = fc.array(
        fc.record({
            // Ensure no NaN values using noNaN: true
            Height: fc.float({ min: 140, max: 200, noNaN: true }), // cm
            Weight: fc.float({ min: 40, max: 120, noNaN: true }),  // kg
            Group: fc.constantFrom('Group A', 'Group B')
        }),
        { minLength: 30, maxLength: 30 }
    );

    fc.assert(
        fc.property(arbitrary, (dataset) => {
            console.log(`Generating ${dataset.length} Scatter files...`);
            dataset.forEach((item, i) => {
                // Round floats for cleaner YAML
                const cleanItem = {
                    ...item,
                    Height: Math.round(item.Height * 10) / 10,
                    Weight: Math.round(item.Weight * 10) / 10
                };
                writeMarkdownFile(
                    dir,
                    `Subject-${i}.md`,
                    cleanItem,
                    `Generated with seed ${seed}`
                );
            });
            return true;
        }),
        fcConfig
    );
}

// Main execution
try {
    console.log('Starting data generation...');
    generateCategorical();
    generateTimeSeries();
    generateScatter();
    console.log('Data generation complete.');
} catch (e) {
    console.error('Data generation failed:', e);
    process.exit(1);
}
