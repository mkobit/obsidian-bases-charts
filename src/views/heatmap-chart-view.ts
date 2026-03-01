import type { ViewOption } from 'obsidian'
import { BaseChartView } from './base-chart-view'
import { transformDataToChartOption } from '../charts/transformer'
import type { EChartsOption } from 'echarts'
import type { BasesData } from '../charts/transformers/base'
import { t } from '../lang/text'

export class HeatmapChartView extends BaseChartView {
  readonly type = 'heatmap-chart'
  static getViewOptions(): ViewOption[] {
    return [
      {
        displayName: t('views.common.x_axis_prop'),
        type: 'property',
        key: BaseChartView.X_AXIS_PROP_KEY,
        placeholder: t('views.heatmap.x_axis_placeholder'),
      },
      {
        displayName: t('views.common.y_axis_prop'),
        type: 'property',
        key: BaseChartView.Y_AXIS_PROP_KEY,
        placeholder: t('views.heatmap.y_axis_placeholder'),
      },
      {
        displayName: t('views.heatmap.value_prop'),
        type: 'property',
        key: BaseChartView.VALUE_PROP_KEY,
        placeholder: t('views.heatmap.value_prop_placeholder'),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      ...BaseChartView.getAxisViewOptions().filter(opt => (opt as any).key !== BaseChartView.FLIP_AXIS_KEY),
      ...BaseChartView.getVisualMapViewOptions(),
    ]
  }

  protected getChartOption(data: BasesData): EChartsOption | null {
    const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY)
    const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY)
    const valueProp = this.config.get(BaseChartView.VALUE_PROP_KEY)

    if (typeof xProp !== 'string' || typeof yProp !== 'string' || typeof valueProp !== 'string') {
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
      'heatmap',
      {
        ...this.getCommonTransformerOptions(),
        valueProp: valueProp,
        visualMapMin: !Number.isNaN(visualMapMin) ? visualMapMin : undefined,
        visualMapMax: !Number.isNaN(visualMapMax) ? visualMapMax : undefined,
        visualMapColor: visualMapColor && visualMapColor.length > 0 ? visualMapColor : undefined,
        visualMapOrient,
        visualMapType,
      },
    )
  }
}
