import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, BarePluginSettings, SettingTab } from "./settings";
import { BarChartView } from './views/bar-chart-view';
import { LineChartView } from './views/line-chart-view';
import { PieChartView } from './views/pie-chart-view';
import { StackedBarChartView } from './views/stacked-bar-chart-view';
import { AreaChartView } from './views/area-chart-view';

export default class BarePlugin extends Plugin {
	settings!: BarePluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerBasesView('bar-chart', {
			name: 'Bar Chart',
			icon: 'bar-chart',
			factory: (controller, containerEl) => new BarChartView(controller, containerEl, this),
			options: () => BarChartView.getViewOptions(),
		});

		this.registerBasesView('line-chart', {
			name: 'Line Chart',
			icon: 'activity',
			factory: (controller, containerEl) => new LineChartView(controller, containerEl, this),
			options: () => LineChartView.getViewOptions(),
		});

		this.registerBasesView('pie-chart', {
			name: 'Pie Chart',
			icon: 'pie-chart',
			factory: (controller, containerEl) => new PieChartView(controller, containerEl, this),
			options: () => PieChartView.getViewOptions(),
		});

		this.registerBasesView('stacked-bar-chart', {
			name: 'Stacked Bar Chart',
			icon: 'bar-chart-2', // Using a variation of bar chart icon
			factory: (controller, containerEl) => new StackedBarChartView(controller, containerEl, this),
			options: () => StackedBarChartView.getViewOptions(),
		});

		this.registerBasesView('area-chart', {
			name: 'Area Chart',
			icon: 'mountain', // Often used for area charts or similar
			factory: (controller, containerEl) => new AreaChartView(controller, containerEl, this),
			options: () => AreaChartView.getViewOptions(),
		});

		this.addSettingTab(new SettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<BarePluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
