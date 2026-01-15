import { describe, it, expect } from 'vitest'
import { transformDataToChartOption } from '../src/charts/transformer'

describe(
  'Liquid Chart Transformer',
  () => {
    it(
      'should transform data correctly for liquid chart',
      () => {
        const data = [
          { val: 0.5 },
          { val: 0.3 },
        ]

        const option = transformDataToChartOption(
          data,
          '',
          'val',
          'liquid',
          {
            outline: false,
          },
        )

        expect(option).toBeDefined()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const series = option.series as any[]
        expect(series).toBeDefined()
        expect(series.length).toBe(1)
        expect(series[0].type).toBe('liquidFill')
        expect(series[0].outline.show).toBe(false)

        const seriesData = series[0].data
        expect(seriesData).toEqual([0.5,
          0.3])
      },
    )

    it(
      'should default to [0] if no data',
      () => {
        const data: any[] = []
        const option = transformDataToChartOption(
          data,
          '',
          'val',
          'liquid',
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const series = option.series as any[]
        expect(series[0].data).toEqual([0])
      },
    )
  },
)
