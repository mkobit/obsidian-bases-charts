import type {
  QueryController,
  ViewOption,
  ItemView } from 'obsidian'
import {
  BasesView,
  Platform,
} from 'obsidian'
import * as echarts from 'echarts'
import type BarePlugin from '../main'
import type { EChartsOption } from 'echarts'
import type { BasesData, BaseTransformerOptions } from '../charts/transformers/base'
import { ChartModal } from './chart-modal'

export abstract class BaseChartView extends BasesView {
  readonly scrollEl: HTMLElement
  readonly containerEl: HTMLElement
  readonly chartEl: HTMLElement
  readonly plugin: BarePlugin
  protected chart: echarts.ECharts | null = null
  private resizeObserver: ResizeObserver | null = null
  private isFullScreenGeneration = false
  private resizeTimeout: number | null = null

  // Common Config Keys
  public static readonly X_AXIS_PROP_KEY = 'xAxisProp'
  public static readonly Y_AXIS_PROP_KEY = 'yAxisProp'
  public static readonly SERIES_PROP_KEY = 'seriesProp'
  public static readonly LEGEND_KEY = 'showLegend'
  public static readonly LEGEND_POSITION_KEY = 'legendPosition'
  public static readonly LEGEND_ORIENT_KEY = 'legendOrient'
  public static readonly HEIGHT_KEY = 'height'
  public static readonly THEME_KEY = 'theme'

  // New Config Keys (Made public for easier access in subclasses without casting)
  public static readonly SIZE_PROP_KEY = 'sizeProp'
  public static readonly MIN_VALUE_KEY = 'minVal'
  public static readonly MAX_VALUE_KEY = 'maxVal'
  public static readonly VALUE_PROP_KEY = 'valueProp'

  // Axis Config Keys
  public static readonly X_AXIS_LABEL_KEY = 'xAxisLabel'
  public static readonly Y_AXIS_LABEL_KEY = 'yAxisLabel'
  public static readonly X_AXIS_LABEL_ROTATE_KEY = 'xAxisLabelRotate'
  public static readonly FLIP_AXIS_KEY = 'flipAxis'

  // Visual Map Config Keys
  public static readonly VISUAL_MAP_MIN_KEY = 'visualMapMin'
  public static readonly VISUAL_MAP_MAX_KEY = 'visualMapMax'
  public static readonly VISUAL_MAP_COLOR_KEY = 'visualMapColor'
  public static readonly VISUAL_MAP_ORIENT_KEY = 'visualMapOrient'
  public static readonly VISUAL_MAP_TYPE_KEY = 'visualMapType'

  constructor(controller: Readonly<QueryController>, scrollEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
    super(controller as QueryController)
    this.scrollEl = scrollEl as HTMLElement
    this.plugin = plugin as BarePlugin
    this.containerEl = this.scrollEl.createDiv({ cls: 'bases-echarts-container' })
    this.chartEl = this.containerEl.createDiv({ cls: 'bases-echarts' })
  }

  onload(): void {
    this.registerEvent(this.app.workspace.on(
      'css-change',
      this.updateChartTheme,
      this,
    ))

    this.resizeObserver = new ResizeObserver((_entries) => {
      this.triggerResize()
    })
    this.resizeObserver.observe(this.containerEl);

    (this as unknown as ItemView).addAction('expand', 'Full Screen', () => {
      this.openFullScreen()
    })
  }

  onunload() {
    this.resizeObserver?.disconnect()
    this.resizeObserver = null
    this.chart?.dispose()
    this.chart = null
  }

  private triggerResize(): void {
    if (this.resizeTimeout !== null) {
      window.clearTimeout(this.resizeTimeout)
    }
    this.resizeTimeout = window.setTimeout(() => {
      this.chart?.resize()
      this.renderChart()
    }, 100)
  }

  onResize(): void {
    this.triggerResize()
  }

  onDataUpdated(): void {
    this.renderChart()
  }

  protected getCommonTransformerOptions(_?: unknown): BaseTransformerOptions {
    const options: BaseTransformerOptions = {
      legend: this.config.get(BaseChartView.LEGEND_KEY) as boolean,
      legendPosition: this.config.get(BaseChartView.LEGEND_POSITION_KEY) as 'top' | 'bottom' | 'left' | 'right',
      legendOrient: this.config.get(BaseChartView.LEGEND_ORIENT_KEY) as 'horizontal' | 'vertical',
      flipAxis: this.config.get(BaseChartView.FLIP_AXIS_KEY) as boolean,
      xAxisLabel: this.config.get(BaseChartView.X_AXIS_LABEL_KEY) as string,
      yAxisLabel: this.config.get(BaseChartView.Y_AXIS_LABEL_KEY) as string,
      xAxisLabelRotate: Number(this.config.get(BaseChartView.X_AXIS_LABEL_ROTATE_KEY) || 0),
      isMobile: Platform.isMobile,
      containerWidth: this.containerEl ? this.containerEl.clientWidth : 0,
    }

    if (this.isFullScreenGeneration) {
      return {
        ...options,
        isMobile: false,
        containerWidth: window.innerWidth,
      }
    }

    return options
  }

  private openFullScreen() {
    this.isFullScreenGeneration = true
    const data = this.data.data as unknown as BasesData
    const option = this.getChartOption(data)
    this.isFullScreenGeneration = false

    if (option) {
      new ChartModal(this.app, option).open()
    }
  }

