import type { ViewOption } from 'obsidian'
import { BaseChartView } from './base-chart-view'
import { transformDataToChartOption } from '../charts/transformer'
import type { BasesData } from '../charts/transformers/base'

export class WaterfallChartView extends BaseChartView {
  type = 'waterfall-chart'

  static getViewOptions(): ViewOption[] {
    // reuse common options but exclude seriesProp and rename X/Y
    const common = BaseChartView.getCommonViewOptions()

    // Remove seriesProp as waterfall currently doesn't support grouping by series
    const options = common.filter(o => 'key' in o && o.key !== BaseChartView.SERIES_PROP_KEY)

    // Customize display names
    const xOption = options.find(o => 'key' in o && o.key === BaseChartView.X_AXIS_PROP_KEY)
    if (xOption) {
      xOption.displayName = 'Category Property'
    }

    const yOption = options.find(o => 'key' in o && o.key === BaseChartView.Y_AXIS_PROP_KEY)
    if (yOption) {
      yOption.displayName = 'Value Property'
    }

    return [
      ...options,
      ...BaseChartView.getAxisViewOptions(),
    ]
  }

  getChartOption(data: BasesData) {
    const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string
    const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY) as string

    if (!xProp || !yProp) {
      return null
    }

    // We use 'waterfall' chart type
    return transformDataToChartOption(
      data,
      xProp,
      yProp,
      'waterfall',
      this.getCommonTransformerOptions(),
    )
  }
}
