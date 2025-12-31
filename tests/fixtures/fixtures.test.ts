import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { Temporal } from 'temporal-polyfill';
import {
    chartDataPointArbitrary,
    chartDatasetArbitrary,
    timeSeriesArbitrary,
    generateLinearData,
    generateDailyTimeSeries
} from './chart_data';
import { ObsidianFileBuilder } from './obsidian_builder';

describe('Chart Data Generators', () => {
    it('should generate valid random chart data points', () => {
        fc.assert(
            fc.property(chartDataPointArbitrary(['price', 'volume']), (data) => {
                expect(data).toHaveProperty('price');
                expect(data).toHaveProperty('volume');
            })
        );
    });

    it('should generate valid random datasets', () => {
        fc.assert(
            fc.property(chartDatasetArbitrary(['x', 'y'], 1, 10), (dataset) => {
                expect(dataset.length).toBeGreaterThanOrEqual(1);
                expect(dataset.length).toBeLessThanOrEqual(10);

                // Use explicit type guard or just check existence
                for (const point of dataset) {
                    expect(point).toHaveProperty('x');
                    expect(point).toHaveProperty('y');
                }
            })
        );
    });

    it('should generate valid time series data sorted by time', () => {
        fc.assert(
            fc.property(timeSeriesArbitrary(), (dataset) => {
                expect(dataset.length).toBeGreaterThan(0);

                // Check if sorted
                for (let i = 0; i < dataset.length - 1; i++) {
                    const current = dataset[i];
                    const next = dataset[i+1];

                    // Safely access properties with non-null checks logic implicitly by loop bounds
                    if (!current || !next) continue;

                    const t1 = current.date as Temporal.ZonedDateTime;
                    const t2 = next.date as Temporal.ZonedDateTime;

                    expect(Temporal.ZonedDateTime.compare(t1, t2)).toBeLessThanOrEqual(0);
                }
            })
        );
    });

    it('should generate linear fixed data', () => {
        const data = generateLinearData(5, 2, 10);
        expect(data).toHaveLength(5);
        expect(data[0]).toEqual({ x: 0, y: 10 });
        expect(data[1]).toEqual({ x: 1, y: 12 });
        expect(data[4]).toEqual({ x: 4, y: 18 });
    });

    it('should generate daily time series fixed data with Temporal dates', () => {
        const data = generateDailyTimeSeries(3, '2023-01-01', 100, 0);

        expect(data).toHaveLength(3);

        // Assertions using explicit indexing checks
        const p0 = data[0];
        const p1 = data[1];
        const p2 = data[2];

        if (!p0 || !p1 || !p2) {
            throw new Error('Data length mismatch');
        }

        const d0 = p0.date as Temporal.PlainDate;
        const d1 = p1.date as Temporal.PlainDate;
        const d2 = p2.date as Temporal.PlainDate;

        expect(d0.toString()).toBe('2023-01-01');
        expect(d1.toString()).toBe('2023-01-02');
        expect(d2.toString()).toBe('2023-01-03');
    });
});

describe('Obsidian File Builder', () => {
    it('should build a simple file', () => {
        const file = ObsidianFileBuilder.create('My Note')
            .withContent('Hello World')
            .build();

        expect(file.name).toBe('My Note');
        expect(file.filename).toBe('My Note.md');
        expect(file.content).toBe('Hello World');
        expect(file.path).toEqual([]);
    });

    it('should add path segments', () => {
        const file = ObsidianFileBuilder.create('Note')
            .withPath(['A', 'B'])
            .build();
        expect(file.path).toEqual(['A', 'B']);
    });

    it('should handle frontmatter properties with Temporal types', () => {
        const date = Temporal.PlainDate.from('2023-01-01');
        const file = ObsidianFileBuilder.create('Note')
            .withProperty('tags', ['a', 'b'])
            .withProperty('published', true)
            .withProperty('created', date)
            .build();

        expect(file.frontmatter).toEqual({
            tags: ['a', 'b'],
            published: true,
            created: date
        });

        // Verify it's actually a Temporal object
        const created = file.frontmatter.created;
        expect(created).toBeInstanceOf(Temporal.PlainDate);
        if (created instanceof Temporal.PlainDate) {
             expect(created.year).toBe(2023);
        }
    });

    it('should generate valid raw string with ISO dates', () => {
        const date = Temporal.PlainDate.from('2023-01-01');
        const file = ObsidianFileBuilder.create('Note')
            .withProperty('created', date)
            .withContent('# Header')
            .toRawString();

        expect(file).toContain('created: 2023-01-01');
        expect(file).toContain('# Header');
        expect(file).toMatch(/^---\n/);
    });
});
