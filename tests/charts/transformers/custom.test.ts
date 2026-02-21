import { describe, it, expect } from 'bun:test'
import { createCustomChartOption } from '../../../src/charts/transformers/custom'
import type { CustomSeriesOption } from 'echarts'

describe('createCustomChartOption', () => {
  const data = [
    { x: 'A', y: 10, cat: 'S1' },
    { x: 'B', y: 20, cat: 'S1' },
    { x: 'A', y: 30, cat: 'S2' },
    { x: 'C', y: 15, cat: 'S2' },
  ]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderItem = (): any => ({ type: 'rect', shape: {}, style: {} })

  it('should create basic custom chart option', () => {
    const option = createCustomChartOption(data, 'x', 'y', { renderItem })

    expect(option.series).toBeDefined()
    const series = option.series as CustomSeriesOption[]
    expect(series.length).toBeGreaterThan(0)
    expect(series[0]!.type).toBe('custom')
    expect(series[0]!.renderItem).toBe(renderItem)
  })

  it('should handle grouping via seriesProp', () => {
    const option = createCustomChartOption(data, 'x', 'y', { renderItem, seriesProp: 'cat' })

    const series = option.series as CustomSeriesOption[]
    expect(series).toHaveLength(2) // S1, S2
    const names = series.map(s => s.name)
    expect(names).toContain('S1')
    expect(names).toContain('S2')

    // Check dataset index logic
    // Series 0 (S1) -> Dataset 1 (Filter S1)
    // Series 1 (S2) -> Dataset 2 (Filter S2)
    expect(series[0]!.datasetIndex).toBe(1)
    expect(series[1]!.datasetIndex).toBe(2)
  })
})
