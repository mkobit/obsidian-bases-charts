import type { EChartsOption, FunnelSeriesOption } from 'echarts'
import type { BaseTransformerOptions, BasesData } from './base'
import { safeToString, getNestedValue, getLegendOption } from './utils'
import * as R from 'remeda'

export function createFunnelChartOption(
  data: BasesData,
  nameProp: string,
  valueProp: string,
  options?: BaseTransformerOptions,
): EChartsOption {
  const seriesData = R.pipe(
    data,
    R.map((item) => {
      const valRaw = getNestedValue(
        item,
        nameProp,
      )
      const name = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw)

      const val = Number(getNestedValue(
        item,
        valueProp,
      ))
      return {
        name: name,
        value: Number.isNaN(val) ? 0 : val,
      }
    }),
    R.sortBy([x => x.value,
      'desc']),
  )

  const seriesItem: FunnelSeriesOption = {
    type: 'funnel',
    data: seriesData,
    label: {
      show: true,
      position: 'inside',
    },
  }

  const opt: EChartsOption = {
    series: [seriesItem],
    tooltip: {
      trigger: 'item',
      formatter: '{b} : {c}%',
    },
    ...(getLegendOption(options) ? { legend: getLegendOption(options) } : {}),
  }

  return opt
}
