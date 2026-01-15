import 'echarts-wordcloud'
import type { QueryController, ViewOption } from 'obsidian'
import { BaseChartView } from './base-chart-view'
import { transformDataToChartOption } from '../charts/transformer'
import type BarePlugin from '../main'
import type { EChartsOption } from 'echarts'
import type { BasesData } from '../charts/transformers/base'
import type { WordCloudTransformerOptions } from '../charts/transformers/extensions/word-cloud'
import i18next from 'i18next'

export class WordCloudChartView extends BaseChartView {
  readonly type = 'word-cloud-chart'

  constructor(controller: Readonly<QueryController>, scrollEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
    super(
      controller,
      scrollEl,
      plugin,
    )
  }

  protected getChartOption(data: BasesData): EChartsOption | null {
    // X-Axis Prop -> Word
    // Y-Axis Prop -> Frequency/Value
    const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY)
    const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY)

    if (typeof xProp !== 'string' || typeof yProp !== 'string') {
      return null
    }

    const transformerOptions: WordCloudTransformerOptions = {
      ...this.getCommonTransformerOptions(),
      shape: this.config.get('shape') as WordCloudTransformerOptions['shape'],
      gridSize: Number(this.config.get('gridSize') || 2),
      sizeRangeMin: Number(this.config.get('sizeRangeMin') || 12),
      sizeRangeMax: Number(this.config.get('sizeRangeMax') || 60),
    }

    return transformDataToChartOption(
      data,
      xProp,
      yProp,
      'wordCloud',
      transformerOptions,
    )
  }

  static getViewOptions(_?: unknown): ViewOption[] {
    return [
      ...BaseChartView.getCommonViewOptions(),
      {
        displayName: i18next.t('views.word_cloud.options.shape'),
        type: 'dropdown',
        key: 'shape',
        options: {
          'circle': 'Circle',
          'cardioid': 'Cardioid',
          'diamond': 'Diamond',
          'triangle-forward': 'Triangle Forward',
          'triangle': 'Triangle',
          'pentagon': 'Pentagon',
          'star': 'Star',
        },
      },
      {
        displayName: i18next.t('views.word_cloud.options.grid_size'),
        type: 'text',
        key: 'gridSize',
        placeholder: 'Grid size (default: 2)',
      },
      {
        displayName: i18next.t('views.word_cloud.options.min_font_size'),
        type: 'text',
        key: 'sizeRangeMin',
        placeholder: 'Min font size (default: 12)',
      },
      {
        displayName: i18next.t('views.word_cloud.options.max_font_size'),
        type: 'text',
        key: 'sizeRangeMax',
        placeholder: 'Max font size (default: 60)',
      },
    ]
  }
}
