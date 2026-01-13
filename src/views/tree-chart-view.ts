import type { QueryController, ViewOption } from 'obsidian'
import type BarePlugin from '../main'
import { BaseChartView } from './base-chart-view'
import { transformDataToChartOption } from '../charts/transformer'
import type { EChartsOption } from 'echarts'
import type { BasesData } from '../charts/transformers/base'

export class TreeChartView extends BaseChartView {
  readonly type = 'tree-chart'

  constructor(controller: Readonly<QueryController>, containerEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
    super(
      controller,
      containerEl,
      plugin,
    )
  }

  getViewType(): string { return 'tree-chart' }

  getDisplayText(): string { return 'Tree' }

  getIcon(): string { return 'network' }

  static getViewOptions(_?: unknown): ViewOption[] {
    return [
      {
        displayName: 'Path property (e.g. "Folder/Subfolder")',
        type: 'property',
        key: BaseChartView.X_AXIS_PROP_KEY,
        placeholder: 'Select path property',
      },
    ]
  }

  protected getChartOption(data: BasesData): EChartsOption | null {
    const pathProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string
    if (!pathProp) { return null }

    return transformDataToChartOption(
      data,
      pathProp,
      '',
      'tree',
      {},
    )
  }
}
