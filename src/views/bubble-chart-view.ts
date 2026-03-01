import type { ViewOption } from 'obsidian'
import { BaseChartView } from './base-chart-view'
import { transformDataToChartOption } from '../charts/transformer'
import type { EChartsOption } from 'echarts'
import type { BasesData } from '../charts/transformers/base'
import { t } from '../lang/text'

export class BubbleChartView extends BaseChartView {
  readonly type = 'bubble-chart'
  protected getChartOption(data: BasesData): EChartsOption | null {
    const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY)
    const xAxisLabel = this.config.get(BaseChartView.X_AXIS_LABEL_KEY) as string
    const yAxisLabel = this.config.get(BaseChartView.Y_AXIS_LABEL_KEY) as string
    const xAxisLabelRotate = Number(this.config.get(BaseChartView.X_AXIS_LABEL_ROTATE_KEY))
    const flipAxis = this.config.get(BaseChartView.FLIP_AXIS_KEY) as boolean

    const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY)
    const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY)
    // Cast BaseChartView to any to access the property if strict types fail
    const sizeProp = this.config.get(BaseChartView.SIZE_PROP_KEY)
    const showLegend = this.config.get(BaseChartView.LEGEND_KEY) as boolean

    if (typeof xProp !== 'string' || typeof yProp !== 'string') {
      return null
    }

    return transformDataToChartOption(
      data,
      xProp,
      yProp,
      'bubble',
      {
        xAxisLabel,
        yAxisLabel,
        xAxisLabelRotate,
        flipAxis,
        legend: showLegend,
        seriesProp: typeof seriesProp === 'string' ? seriesProp : undefined,
        sizeProp: typeof sizeProp === 'string' ? sizeProp : undefined,
      },
    )
  }

  static getViewOptions(): ViewOption[] {
    return [
      ...BaseChartView.getCommonViewOptions(), // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      ...BaseChartView.getAxisViewOptions().filter(opt => (opt as any).key !== BaseChartView.FLIP_AXIS_KEY),
      {
        displayName: t('views.bubble.size_prop'),
        type: 'property',
        key: BaseChartView.SIZE_PROP_KEY,
        placeholder: t('views.bubble.size_prop_placeholder'),
      },
    ]
  }
}
