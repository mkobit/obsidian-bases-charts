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
import { t } from '../lang/text'

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

    const data = this.data.data as unknown as BasesData

    // Handle Empty State
    if (!data || data.length === 0) {
      this.chart?.dispose()
      this.chart = null
      this.chartEl.empty()
      this.chartEl.createDiv({
        cls: 'bases-chart-no-data',
        text: t('views.common.no_data'),
      })
      return
    }

    // Ensure chart container is clear of text if it was previously empty
    if (this.chartEl.innerText === t('views.common.no_data')) {
      this.chartEl.empty()
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.chart
      ? this.chart.resize()
      : (this.chart = echarts.init(
          this.chartEl,
          this.getTheme(),
        ))

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
    // Re-register theme to capture any CSS variable changes
    this.registerObsidianTheme()

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

    // Register and return our dynamic Obsidian theme
    this.registerObsidianTheme()
    return 'obsidian-theme'
  }

  private registerObsidianTheme(): void {
    const getVar = (name: string): string =>
      getComputedStyle(document.body).getPropertyValue(name).trim()

    const textColor = getVar('--text-normal')
    const axisLineColor = getVar('--background-modifier-border')
    const splitLineColor = getVar('--background-modifier-border')
    const fontFamily = getVar('--font-interface')
    const faintColor = getVar('--text-faint')
    const accentColor = getVar('--interactive-accent')
    const errorColor = getVar('--text-error')
    const successColor = getVar('--text-success')

    const theme = {
      color: [
        getVar('--color-red'),
        getVar('--color-orange'),
        getVar('--color-yellow'),
        getVar('--color-green'),
        getVar('--color-cyan'),
        getVar('--color-blue'),
        getVar('--color-purple'),
        getVar('--color-pink'),
      ],
      textStyle: {
        fontFamily: fontFamily || 'sans-serif',
        color: textColor,
      },
      title: {
        textStyle: {
          color: textColor,
        },
      },
      line: {
        itemStyle: {
          borderWidth: 1,
        },
        lineStyle: {
          width: 2,
        },
        symbolSize: 4,
        symbol: 'emptyCircle',
        smooth: false,
      },
      radar: {
        itemStyle: {
          borderWidth: 1,
        },
        lineStyle: {
          width: 2,
        },
        symbolSize: 4,
        symbol: 'emptyCircle',
        smooth: false,
      },
      bar: {
        itemStyle: {
          barBorderWidth: 0,
          barBorderColor: faintColor,
        },
      },
      pie: {
        itemStyle: {
          borderWidth: 0,
          borderColor: faintColor,
        },
      },
      scatter: {
        itemStyle: {
          borderWidth: 0,
          borderColor: faintColor,
        },
      },
      boxplot: {
        itemStyle: {
          borderWidth: 0,
          borderColor: faintColor,
        },
      },
      parallel: {
        itemStyle: {
          borderWidth: 0,
          borderColor: faintColor,
        },
      },
      sankey: {
        itemStyle: {
          borderWidth: 0,
          borderColor: faintColor,
        },
      },
      funnel: {
        itemStyle: {
          borderWidth: 0,
          borderColor: faintColor,
        },
      },
      gauge: {
        itemStyle: {
          borderWidth: 0,
          borderColor: faintColor,
        },
      },
      candlestick: {
        itemStyle: {
          color: errorColor,
          color0: successColor,
          borderColor: errorColor,
          borderColor0: successColor,
          borderWidth: 1,
        },
      },
      graph: {
        itemStyle: {
          borderWidth: 0,
          borderColor: faintColor,
        },
        lineStyle: {
          width: 1,
          color: axisLineColor,
        },
        symbolSize: 4,
        symbol: 'emptyCircle',
        smooth: false,
        label: {
          color: textColor,
        },
      },
      map: {
        itemStyle: {
          areaColor: getVar('--background-primary-alt'),
          borderColor: axisLineColor,
          borderWidth: 0.5,
        },
        label: {
          color: textColor,
        },
        emphasis: {
          itemStyle: {
            areaColor: getVar('--background-modifier-hover'),
            borderColor: axisLineColor,
            borderWidth: 1,
          },
          label: {
            color: accentColor,
          },
        },
      },
      geo: {
        itemStyle: {
          areaColor: getVar('--background-primary-alt'),
          borderColor: axisLineColor,
          borderWidth: 0.5,
        },
        label: {
          color: textColor,
        },
        emphasis: {
          itemStyle: {
            areaColor: getVar('--background-modifier-hover'),
            borderColor: axisLineColor,
            borderWidth: 1,
          },
          label: {
            color: accentColor,
          },
        },
      },
      categoryAxis: {
        axisLine: {
          show: true,
          lineStyle: {
            color: axisLineColor,
          },
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: axisLineColor,
          },
        },
        axisLabel: {
          show: true,
          color: textColor,
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: [splitLineColor],
          },
        },
        splitArea: {
          show: false,
          areaStyle: {
            color: [
              getVar('--background-primary'),
              getVar('--background-secondary'),
            ],
          },
        },
      },
      valueAxis: {
        axisLine: {
          show: false,
          lineStyle: {
            color: axisLineColor,
          },
        },
        axisTick: {
          show: false,
          lineStyle: {
            color: axisLineColor,
          },
        },
        axisLabel: {
          show: true,
          color: textColor,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: [splitLineColor],
          },
        },
        splitArea: {
          show: false,
          areaStyle: {
            color: [
              getVar('--background-primary'),
              getVar('--background-secondary'),
            ],
          },
        },
      },
      logAxis: {
        axisLine: {
          show: true,
          lineStyle: {
            color: axisLineColor,
          },
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: axisLineColor,
          },
        },
        axisLabel: {
          show: true,
          color: textColor,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: [splitLineColor],
          },
        },
        splitArea: {
          show: false,
          areaStyle: {
            color: [
              getVar('--background-primary'),
              getVar('--background-secondary'),
            ],
          },
        },
      },
      timeAxis: {
        axisLine: {
          show: true,
          lineStyle: {
            color: axisLineColor,
          },
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: axisLineColor,
          },
        },
        axisLabel: {
          show: true,
          color: textColor,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: [splitLineColor],
          },
        },
        splitArea: {
          show: false,
          areaStyle: {
            color: [
              getVar('--background-primary'),
              getVar('--background-secondary'),
            ],
          },
        },
      },
      toolbox: {
        iconStyle: {
          borderColor: faintColor,
        },
        emphasis: {
          iconStyle: {
            borderColor: textColor,
          },
        },
      },
      legend: {
        textStyle: {
          color: textColor,
        },
      },
      tooltip: {
        axisPointer: {
          lineStyle: {
            color: faintColor,
            width: 1,
          },
          crossStyle: {
            color: faintColor,
            width: 1,
          },
        },
        backgroundColor: getVar('--background-secondary'),
        borderColor: getVar('--background-modifier-border'),
        textStyle: {
          color: textColor,
        },
      },
      timeline: {
        lineStyle: {
          color: axisLineColor,
          width: 2,
        },
        itemStyle: {
          color: faintColor,
          borderWidth: 1,
        },
        controlStyle: {
          color: faintColor,
          borderColor: faintColor,
          borderWidth: 1,
        },
        checkpointStyle: {
          color: accentColor,
          borderColor: textColor,
        },
        label: {
          color: faintColor,
        },
        emphasis: {
          itemStyle: {
            color: textColor,
          },
          controlStyle: {
            color: faintColor,
            borderColor: faintColor,
            borderWidth: 1,
          },
          label: {
            color: faintColor,
          },
        },
      },
      visualMap: {
        color: [
          getVar('--color-red'),
          getVar('--color-yellow'),
        ],
      },
      dataZoom: {
        handleSize: 'undefined%',
        textStyle: {
          color: faintColor,
        },
      },
      markPoint: {
        label: {
          color: textColor,
        },
        emphasis: {
          label: {
            color: textColor,
          },
        },
      },
    }

    echarts.registerTheme('obsidian-theme', theme)
  }

  private isDarkMode(_?: unknown): boolean {
    return document.body.classList.contains('theme-dark')
  }

  static getCommonViewOptions(plugin?: BarePlugin): ViewOption[] {
    const themeOptions: Record<string, string> = {
      default: t('views.common.theme_default'),
    }

    if (plugin) {
      plugin.settings.customThemes.forEach((t) => {
        themeOptions[t.name] = t.name
      })
    }

    return [
      {
        displayName: t('views.common.theme'),
        type: 'dropdown',
        key: BaseChartView.THEME_KEY,
        options: themeOptions,
      } as ViewOption,
      {
        displayName: t('views.common.x_axis_prop'),
        type: 'property',
        key: BaseChartView.X_AXIS_PROP_KEY,
        placeholder: t('views.common.x_axis_prop_placeholder'),
      },
      {
        displayName: t('views.common.y_axis_prop'),
        type: 'property',
        key: BaseChartView.Y_AXIS_PROP_KEY,
        placeholder: t('views.common.y_axis_prop_placeholder'),
      },
      {
        displayName: t('views.common.series_prop'),
        type: 'property',
        key: BaseChartView.SERIES_PROP_KEY,
        placeholder: t('views.common.series_prop_placeholder'),
      },
      {
        displayName: t('views.common.show_legend'),
        type: 'toggle',
        key: BaseChartView.LEGEND_KEY,
      },
      {
        displayName: t('views.common.legend_position'),
        type: 'dropdown',
        key: BaseChartView.LEGEND_POSITION_KEY,
        options: {
          top: t('views.common.legend_position_options.top'),
          bottom: t('views.common.legend_position_options.bottom'),
          left: t('views.common.legend_position_options.left'),
          right: t('views.common.legend_position_options.right'),
        },
      } as ViewOption,
      {
        displayName: t('views.common.legend_orient'),
        type: 'dropdown',
        key: BaseChartView.LEGEND_ORIENT_KEY,
        options: {
          horizontal: t('views.common.legend_orient_options.horizontal'),
          vertical: t('views.common.legend_orient_options.vertical'),
        },
      } as ViewOption,
      {
        displayName: t('views.common.height'),
        type: 'text',
        key: BaseChartView.HEIGHT_KEY,
        placeholder: t('views.common.height_placeholder'),
      },
    ]
  }

  static getAxisViewOptions(_?: unknown): ViewOption[] {
    return [
      {
        displayName: t('views.axis.x_label'),
        type: 'text',
        key: BaseChartView.X_AXIS_LABEL_KEY,
        placeholder: t('views.axis.x_label_placeholder'),
      },
      {
        displayName: t('views.axis.y_label'),
        type: 'text',
        key: BaseChartView.Y_AXIS_LABEL_KEY,
        placeholder: t('views.axis.y_label_placeholder'),
      },
      {
        displayName: t('views.axis.x_rotate'),
        type: 'text',
        key: BaseChartView.X_AXIS_LABEL_ROTATE_KEY,
        placeholder: t('views.axis.x_rotate_placeholder'),
      },
      {
        displayName: t('views.axis.flip'),
        type: 'toggle',
        key: BaseChartView.FLIP_AXIS_KEY,
      },
    ]
  }

  static getVisualMapViewOptions(_?: unknown): ViewOption[] {
    return [
      {
        displayName: t('views.visual_map.min'),
        type: 'text',
        key: BaseChartView.VISUAL_MAP_MIN_KEY,
        placeholder: t('views.visual_map.min_placeholder'),
      },
      {
        displayName: t('views.visual_map.max'),
        type: 'text',
        key: BaseChartView.VISUAL_MAP_MAX_KEY,
        placeholder: t('views.visual_map.max_placeholder'),
      },
      {
        displayName: t('views.visual_map.colors'),
        type: 'text',
        key: BaseChartView.VISUAL_MAP_COLOR_KEY,
        placeholder: t('views.visual_map.colors_placeholder'),
      },
      {
        displayName: t('views.visual_map.orient'),
        type: 'text', // Ideally a dropdown, but ViewOption only supports basic types? Or use text with validation.
        key: BaseChartView.VISUAL_MAP_ORIENT_KEY,
        placeholder: t('views.visual_map.orient_placeholder'),
      },
      {
        displayName: t('views.visual_map.type'),
        type: 'text',
        key: BaseChartView.VISUAL_MAP_TYPE_KEY,
        placeholder: t('views.visual_map.type_placeholder'),
      },
    ]
  }
}
