import 'echarts-liquidfill'
import type { QueryController, ViewOption } from 'obsidian'
import { BaseChartView } from './base-chart-view'
import { transformDataToChartOption } from '../charts/transformer'
import type BarePlugin from '../main'
import type { EChartsOption } from 'echarts'
import type { BasesData } from '../charts/transformers/base'
import type { LiquidTransformerOptions } from '../charts/transformers/extensions/liquid'
import i18next from 'i18next'

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
    // Y-Axis Prop -> Value
    const valueProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY)

    if (typeof valueProp !== 'string') {
      return null
    }

    const transformerOptions: LiquidTransformerOptions = {
      ...this.getCommonTransformerOptions(),
      max: Number(this.config.get('max') || 1),
      shape: this.config.get('shape') as LiquidTransformerOptions['shape'],
      outlineShow: this.config.get('outlineShow') === 'true' || this.config.get('outlineShow') === true,
      waveAnimation: this.config.get('waveAnimation') !== 'false' && this.config.get('waveAnimation') !== false, // Default true
    }

    return transformDataToChartOption(
      data,
      '', // X prop not needed for Liquid
      valueProp,
      'liquid',
      transformerOptions,
    )
  }

  static getViewOptions(_?: unknown): ViewOption[] {
    return [
      {
        displayName: i18next.t('views.liquid.options.value_prop'),
        type: 'property',
        key: BaseChartView.Y_AXIS_PROP_KEY,
        placeholder: 'Select value property',
      },
      {
        displayName: i18next.t('views.liquid.options.max'),
        type: 'text',
        key: 'max',
        placeholder: 'Max value (default: 1)',
      },
      {
        displayName: i18next.t('views.liquid.options.shape'),
        type: 'dropdown',
        key: 'shape',
        options: {
          circle: i18next.t('views.liquid.options.shapes.circle'),
          rect: i18next.t('views.liquid.options.shapes.rect'),
          roundRect: i18next.t('views.liquid.options.shapes.roundRect'),
          triangle: i18next.t('views.liquid.options.shapes.triangle'),
          diamond: i18next.t('views.liquid.options.shapes.diamond'),
          pin: i18next.t('views.liquid.options.shapes.pin'),
          arrow: i18next.t('views.liquid.options.shapes.arrow'),
          container: i18next.t('views.liquid.options.shapes.container'),
        },
      },
      {
        displayName: i18next.t('views.liquid.options.outline_show'),
        type: 'toggle',
        key: 'outlineShow',
      },
      {
        displayName: i18next.t('views.liquid.options.wave_animation'),
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
