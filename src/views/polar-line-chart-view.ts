import type { ViewOption } from 'obsidian'
import { BaseChartView } from './base-chart-view'
import type { EChartsOption } from 'echarts'
import { transformDataToChartOption } from '../charts/transformer'
import type { BasesData } from '../charts/transformers/base'
import { t } from '../lang/text'

export class PolarLineChartView extends BaseChartView {
  type = 'polar_line'

  getIcon(): string {
    return 'activity'
  }

  getDisplayName(): string {
    return 'Polar Line Chart'
  }

  getChartOption(data: BasesData): EChartsOption {
    const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string
    const yProp = this.config.get(BaseChartView.VALUE_PROP_KEY) as string
    const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY) as string
    const isSmooth = this.config.get('smooth') === 'true'
    const hasAreaStyle = this.config.get('areaStyle') === 'true'
    const isStacked = this.config.get('stack') === 'true'

    return transformDataToChartOption(
      data,
      xProp,
      yProp,
      'polarLine',
      {
        ...this.getCommonTransformerOptions(),
        seriesProp,
        smooth: isSmooth,
        areaStyle: hasAreaStyle,
        stack: isStacked,
      },
    )
  }

  static getViewOptions(): ViewOption[] {
    return [
      {
        key: BaseChartView.X_AXIS_PROP_KEY,
        displayName: t('views.polar.angle_prop'),
        type: 'property',
      },
      {
        key: BaseChartView.VALUE_PROP_KEY,
        displayName: t('views.polar.radius_prop'),
        type: 'property',
      },
      {
        key: BaseChartView.SERIES_PROP_KEY,
        displayName: t('views.polar.series_prop'),
        type: 'property',
      },
      {
        key: 'smooth',
        displayName: t('views.polar.smooth'),
        type: 'toggle',
      },
      {
        key: 'areaStyle',
        displayName: t('views.polar.area_style'),
        type: 'toggle',
      },
      {
        key: 'stack',
        displayName: t('views.polar.stack'),
        type: 'toggle',
      },
      ...BaseChartView.getCommonViewOptions(),
    ]
  }
}
