import type { QueryController, ViewOption } from 'obsidian'
import { BaseChartView } from './base-chart-view'
import { transformDataToChartOption } from '../charts/transformer'
import type BarePlugin from '../main'
import type { EChartsOption } from 'echarts'
import type { BasesData } from '../charts/transformers/base'

export class RadarChartView extends BaseChartView {
  readonly type = 'radar-chart'

  constructor(controller: Readonly<QueryController>, scrollEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
    super(
      controller,
      scrollEl,
      plugin,
    )
  }

  protected getChartOption(data: BasesData): EChartsOption | null {
    // For Radar:
    // X-Axis Prop -> Indicator (Category)
    // Y-Axis Prop -> Value
    // Series Prop -> Series Name
    const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY)
    const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY)
    const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY)

    return (typeof xProp !== 'string' || typeof yProp !== 'string')
      ? null
      : transformDataToChartOption(
          data,
          xProp,
          yProp,
          'radar',
          {
            ...this.getCommonTransformerOptions(),
            seriesProp: typeof seriesProp === 'string' ? seriesProp : undefined,
          },
        )
  }

  static getViewOptions(_?: unknown): ViewOption[] {
    // Clone options to avoid side effects on other charts
    return BaseChartView.getCommonViewOptions().map((opt) => {
      const isXAxis = 'key' in opt && opt.key === BaseChartView.X_AXIS_PROP_KEY
      return isXAxis
        ? {
            ...opt,
            displayName: 'Indicator Property',
            placeholder: 'Select indicator/category property',
          }
        : { ...opt }
    })
  }
}
