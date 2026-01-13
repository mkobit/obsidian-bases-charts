import * as fc from 'fast-check';
import { Temporal } from 'temporal-polyfill';

/**
 * Arbitrary for a basic Line chart dataset.
 * Simulates a random walk trend (e.g., stock price or temperature).
 */
export const lineChartArbitrary = fc.record({
	startValue: fc.integer({ min: 50, max: 100 }),
	days: fc.integer({ min: 14, max: 30 }),
	trend: fc.constantFrom(-2, 0, 2), // Overall bias
	volatility: fc.integer({ min: 1, max: 5 }),
}).chain(config => {
	// Generate a sequence of deltas
	return fc.array(
		fc.integer({ min: -config.volatility, max: config.volatility }),
		{ minLength: config.days, maxLength: config.days },
	).map(deltas => {
		let currentValue = config.startValue;
		const today = Temporal.Now.plainDateISO();

		const data = deltas.map((delta, i) => {
			currentValue += delta + config.trend;
			// Ensure value stays positive
			if (currentValue < 0) currentValue = 0;

			// Generate date string
			const date = today.subtract({ days: config.days - i }).toString();

			return {
				date,
				value: currentValue,
			};
		});

		return {
			type: 'line',
			data,
		};
	});
});
