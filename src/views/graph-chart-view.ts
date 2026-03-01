import type { ViewOption } from 'obsidian'
import { BaseChartView } from './base-chart-view'
import type { ChartType } from '../charts/transformer'
import { transformDataToChartOption } from '../charts/transformer'
import type { BasesData } from '../charts/transformers/base'
import { t } from '../lang/text'

export class GraphChartView extends BaseChartView {
  readonly type: ChartType = 'graph'

  static getViewOptions(): ViewOption[] {
    return [
      ...BaseChartView.getCommonViewOptions(),
      {
        key: 'sourceProp',
        displayName: t('views.graph.source_prop'),
        type: 'property',
        placeholder: t('views.graph.source_placeholder'),
      },
      {
        key: 'targetProp',
        displayName: t('views.graph.target_prop'),
        type: 'property',
        placeholder: t('views.graph.target_placeholder'),
      },
      {
        key: 'valueProp',
        displayName: t('views.graph.value_prop'),
        type: 'property',
        placeholder: t('views.graph.value_placeholder'),
      },
      {
        key: 'categoryProp',
        displayName: t('views.graph.category_prop'),
        type: 'property',
        placeholder: t('views.graph.category_placeholder'),
      },
    ]
  }

  getChartOption(data: BasesData) {
    const sourceProp = this.config.get('sourceProp') as string
    const targetProp = this.config.get('targetProp') as string
    const valueProp = this.config.get('valueProp') as string
    const categoryProp = this.config.get('categoryProp') as string

    if (!sourceProp || !targetProp) {
      return {}
    }

    return transformDataToChartOption(
      data,
      sourceProp,
      targetProp,
      'graph',
      {
        ...this.getCommonTransformerOptions(),
        valueProp,
        categoryProp,
      },
    )
  }
}
