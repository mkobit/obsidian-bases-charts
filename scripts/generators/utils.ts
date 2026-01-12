import { Temporal } from 'temporal-polyfill';
import * as fc from 'fast-check';

export type ChartGeneratorResult = {
    type: string;
    data: unknown;
    config?: unknown;
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
    let sample: T | undefined;
    // We use fc.assert with numRuns: 1 to force a single deterministic run
    fc.assert(
        fc.property(arbitrary, (s) => {
            sample = s;
        }),
        { seed, numRuns: 1 }
    );
    if (sample === undefined) {
        throw new Error('Failed to generate sample');
    }
    return sample;
}
