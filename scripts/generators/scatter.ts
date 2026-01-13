import * as fc from 'fast-check';

/**
 * Arbitrary for a basic Scatter chart dataset.
 * Generates X values and corresponding Noise values to combine them deterministically to form a correlated dataset.
 */
export const scatterChartArbitrary = fc.record({
	count: fc.integer({ min: 20, max: 50 }),
	slope: fc.float({ min: 0.5, max: 2.0 }),
	intercept: fc.integer({ min: 10, max: 50 }),
}).chain(config => {
	return fc.array(
		fc.record({
			x: fc.float({ min: 10, max: 100 }),
			noise: fc.float({ min: -10, max: 10 }),
		}),
		{ minLength: config.count, maxLength: config.count },
	).map(points => {
		const data = points.map(p => ({
			x: parseFloat(p.x.toFixed(1)),
			y: parseFloat((p.x * config.slope + config.intercept + p.noise).toFixed(1)),
		}));
		return {
			type: 'scatter',
			data,
		};
	});
});