  protected renderChart(_?: unknown): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    !this.chartEl ? undefined : this.executeRender()
  }

  protected executeRender(_?: unknown): void {
    const height = (this.config.get(BaseChartView.HEIGHT_KEY) as string) || this.plugin.settings.defaultHeight
    this.chartEl.style.height = height

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.chart
      ? this.chart.resize()
      : (this.chart = echarts.init(
          this.chartEl,
          this.getTheme(),
        ))

    const data = this.data.data as unknown as BasesData
    const option = this.getChartOption(data)

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    option
      ? this.chart.setOption(
          option,
          true,
        )
      : this.chart.clear()
  }

  protected abstract getChartOption(data: BasesData): EChartsOption | null

  private readonly updateChartTheme = (): void => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.chart && (
      this.chart.dispose(),
      this.chart = echarts.init(
        this.chartEl,
        this.getTheme(),
      ),
      this.renderChart()
    )
  }

  private getTheme(): string | undefined {
    const chartTheme = this.config.get(BaseChartView.THEME_KEY) as string
    if (chartTheme && chartTheme !== 'default') {
      return chartTheme
    }

    if (this.plugin.settings.selectedTheme) {
      return this.plugin.settings.selectedTheme
    }

    return this.isDarkMode() ? 'dark' : undefined
  }

  private isDarkMode(_?: unknown): boolean {
    return document.body.classList.contains('theme-dark')
  }

  static getCommonViewOptions(plugin?: BarePlugin): ViewOption[] {
    const themeOptions: Record<string, string> = {
      default: 'Default (Global)',
    }

    if (plugin) {
      plugin.settings.customThemes.forEach((t) => {
        themeOptions[t.name] = t.name
      })
    }

    return [
      {
        displayName: 'Theme',
        type: 'dropdown',
        key: BaseChartView.THEME_KEY,
        options: themeOptions,
      } as ViewOption,
      {
        displayName: 'X-Axis Property',
        type: 'property',
        key: BaseChartView.X_AXIS_PROP_KEY,
        placeholder: 'Select category property',
      },
      {
        displayName: 'Y-Axis Property',
        type: 'property',
        key: BaseChartView.Y_AXIS_PROP_KEY,
        placeholder: 'Select value property',
      },
      {
        displayName: 'Series Property (Optional)',
        type: 'property',
        key: BaseChartView.SERIES_PROP_KEY,
        placeholder: 'Select series/group property',
      },
      {
        displayName: 'Show Legend',
        type: 'toggle',
        key: BaseChartView.LEGEND_KEY,
      },
      {
        displayName: 'Legend Position',
        type: 'dropdown',
        key: BaseChartView.LEGEND_POSITION_KEY,
        options: {
          top: 'Top',
          bottom: 'Bottom',
          left: 'Left',
          right: 'Right',
        },
      } as ViewOption,
      {
        displayName: 'Legend Orientation',
        type: 'dropdown',
        key: BaseChartView.LEGEND_ORIENT_KEY,
        options: {
          horizontal: 'Horizontal',
          vertical: 'Vertical',
        },
      } as ViewOption,
      {
        displayName: 'Height',
        type: 'text',
        key: BaseChartView.HEIGHT_KEY,
        placeholder: 'e.g., 500px, 50vh',
      },
    ]
  }

  static getAxisViewOptions(_?: unknown): ViewOption[] {
    return [
      {
        displayName: 'X-Axis Label',
        type: 'text',
        key: BaseChartView.X_AXIS_LABEL_KEY,
        placeholder: 'Override X-Axis label',
      },
      {
        displayName: 'Y-Axis Label',
        type: 'text',
        key: BaseChartView.Y_AXIS_LABEL_KEY,
        placeholder: 'Override Y-Axis label',
      },
      {
        displayName: 'X-Axis Label Rotation',
        type: 'text',
        key: BaseChartView.X_AXIS_LABEL_ROTATE_KEY,
        placeholder: 'Degrees (e.g. 45)',
      },
      {
        displayName: 'Flip Axis',
        type: 'toggle',
        key: BaseChartView.FLIP_AXIS_KEY,
      },
    ]
  }

  static getVisualMapViewOptions(_?: unknown): ViewOption[] {
    return [
      {
        displayName: 'Visual Map Min',
        type: 'text',
        key: BaseChartView.VISUAL_MAP_MIN_KEY,
        placeholder: 'Min value (default: auto)',
      },
      {
        displayName: 'Visual Map Max',
        type: 'text',
        key: BaseChartView.VISUAL_MAP_MAX_KEY,
        placeholder: 'Max value (default: auto)',
      },
      {
        displayName: 'Visual Map Colors',
        type: 'text',
        key: BaseChartView.VISUAL_MAP_COLOR_KEY,
        placeholder: 'Comma-separated hex colors (e.g. #fff,#000)',
      },
      {
        displayName: 'Visual Map Orientation',
        type: 'text', // Ideally a dropdown, but ViewOption only supports basic types? Or use text with validation.
        key: BaseChartView.VISUAL_MAP_ORIENT_KEY,
        placeholder: 'horizontal or vertical (default: horizontal)',
      },
      {
        displayName: 'Visual Map Type',
        type: 'text',
        key: BaseChartView.VISUAL_MAP_TYPE_KEY,
        placeholder: 'continuous or piecewise (default: continuous)',
      },
    ]
  }
}
