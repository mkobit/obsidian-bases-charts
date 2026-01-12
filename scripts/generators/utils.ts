import type { Temporal } from 'temporal-polyfill';
import * as fc from 'fast-check';

export type ChartGeneratorResult = {
	type: string;
	data: Record<string, unknown> | unknown[];
	config?: Record<string, unknown>;
};

/**
 * Generates the command string that reproduces this generation.
 */
export function generateCommandString(seed: number): string {
	return `pnpm examples:generate --seed ${seed}`;
}

/**
 * Formats a Temporal.Instant to an ISO string.
 */
export function formatInstant(instant: Temporal.Instant): string {
	return instant.toString();
}

/**
 * Generates a deterministic sample from an arbitrary using a specific seed.
 */
export function getDeterministicSample<T>(arbitrary: fc.Arbitrary<T>, seed: number): T {
	const samples = fc.sample(
		arbitrary,
		{
			seed,
			numRuns: 1,
		},
	);

	// We guaranteed at least one run, so index 0 exists.
	// Using non-null assertion as fast-check contract guarantees this with numRuns: 1
	return samples[0]!;
}
