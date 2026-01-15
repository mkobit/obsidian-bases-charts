import type { EChartsOption } from 'echarts'
import * as R from 'remeda'
import type { BaseTransformerOptions, BasesData } from '../base'
import { getNestedValue } from '../utils'

export interface LiquidTransformerOptions extends BaseTransformerOptions {
  readonly outline?: boolean
  readonly waveAnimation?: boolean
  readonly shape?: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow' | 'container'
}

export function createLiquidChartOption(
  data: BasesData,
  valueProp: string,
  options?: LiquidTransformerOptions,
): EChartsOption {
  // Extract all values for the given property
  const seriesData: ReadonlyArray<number> = R.pipe(
    data,
    R.map((item) => {
      const val = Number(getNestedValue(item, valueProp))
      return Number.isNaN(val) ? 0 : val
    }),
  )

  const seriesItem = {
    type: 'liquidFill',
    data: seriesData.length > 0 ? seriesData : [0],
    shape: options?.shape ?? 'circle',
    outline: {
      show: options?.outline ?? true,
    },
    waveAnimation: options?.waveAnimation ?? true,
    backgroundStyle: {
      color: 'transparent',
    },
    label: {
      fontSize: 28,
    },
  }

  return {
    tooltip: {
      show: true,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
    series: [seriesItem as any],
  }
}
