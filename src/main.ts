import { Plugin } from 'obsidian';
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
import { PolarBarChartView } from './views/polar-bar-chart-view';

export default class BarePlugin extends Plugin {
	public settings: BarePluginSettings = DEFAULT_SETTINGS;


	async onload() {
		await this.loadSettings();

		this.registerBasesView(
			'treemap-chart',
			{
				name: 'Treemap',
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
				name: 'Bar Chart',
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
				name: 'Line Chart',
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
				name: 'Lines Chart',
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
				name: 'Pie Chart',
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
				name: 'Rose Chart',
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
				name: 'Pictorial Bar Chart',
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
				name: 'Stacked Bar Chart',
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
				name: 'Area Chart',
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
				name: 'Scatter Chart',
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
				name: 'Effect Scatter Chart',
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
				name: 'Bubble Chart',
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
				name: 'Radar Chart',
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
				name: 'Funnel Chart',
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
				name: 'Gauge Chart',
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
				name: 'Heatmap',
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
				name: 'Candlestick Chart',
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
				name: 'Boxplot Chart',
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
				name: 'Sankey Chart',
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
				name: 'Graph Chart',
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
				name: 'Sunburst Chart',
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
				name: 'Tree Chart',
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
				name: 'ThemeRiver Chart',
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
				name: 'Calendar Chart',
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
				name: 'Parallel Chart',
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
				name: 'Gantt Chart',
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
				name: 'Waterfall Chart',
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
				name: 'Pareto Chart',
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
				name: 'Histogram Chart',
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
				name: 'Bullet Chart',
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
				name: 'Radial Bar Chart',
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
				name: 'Polar Line Chart',
				icon: 'activity',
				factory: (controller, containerEl) => new PolarLineChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => PolarLineChartView.getViewOptions(),
			},
		);

		this.registerBasesView(
			'polar-bar-chart',
			{
				name: 'Polar Bar Chart',
				icon: 'bar-chart-2',
				factory: (controller, containerEl) => new PolarBarChartView(
					controller,
					containerEl,
					this,
				),
				options: (_?: unknown) => PolarBarChartView.getViewOptions(),
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
