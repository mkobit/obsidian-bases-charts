import type { QueryController, ViewOption } from 'obsidian'
import { BaseChartView } from './base-chart-view'
import { transformDataToChartOption } from '../charts/transformer'
import type BarePlugin from '../main'
import type { EChartsOption } from 'echarts'
import type { BasesData } from '../charts/transformers/base'

export class ScatterChartView extends BaseChartView {
  readonly type = 'scatter-chart'

  constructor(controller: Readonly<QueryController>, scrollEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
    super(
      controller,
      scrollEl,
      plugin,
    )
  }

  protected getChartOption(data: BasesData): EChartsOption | null {
    const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY)
    const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY)
    const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY)
    const sizeProp = this.config.get(BaseChartView.SIZE_PROP_KEY)

    if (typeof xProp !== 'string' || typeof yProp !== 'string') {
      return null
    }

    const visualMapMin = this.config.get(BaseChartView.VISUAL_MAP_MIN_KEY) ? Number(this.config.get(BaseChartView.VISUAL_MAP_MIN_KEY)) : undefined
    const visualMapMax = this.config.get(BaseChartView.VISUAL_MAP_MAX_KEY) ? Number(this.config.get(BaseChartView.VISUAL_MAP_MAX_KEY)) : undefined
    const visualMapColor = (this.config.get(BaseChartView.VISUAL_MAP_COLOR_KEY) as string)?.split(',').map(s => s.trim()).filter(Boolean)
    const visualMapOrient = this.config.get(BaseChartView.VISUAL_MAP_ORIENT_KEY) as 'horizontal' | 'vertical' | undefined
    const visualMapType = this.config.get(BaseChartView.VISUAL_MAP_TYPE_KEY) as 'continuous' | 'piecewise' | undefined

    return transformDataToChartOption(
      data,
      xProp,
      yProp,
      'scatter',
      {
        ...this.getCommonTransformerOptions(),
        seriesProp: typeof seriesProp === 'string' ? seriesProp : undefined,
        sizeProp: typeof sizeProp === 'string' ? sizeProp : undefined,
        visualMapMin: !Number.isNaN(visualMapMin) ? visualMapMin : undefined,
        visualMapMax: !Number.isNaN(visualMapMax) ? visualMapMax : undefined,
        visualMapColor: visualMapColor && visualMapColor.length > 0 ? visualMapColor : undefined,
        visualMapOrient,
        visualMapType,
      },
    )
  }

  static getViewOptions(_?: unknown): ViewOption[] {
    return [
      ...BaseChartView.getCommonViewOptions(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      ...BaseChartView.getAxisViewOptions().filter(opt => (opt as any).key !== BaseChartView.FLIP_AXIS_KEY),
      {
        displayName: 'Size Property (Optional)',
        type: 'property',
        key: BaseChartView.SIZE_PROP_KEY,
        placeholder: 'Select size property',
      },
      ...BaseChartView.getVisualMapViewOptions(),
    ]
  }
}
