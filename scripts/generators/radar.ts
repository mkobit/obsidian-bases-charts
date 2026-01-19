import * as fc from 'fast-check'

/**
 * Arbitrary for Radar chart data.
 * Generates multi-series data across indicators.
 */
export const radarChartArbitrary = fc.record({
  indicators: fc.constant(['Speed',
    'Reliability',
    'Comfort',
    'Safety',
    'Efficiency']),
  series: fc.constant(['Model A',
    'Model B']),
}).chain((config) => {
  return fc.array(
    fc.integer({ min: 50,
      max: 100 }),
    { minLength: config.indicators.length * config.series.length,
      maxLength: config.indicators.length * config.series.length },
  ).map((values) => {
    const data = config.series.flatMap((series, seriesIndex) => {
      return config.indicators.map((ind, indIndex) => {
        const index = seriesIndex * config.indicators.length + indIndex
        return {
          indicator: ind,
          series: series,
          value: values[index]!,
        }
      })
    })

    return {
      type: 'radar',
      data,
    }
  })
})
