import { Plugin } from 'obsidian'
import type { BarePluginSettings } from './settings'
import { DEFAULT_SETTINGS, SettingTab } from './settings'
import { BarChartView } from './views/bar-chart-view'
import { LineChartView } from './views/line-chart-view'
import { LinesChartView } from './views/lines-chart-view'
import { PieChartView } from './views/pie-chart-view'
import { StackedBarChartView } from './views/stacked-bar-chart-view'
import { AreaChartView } from './views/area-chart-view'
import { ScatterChartView } from './views/scatter-chart-view'
import { EffectScatterChartView } from './views/effect-scatter-chart-view'
import { BubbleChartView } from './views/bubble-chart-view'
import { RadarChartView } from './views/radar-chart-view'
import { FunnelChartView } from './views/funnel-chart-view'
import { GaugeChartView } from './views/gauge-chart-view'
import { HeatmapChartView } from './views/heatmap-chart-view'
import { CandlestickChartView } from './views/candlestick-chart-view'
import { TreemapChartView } from './views/treemap-chart-view'
import { BoxplotChartView } from './views/boxplot-chart-view'
import { SankeyChartView } from './views/sankey-chart-view'
import { GraphChartView } from './views/graph-chart-view'
import { SunburstChartView } from './views/sunburst-chart-view'
import { TreeChartView } from './views/tree-chart-view'
import { ThemeRiverChartView } from './views/theme-river-chart-view'
import { CalendarChartView } from './views/calendar-chart-view'
import { ParallelChartView } from './views/parallel-chart-view'
import { RoseChartView } from './views/rose-chart-view'
import { PictorialBarChartView } from './views/pictorial-bar-chart-view'
import { GanttChartView } from './views/gantt-chart-view'
import { WaterfallChartView } from './views/waterfall-chart-view'
import { ParetoChartView } from './views/pareto-chart-view'
import { HistogramChartView } from './views/histogram-chart-view'
import { BulletChartView } from './views/bullet-chart-view'
import { RadialBarChartView } from './views/radial-bar-chart-view'
import { PolarLineChartView } from './views/polar-line-chart-view'
import { PolarBarChartView } from './views/polar-bar-chart-view'
import { PolarScatterChartView } from './views/polar-scatter-chart-view'
import { MapChartView } from './views/map-chart-view'
import { WordCloudChartView } from './views/word-cloud-chart-view'
// import { LiquidChartView } from './views/liquid-chart-view'
import { initializeI18n } from './lang/i18n'
import i18next from 'i18next'

export default class BarePlugin extends Plugin {
  public settings: BarePluginSettings = DEFAULT_SETTINGS

