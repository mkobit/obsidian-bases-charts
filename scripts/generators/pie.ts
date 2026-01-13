import * as fc from 'fast-check';

/**
 * Arbitrary for a basic Pie chart dataset.
 * Generates name-value pairs.
 */
export const pieChartArbitrary = fc.array(
	fc.record({
		name: fc.string({ minLength: 1,
			maxLength: 15 }),
		value: fc.integer({ min: 1,
			max: 500 }),
	}),
	{ minLength: 3,
		maxLength: 8 },
).map(data => ({
	type: 'pie',
	data: data,
}));
