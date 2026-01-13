import type { QueryController, ViewOption } from 'obsidian'
import { BaseChartView } from './base-chart-view'
import { transformDataToChartOption } from '../charts/transformer'
import type BarePlugin from '../main'
import type { EChartsOption } from 'echarts'
import type { BasesData } from '../charts/transformers/base'

export class RoseChartView extends BaseChartView {
  readonly type = 'rose-chart'

  constructor(controller: Readonly<QueryController>, scrollEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
    super(
      controller,
      scrollEl,
      plugin,
    )
  }

  protected getChartOption(data: BasesData): EChartsOption | null {
    // Rose chart uses X-Axis as Category and Y-Axis as Value, similar to Pie
    const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY)
    const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY)
    const showLegend = this.config.get(BaseChartView.LEGEND_KEY) as boolean

    if (typeof xProp !== 'string' || typeof yProp !== 'string') {
      return null
    }

    return transformDataToChartOption(
      data,
      xProp,
      yProp,
      'rose',
      {
        legend: showLegend,
      },
    )
  }

  static getViewOptions(_?: unknown): ViewOption[] {
    return BaseChartView.getCommonViewOptions()
  }
}
