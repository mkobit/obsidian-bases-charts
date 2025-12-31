import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, BarePluginSettings, SettingTab } from "./settings";
import { BarChartView } from './views/bar-chart-view';
import { LineChartView } from './views/line-chart-view';

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
			icon: 'activity', // Using 'activity' as a proxy for line chart icon if generic 'chart' is too broad, or just 'chart-line' if available. E.g. 'activity' is standard Lucide.
			factory: (controller, containerEl) => new LineChartView(controller, containerEl, this),
			options: () => LineChartView.getViewOptions(),
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
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
