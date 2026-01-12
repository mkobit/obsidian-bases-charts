import * as fc from 'fast-check';

/**
 * Arbitrary for a basic Scatter chart dataset.
 * Generates x-y coordinate pairs.
 */
export const scatterChartArbitrary = fc.array(
	fc.record({
		x: fc.float({ min: 0,
			max: 100 }),
		y: fc.float({ min: 0,
			max: 100 }),
	}),
	{ minLength: 10,
		maxLength: 50 },
).map(data => ({
	type: 'scatter',
	data: data,
}));
