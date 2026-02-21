import type { EChartsOption, CustomSeriesOption, DatasetComponentOption } from 'echarts'
import type { BaseTransformerOptions, BasesData } from './base'
import { safeToString, getNestedValue, getLegendOption } from './utils'
import * as R from 'remeda'

export interface CustomTransformerOptions extends BaseTransformerOptions {
  readonly renderItem: CustomSeriesOption['renderItem']
  readonly seriesProp?: string
  readonly xProp?: string
  readonly yProp?: string
}

interface CustomDataPoint {
  readonly x: string | number
  readonly y: number | null
  readonly s: string
  readonly [key: string]: unknown
}

export function createCustomChartOption(
  data: BasesData,
  xProp: string,
  yProp: string,
  options: CustomTransformerOptions,
): EChartsOption {
  const seriesProp = options.seriesProp
  const renderItem = options.renderItem
  const xAxisLabel = options.xAxisLabel ?? xProp
  const yAxisLabel = options.yAxisLabel ?? yProp
  const xAxisRotate = options.xAxisLabelRotate ?? 0

  // 1. Normalize Data for Dataset
  // Structure: { x, y, s (series), ...rest }
  const normalizedData: ReadonlyArray<CustomDataPoint> = R.map(
    data,
    (item): CustomDataPoint => {
      const xRaw = getNestedValue(
        item,
        xProp,
      )
      const yRaw = Number(getNestedValue(
        item,
        yProp,
      ))
      const sRaw = seriesProp
        ? getNestedValue(
            item,
            seriesProp,
          )
        : undefined

      return {
        ...item,
        x: xRaw === undefined || xRaw === null ? 'Unknown' : (typeof xRaw === 'number' ? xRaw : safeToString(xRaw)),
        y: Number.isNaN(yRaw) ? null : yRaw,
        s: seriesProp && sRaw !== undefined && sRaw !== null ? safeToString(sRaw) : 'Series 1',
      }
    },
  )

  // 2. Get unique X values (categories) if x is categorical
  // Check if all x are numbers.
  const isXNumeric = normalizedData.every(d => typeof d.x === 'number')

  const xAxisData: readonly (string | number)[] = isXNumeric
    ? []
    : R.pipe(
        normalizedData,
        R.map(d => String(d.x)),
        R.unique(),
      )

  // 3. Get unique Series
  const seriesNames: readonly string[] = R.pipe(
    normalizedData,
    R.map(d => d.s),
    R.unique(),
  )

  // 4. Create Datasets
  const sourceDataset: DatasetComponentOption = {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    source: normalizedData as unknown as Record<string, unknown>[],
  }

  const filterDatasets: ReadonlyArray<DatasetComponentOption> = seriesNames.map((name): DatasetComponentOption => ({
    transform: {
      type: 'filter',
      config: { dimension: 's', value: name },
    },
  }))

  const datasets: ReadonlyArray<DatasetComponentOption> = [sourceDataset, ...filterDatasets]

  // 5. Build Series Options
  const seriesOptions: ReadonlyArray<CustomSeriesOption> = seriesNames.map((name, idx): CustomSeriesOption => {
    const datasetIndex = idx + 1

    return {
      name: name,
      type: 'custom',
      renderItem: renderItem,
      datasetIndex: datasetIndex,
      encode: {
        x: 'x',
        y: 'y',
        tooltip: ['x', 'y', 's'],
      },
    }
  })

  const opt: EChartsOption = {
    dataset: [...datasets],
    xAxis: {
      type: isXNumeric ? 'value' : 'category',
      data: isXNumeric ? undefined : [...xAxisData],
      name: xAxisLabel,
      splitLine: { show: true },
      axisLabel: {
        rotate: xAxisRotate,
      },
      scale: isXNumeric,
    },
    yAxis: {
      type: 'value',
      name: yAxisLabel,
      splitLine: { show: true },
      scale: true,
    },
    series: [...seriesOptions],
    tooltip: {
      trigger: 'item',
    },
    ...(getLegendOption(options) ? { legend: getLegendOption(options) } : {}),
  }

  return opt
}