  async onload() {
    await this.loadSettings()
    await initializeI18n()

    this.registerBasesView(
      'treemap-chart',
      {
        name: i18next.t('views.treemap.name'),
        icon: 'layout-grid',
        factory: (controller, containerEl) => new TreemapChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => TreemapChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'bar-chart',
      {
        name: i18next.t('views.bar.name'),
        icon: 'bar-chart',
        factory: (controller, containerEl) => new BarChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => BarChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'line-chart',
      {
        name: i18next.t('views.line.name'),
        icon: 'activity',
        factory: (controller, containerEl) => new LineChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => LineChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'lines-chart',
      {
        name: i18next.t('views.lines.name'),
        icon: 'route', // Using route icon if available, or similar
        factory: (controller, containerEl) => new LinesChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => LinesChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'pie-chart',
      {
        name: i18next.t('views.pie.name'),
        icon: 'pie-chart',
        factory: (controller, containerEl) => new PieChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => PieChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'rose-chart',
      {
        name: i18next.t('views.rose.name'),
        icon: 'aperture',
        factory: (controller, containerEl) => new RoseChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => RoseChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'pictorial-bar-chart',
      {
        name: i18next.t('views.pictorial_bar.name'),
        icon: 'image',
        factory: (controller, containerEl) => new PictorialBarChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => PictorialBarChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'stacked-bar-chart',
      {
        name: i18next.t('views.stacked_bar.name'),
        icon: 'bar-chart-2', // Using a variation of bar chart icon
        factory: (controller, containerEl) => new StackedBarChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => StackedBarChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'area-chart',
      {
        name: i18next.t('views.area.name'),
        icon: 'mountain', // Often used for area charts or similar
        factory: (controller, containerEl) => new AreaChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => AreaChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'scatter-chart',
      {
        name: i18next.t('views.scatter.name'),
        icon: 'crosshair', // or dot-network
        factory: (controller, containerEl) => new ScatterChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => ScatterChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'effect-scatter-chart',
      {
        name: i18next.t('views.effect_scatter.name'),
        icon: 'disc', // Similar to scatter but with effects
        factory: (controller, containerEl) => new EffectScatterChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => EffectScatterChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'bubble-chart',
      {
        name: i18next.t('views.bubble.name'),
        icon: 'circle',
        factory: (controller, containerEl) => new BubbleChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => BubbleChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'radar-chart',
      {
        name: i18next.t('views.radar.name'),
        icon: 'hexagon',
        factory: (controller, containerEl) => new RadarChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => RadarChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'funnel-chart',
      {
        name: i18next.t('views.funnel.name'),
        icon: 'filter',
        factory: (controller, containerEl) => new FunnelChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => FunnelChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'gauge-chart',
      {
        name: i18next.t('views.gauge.name'),
        icon: 'gauge',
        factory: (controller, containerEl) => new GaugeChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => GaugeChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'heatmap-chart',
      {
        name: i18next.t('views.heatmap.name'),
        icon: 'grid',
        factory: (controller, containerEl) => new HeatmapChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => HeatmapChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'candlestick-chart',
      {
        name: i18next.t('views.candlestick.name'),
        icon: 'bar-chart', // Using bar-chart as placeholder or we could find a better one
        factory: (controller, containerEl) => new CandlestickChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => CandlestickChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'boxplot-chart',
      {
        name: i18next.t('views.boxplot.name'),
        icon: 'box-select', // Using box-select from lucide
        factory: (controller, containerEl) => new BoxplotChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => BoxplotChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'sankey-chart',
      {
        name: i18next.t('views.sankey.name'),
        icon: 'git-merge', // Using git-merge as it represents flow/splitting
        factory: (controller, containerEl) => new SankeyChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => SankeyChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'graph-chart',
      {
        name: i18next.t('views.graph.name'),
        icon: 'git-fork', // Using git-fork for graph/network
        factory: (controller, containerEl) => new GraphChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => GraphChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'sunburst-chart',
      {
        name: i18next.t('views.sunburst.name'),
        icon: 'disc',
        factory: (controller, containerEl) => new SunburstChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => SunburstChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'tree-chart',
      {
        name: i18next.t('views.tree.name'),
        icon: 'network',
        factory: (controller, containerEl) => new TreeChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => TreeChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'theme-river-chart',
      {
        name: i18next.t('views.theme_river.name'),
        icon: 'waves',
        factory: (controller, containerEl) => new ThemeRiverChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => ThemeRiverChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'calendar-chart',
      {
        name: i18next.t('views.calendar.name'),
        icon: 'calendar',
        factory: (controller, containerEl) => new CalendarChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => CalendarChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'parallel-chart',
      {
        name: i18next.t('views.parallel.name'),
        icon: 'sliders-horizontal',
        factory: (controller, containerEl) => new ParallelChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => ParallelChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'gantt-chart',
      {
        name: i18next.t('views.gantt.name'),
        icon: 'calendar-clock',
        factory: (controller, containerEl) => new GanttChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => GanttChartView.getViewOptions(this),
      },
    )

    this.registerBasesView(
      'waterfall-chart',
      {
        name: i18next.t('views.waterfall.name'),
        icon: 'trending-down',
        factory: (controller, containerEl) => new WaterfallChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => WaterfallChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'pareto-chart',
      {
        name: i18next.t('views.pareto.name'),
        icon: 'bar-chart-horizontal',
        factory: (controller, containerEl) => new ParetoChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => ParetoChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'histogram-chart',
      {
        name: i18next.t('views.histogram.name'),
        icon: 'bar-chart-big',
        factory: (controller, containerEl) => new HistogramChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => HistogramChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'bullet-chart',
      {
        name: i18next.t('views.bullet.name'),
        icon: 'crosshair',
        factory: (controller, containerEl) => new BulletChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => BulletChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'radial-bar-chart',
      {
        name: i18next.t('views.radial_bar.name'),
        icon: 'circle-dot',
        factory: (controller, containerEl) => new RadialBarChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => RadialBarChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'polar-line-chart',
      {
        name: i18next.t('views.polar_line.name'),
        icon: 'activity',
        factory: (controller, containerEl) => new PolarLineChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => PolarLineChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'polar-bar-chart',
      {
        name: i18next.t('views.polar_bar.name'),
        icon: 'bar-chart-2',
        factory: (controller, containerEl) => new PolarBarChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => PolarBarChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'polar-scatter-chart',
      {
        name: i18next.t('views.polar_scatter.name'),
        icon: 'crosshair',
        factory: (controller, containerEl) => new PolarScatterChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => PolarScatterChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'map-chart',
      {
        name: i18next.t('views.map.name'),
        icon: 'map',
        factory: (controller, containerEl) => new MapChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => MapChartView.getViewOptions(),
      },
    )

    this.registerBasesView(
      'word-cloud-chart',
      {
        name: i18next.t('views.word_cloud.name'),
        icon: 'cloud',
        factory: (controller, containerEl) => new WordCloudChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => WordCloudChartView.getViewOptions(),
      },
    )

    /*
    this.registerBasesView(
      'liquid-chart',
      {
        name: i18next.t('views.liquid.name'),
        icon: 'droplet',
        factory: (controller, containerEl) => new LiquidChartView(
          controller,
          containerEl,
          this,
        ),
        options: (_?: unknown) => LiquidChartView.getViewOptions(),
      },
    )
    */

    this.addSettingTab(new SettingTab(
      this.app,
      this,
    ))
  }

  onunload() {}

  async loadSettings(_?: unknown) {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData() as Partial<BarePluginSettings>,
    )
  }

  async saveSettings(_?: unknown) {
    await this.saveData(this.settings)
  }
}
