import type { EChartsOption } from 'echarts'
import * as R from 'remeda'
import type { BaseTransformerOptions, BasesData } from '../base'
import { getNestedValue } from '../utils'

export interface LiquidTransformerOptions extends BaseTransformerOptions {
  readonly max?: number
  readonly shape?: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow' | 'container'
  readonly outlineShow?: boolean
  readonly waveAnimation?: boolean
}

export function createLiquidChartOption(
  data: BasesData,
  valueProp: string,
  options?: LiquidTransformerOptions,
): EChartsOption {
  // Calculate sum of values using Remeda
  const sum = R.pipe(
    data,
    R.map((item) => {
      const val = Number(getNestedValue(item, valueProp))
      return Number.isNaN(val) ? 0 : val
    }),
    R.sum(),
  )

  const max = options?.max ?? 1
  const value = max === 0 ? 0 : sum / max

  const seriesItem = {
    type: 'liquidFill',
    data: [value],
    shape: options?.shape ?? 'circle',
    outline: {
      show: options?.outlineShow ?? true,
    },
    waveAnimation: options?.waveAnimation ?? true,
    backgroundStyle: {
      color: 'transparent',
    },
    label: {
      formatter: (param: { value: number }) => {
        return `${(param.value * 100).toFixed(0)}%`
      },
      fontSize: 28,
    },
  }

  return {
    tooltip: {
      show: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        return `${params.marker} ${params.seriesName}: ${(params.value * 100).toFixed(2)}%`
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
    series: [seriesItem as any],
  }
}
