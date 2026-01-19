import * as fc from 'fast-check'

/**
 * Arbitrary for Bubble chart data.
 * Generates x, y, and size.
 */
export const bubbleChartArbitrary = fc.record({
  count: fc.integer({ min: 10, max: 30 }),
}).chain((config) => {
  return fc.array(
    fc.record({
      x: fc.integer({ min: 0, max: 100 }),
      y: fc.integer({ min: 0, max: 100 }),
      size: fc.integer({ min: 10, max: 50 }),
    }),
    { minLength: config.count, maxLength: config.count },
  ).map((points) => {
    return {
      type: 'bubble',
      data: points.map(p => ({
        x: p.x,
        y: p.y,
        size: p.size,
      })),
    }
  })
})
