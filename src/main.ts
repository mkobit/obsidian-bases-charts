import { Plugin } from 'obsidian';
import { initTranslations, t } from './lang/i18n';
import type { BarePluginSettings } from './settings';
import { DEFAULT_SETTINGS, SettingTab } from './settings';
import { BarChartView } from './views/bar-chart-view';
import { LineChartView } from './views/line-chart-view';
import { LinesChartView } from './views/lines-chart-view';
import { PieChartView } from './views/pie-chart-view';
import { StackedBarChartView } from './views/stacked-bar-chart-view';
import { AreaChartView } from './views/area-chart-view';
import { ScatterChartView } from './views/scatter-chart-view';
import { EffectScatterChartView } from './views/effect-scatter-chart-view';
import { BubbleChartView } from './views/bubble-chart-view';
import { RadarChartView } from './views/radar-chart-view';
import { FunnelChartView } from './views/funnel-chart-view';
import { GaugeChartView } from './views/gauge-chart-view';
import { HeatmapChartView } from './views/heatmap-chart-view';
import { CandlestickChartView } from './views/candlestick-chart-view';
import { TreemapChartView } from './views/treemap-chart-view';
import { BoxplotChartView } from './views/boxplot-chart-view';
import { SankeyChartView } from './views/sankey-chart-view';
import { GraphChartView } from './views/graph-chart-view';
import { SunburstChartView } from './views/sunburst-chart-view';
import { TreeChartView } from './views/tree-chart-view';
import { ThemeRiverChartView } from './views/theme-river-chart-view';
import { CalendarChartView } from './views/calendar-chart-view';
import { ParallelChartView } from './views/parallel-chart-view';
import { RoseChartView } from './views/rose-chart-view';
import { PictorialBarChartView } from './views/pictorial-bar-chart-view';
import { GanttChartView } from './views/gantt-chart-view';
import { WaterfallChartView } from './views/waterfall-chart-view';
import { ParetoChartView } from './views/pareto-chart-view';
import { HistogramChartView } from './views/histogram-chart-view';
import { BulletChartView } from './views/bullet-chart-view';
import { RadialBarChartView } from './views/radial-bar-chart-view';
import { PolarLineChartView } from './views/polar-line-chart-view';

export default class BarePlugin extends Plugin {
	public settings: BarePluginSettings = DEFAULT_SETTINGS;


