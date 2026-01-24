import type { ViewOption, TextOption } from 'obsidian'
import { BaseChartView } from './base-chart-view'
import type { ChartType } from '../charts/transformer'
import { transformDataToChartOption } from '../charts/transformer'
import type { EChartsOption } from 'echarts'
import type { BasesData } from '../charts/transformers/base'
import { t } from '../lang/text'

export class SankeyChartView extends BaseChartView {
  readonly type = 'sankey'

  getChartType(): ChartType {
    return 'sankey'
  }

  protected getChartOption(data: BasesData): EChartsOption | null {
    const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string
    const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY) as string
    const valueProp = this.config.get(BaseChartView.VALUE_PROP_KEY) as string

    if (!xProp || !yProp) {
      return null
    }

    return transformDataToChartOption(
      data,
      xProp,
      yProp,
      'sankey',
      {
        legend: this.config.get(BaseChartView.LEGEND_KEY) as boolean,
        valueProp: valueProp,
      },
    )
  }

  static getViewOptions(_?: unknown): ViewOption[] {
    const valueOption: TextOption = {
      displayName: t('views.sankey.value_prop'),
      key: BaseChartView.VALUE_PROP_KEY,
      type: 'text',
      placeholder: t('views.sankey.value_placeholder'),
    }

    return [
      ...BaseChartView.getCommonViewOptions(),
      valueOption,
    ]
  }
}
