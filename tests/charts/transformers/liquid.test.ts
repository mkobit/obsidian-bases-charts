import { describe, it, expect } from 'vitest'
import { createLiquidChartOption } from '../../../src/charts/transformers/extensions/liquid'

describe('createLiquidChartOption', () => {
  const data = [
    { value: 0.1 },
    { value: 0.2 },
    { value: 0.3 },
  ]

  it('should sum values and normalize by max (default 1)', () => {
    const option = createLiquidChartOption(data, 'value')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const series = option.series![0] as any
    expect(series.type).toBe('liquidFill')
    expect(series.data).toHaveLength(1)
    expect(series.data[0]).toBeCloseTo(0.6) // Sum 0.6 / 1
  })

  it('should handle custom max', () => {
    const option = createLiquidChartOption(data, 'value', { max: 2 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const series = option.series![0] as any
    expect(series.data).toHaveLength(1)
    expect(series.data[0]).toBeCloseTo(0.3) // Sum 0.6 / 2
  })

  it('should handle shape and outline options', () => {
    const option = createLiquidChartOption(data, 'value', {
      shape: 'rect',
      outlineShow: false,
      waveAnimation: false
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const series = option.series![0] as any
    expect(series.shape).toBe('rect')
    expect(series.outline.show).toBe(false)
    expect(series.waveAnimation).toBe(false)
  })

  it('should handle empty data', () => {
    const option = createLiquidChartOption([], 'value')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const series = option.series![0] as any
    expect(series.data).toEqual([0])
  })
})
