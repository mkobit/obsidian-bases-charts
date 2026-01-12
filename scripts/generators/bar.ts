import * as fc from 'fast-check';

/**
 * Arbitrary for a basic Bar chart dataset.
 * Generates a list of categories and corresponding numerical values.
 */
export const barChartArbitrary = fc.record({
    categories: fc.array(fc.string({ minLength: 1 }), { minLength: 3, maxLength: 10 }),
    values: fc.array(fc.integer({ min: 0, max: 1000 }), { minLength: 3, maxLength: 10 }),
}).filter(data => data.categories.length === data.values.length)
.map(data => ({
    type: 'bar',
    data: data.categories.map((cat, i) => ({
        category: cat,
        value: data.values[i]!
    }))
}));
