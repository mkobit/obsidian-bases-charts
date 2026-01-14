import type { ViewOption } from 'obsidian'
import { BaseChartView } from './base-chart-view'
import type { ChartType } from '../charts/transformer'
import { transformDataToChartOption } from '../charts/transformer'
import type { BasesData } from '../charts/transformers/base'

export class GraphChartView extends BaseChartView {
  readonly type: ChartType = 'graph'

  static getViewOptions(_?: unknown): ViewOption[] {
    return [
      ...BaseChartView.getCommonViewOptions(),
      {
        key: 'sourceProp',
        displayName: 'Source Property',
        type: 'property',
        placeholder: 'Property for the source node name',
      },
      {
        key: 'targetProp',
        displayName: 'Target Property',
        type: 'property',
        placeholder: 'Property for the target node name',
      },
      {
        key: 'valueProp',
        displayName: 'Value Property (Optional)',
        type: 'property',
        placeholder: 'Optional property for link weight/value',
      },
      {
        key: 'categoryProp',
        displayName: 'Category Property (Optional)',
        type: 'property',
        placeholder: 'Optional property for node grouping/color',
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
