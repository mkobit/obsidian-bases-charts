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
    const xProp = this.getStringOption(BaseChartView.X_AXIS_PROP_KEY)
    const yProp = this.getStringOption(BaseChartView.Y_AXIS_PROP_KEY)
    const valueProp = this.getStringOption(BaseChartView.VALUE_PROP_KEY)

    if (!xProp || !yProp) {
      return null
    }

    return transformDataToChartOption(
      data,
      xProp,
      yProp,
      'sankey',
      {
        legend: this.getBooleanOption(BaseChartView.LEGEND_KEY),
        valueProp: valueProp,
      },
    )
  }

  static getViewOptions(): ViewOption[] {
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
