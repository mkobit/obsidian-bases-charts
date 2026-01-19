import * as fc from 'fast-check'

/**
 * Arbitrary for Funnel chart data.
 * Generates decreasing values.
 */
export const funnelChartArbitrary = fc.record({
  steps: fc.constant(['Visit',
    'Sign-up',
    'AddToCart',
    'Purchase']),
}).chain((config) => {
  return fc.array(
    fc.integer({ min: 10,
      max: 20 }), // random drop between steps
    { minLength: config.steps.length,
      maxLength: config.steps.length },
  ).map((drops) => {
    const result = config.steps.reduce<{ readonly current: number, readonly items: ReadonlyArray<{ readonly step: string, readonly value: number }> }>((acc, step, i) => {
      const val = acc.current
      const drop = drops[i] ?? 0
      const nextVal = Math.max(0, val - drop)
      return {
        current: nextVal,
        items: [...acc.items,
          { step,
            value: val }],
      }
    }, { current: 100,
      items: [] })

    return {
      type: 'funnel',
      data: result.items,
    }
  })
})

/**
 * Arbitrary for Gauge chart data.
 * Generates a single value.
 */
export const gaugeChartArbitrary = fc.integer({ min: 0,
  max: 100 }).map(val => ({
  type: 'gauge',
  data: [{ value: val }],
}))
