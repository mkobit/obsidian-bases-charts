import * as fc from 'fast-check';
import { Temporal } from 'temporal-polyfill';

/**
 * Arbitrary for a basic Line chart dataset.
 * Generates a list of dates and corresponding numerical values.
 */
export const lineChartArbitrary = fc.record({
	start: fc.integer({ min: 0,
		max: 1_000_000_000 }), // Offset from epoch in seconds
	count: fc.integer({ min: 5,
		max: 20 }),
	values: fc.array(
		fc.integer({ min: 0,
			max: 100 }),
		{ minLength: 5,
			maxLength: 20 },
	),
}).chain(input => {
	// Ensure values match count
	const values = input.values.slice(
		0,
		input.count,
	);
	return fc.constant({
		type: 'line',
		data: values.map((val, i) => {
			const instant = Temporal.Instant.fromEpochMilliseconds((input.start + (i * 86_400)) * 1000); // Daily intervals
			return {
				date: instant,
				value: val,
			};
		}),
	});
});
