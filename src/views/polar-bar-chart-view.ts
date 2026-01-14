import type { ViewOption } from 'obsidian'
import { BaseChartView } from './base-chart-view'
import type { EChartsOption } from 'echarts'
import { transformDataToChartOption } from '../charts/transformer'
import type { BasesData } from '../charts/transformers/base'

export class PolarBarChartView extends BaseChartView {
  type = 'polar_bar'

  getIcon(): string {
    return 'bar-chart-2'
  }

  getDisplayName(): string {
    return 'Polar Bar Chart'
  }

  getChartOption(data: BasesData): EChartsOption {
    const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string
    const yProp = this.config.get(BaseChartView.VALUE_PROP_KEY) as string
    const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY) as string
    const isStacked = String(this.config.get('stack')) === 'true'

    return transformDataToChartOption(
      data,
      xProp,
      yProp,
      'polarBar',
      {
        ...this.getCommonTransformerOptions(),
        seriesProp,
        stack: isStacked,
      },
    )
  }

  static getViewOptions(): ViewOption[] {
    return [
      {
        key: BaseChartView.X_AXIS_PROP_KEY,
        displayName: 'Angle Property',
        type: 'property',
      },
      {
        key: BaseChartView.VALUE_PROP_KEY,
        displayName: 'Radius Property',
        type: 'property',
      },
      {
        key: BaseChartView.SERIES_PROP_KEY,
        displayName: 'Series Property',
        type: 'property',
      },
      {
        key: 'stack',
        displayName: 'Stack',
        type: 'toggle',
      },
      ...BaseChartView.getCommonViewOptions(),
    ]
  }
}
