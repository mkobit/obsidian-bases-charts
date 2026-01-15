import 'echarts-liquidfill'
import type { QueryController, ViewOption } from 'obsidian'
import { BaseChartView } from './base-chart-view'
import { transformDataToChartOption } from '../charts/transformer'
import type BarePlugin from '../main'
import type { EChartsOption } from 'echarts'
import type { BasesData } from '../charts/transformers/base'
import type { LiquidTransformerOptions } from '../charts/transformers/extensions/liquid'

export class LiquidChartView extends BaseChartView {
  readonly type = 'liquid-chart'

  constructor(controller: Readonly<QueryController>, scrollEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
    super(
      controller,
      scrollEl,
      plugin,
    )
  }

  protected getChartOption(data: BasesData): EChartsOption | null {
    const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY)

    if (typeof yProp !== 'string') {
      return null
    }

    const transformerOptions: LiquidTransformerOptions = {
      ...this.getCommonTransformerOptions(),
      shape: this.config.get('shape') as LiquidTransformerOptions['shape'],
      outline: this.config.get('outline') as boolean,
      waveAnimation: this.config.get('waveAnimation') as boolean,
    }

    return transformDataToChartOption(
      data,
      '',
      yProp,
      'liquid',
      transformerOptions,
    )
  }

  static getViewOptions(_?: unknown): ViewOption[] {
    return [
      {
        displayName: 'Value Property',
        type: 'property',
        key: BaseChartView.Y_AXIS_PROP_KEY,
        placeholder: 'Select value property',
      },
      {
        displayName: 'Shape',
        type: 'dropdown',
        key: 'shape',
        options: {
          circle: 'Circle',
          rect: 'Rect',
          roundRect: 'Round Rect',
          triangle: 'Triangle',
          diamond: 'Diamond',
          pin: 'Pin',
          arrow: 'Arrow',
          container: 'Container',
        },
      },
      {
        displayName: 'Show Outline',
        type: 'toggle',
        key: 'outline',
      },
      {
        displayName: 'Wave Animation',
        type: 'toggle',
        key: 'waveAnimation',
      },
      {
        displayName: 'Height',
        type: 'text',
        key: BaseChartView.HEIGHT_KEY,
        placeholder: 'e.g., 500px, 50vh',
      },
    ]
  }
}