	async onload() {
		await this.loadSettings();
		initTranslations();

		this.registerBasesView(
			'treemap-chart',
			{
				name: t('charts.treemap'),
				icon: 'layout-grid',
				factory: (controller, containerEl) => new TreemapChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => TreemapChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'bar-chart',
			{
				name: t('charts.bar'),
				icon: 'bar-chart',
				factory: (controller, containerEl) => new BarChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => BarChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'line-chart',
			{
				name: t('charts.line'),
				icon: 'activity',
				factory: (controller, containerEl) => new LineChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => LineChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'lines-chart',
			{
				name: t('charts.lines'),
				icon: 'route', // Using route icon if available, or similar
				factory: (controller, containerEl) => new LinesChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => LinesChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'pie-chart',
			{
				name: t('charts.pie'),
				icon: 'pie-chart',
				factory: (controller, containerEl) => new PieChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => PieChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'rose-chart',
			{
				name: t('charts.rose'),
				icon: 'aperture',
				factory: (controller, containerEl) => new RoseChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => RoseChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'pictorial-bar-chart',
			{
				name: t('charts.pictorial_bar'),
				icon: 'image',
				factory: (controller, containerEl) => new PictorialBarChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => PictorialBarChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'stacked-bar-chart',
			{
				name: t('charts.stacked_bar'),
				icon: 'bar-chart-2', // Using a variation of bar chart icon
				factory: (controller, containerEl) => new StackedBarChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => StackedBarChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'area-chart',
			{
				name: t('charts.area'),
				icon: 'mountain', // Often used for area charts or similar
				factory: (controller, containerEl) => new AreaChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => AreaChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'scatter-chart',
			{
				name: t('charts.scatter'),
				icon: 'crosshair', // or dot-network
				factory: (controller, containerEl) => new ScatterChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => ScatterChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'effect-scatter-chart',
			{
				name: t('charts.effect_scatter'),
				icon: 'disc', // Similar to scatter but with effects
				factory: (controller, containerEl) => new EffectScatterChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => EffectScatterChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'bubble-chart',
			{
				name: t('charts.bubble'),
				icon: 'circle',
				factory: (controller, containerEl) => new BubbleChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => BubbleChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'radar-chart',
			{
				name: t('charts.radar'),
				icon: 'hexagon',
				factory: (controller, containerEl) => new RadarChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => RadarChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'funnel-chart',
			{
				name: t('charts.funnel'),
				icon: 'filter',
				factory: (controller, containerEl) => new FunnelChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => FunnelChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'gauge-chart',
			{
				name: t('charts.gauge'),
				icon: 'gauge',
				factory: (controller, containerEl) => new GaugeChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => GaugeChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'heatmap-chart',
			{
				name: t('charts.heatmap'),
				icon: 'grid',
				factory: (controller, containerEl) => new HeatmapChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => HeatmapChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'candlestick-chart',
			{
				name: t('charts.candlestick'),
				icon: 'bar-chart', // Using bar-chart as placeholder or we could find a better one
				factory: (controller, containerEl) => new CandlestickChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => CandlestickChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'boxplot-chart',
			{
				name: t('charts.boxplot'),
				icon: 'box-select', // Using box-select from lucide
				factory: (controller, containerEl) => new BoxplotChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => BoxplotChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'sankey-chart',
			{
				name: t('charts.sankey'),
				icon: 'git-merge', // Using git-merge as it represents flow/splitting
				factory: (controller, containerEl) => new SankeyChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => SankeyChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'graph-chart',
			{
				name: t('charts.graph'),
				icon: 'git-fork', // Using git-fork for graph/network
				factory: (controller, containerEl) => new GraphChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => GraphChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'sunburst-chart',
			{
				name: t('charts.sunburst'),
				icon: 'disc',
				factory: (controller, containerEl) => new SunburstChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => SunburstChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'tree-chart',
			{
				name: t('charts.tree'),
				icon: 'network',
				factory: (controller, containerEl) => new TreeChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => TreeChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'theme-river-chart',
			{
				name: t('charts.theme_river'),
				icon: 'waves',
				factory: (controller, containerEl) => new ThemeRiverChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => ThemeRiverChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'calendar-chart',
			{
				name: t('charts.calendar'),
				icon: 'calendar',
				factory: (controller, containerEl) => new CalendarChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => CalendarChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'parallel-chart',
			{
				name: t('charts.parallel'),
				icon: 'sliders-horizontal',
				factory: (controller, containerEl) => new ParallelChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => ParallelChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'gantt-chart',
			{
				name: t('charts.gantt'),
				icon: 'calendar-clock',
				factory: (controller, containerEl) => new GanttChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => GanttChartView.getViewOptions(this),
			},
		);

		this.registerBasesView(
			'waterfall-chart',
			{
				name: t('charts.waterfall'),
				icon: 'trending-down',
				factory: (controller, containerEl) => new WaterfallChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => WaterfallChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'pareto-chart',
			{
				name: t('charts.pareto'),
				icon: 'bar-chart-horizontal',
				factory: (controller, containerEl) => new ParetoChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => ParetoChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'histogram-chart',
			{
				name: t('charts.histogram'),
				icon: 'bar-chart-big',
				factory: (controller, containerEl) => new HistogramChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => HistogramChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'bullet-chart',
			{
				name: t('charts.bullet'),
				icon: 'crosshair',
				factory: (controller, containerEl) => new BulletChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => BulletChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'radial-bar-chart',
			{
				name: t('charts.radial_bar'),
				icon: 'circle-dot',
				factory: (controller, containerEl) => new RadialBarChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => RadialBarChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'polar-line-chart',
			{
				name: t('charts.polar_line'),
				icon: 'activity',
				factory: (controller, containerEl) => new PolarLineChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => PolarLineChartView.getViewOptions(),
			},
		);

		this.addSettingTab(new SettingTab(
			this.app,
			this,
		));
	}


	onunload() {}

	async loadSettings(_?: unknown) {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData() as Partial<BarePluginSettings>,
		);
	}

	async saveSettings(_?: unknown) {
		await this.saveData(this.settings);
	}
}
