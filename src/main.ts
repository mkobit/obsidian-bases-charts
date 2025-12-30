import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, BarePluginSettings, SettingTab } from "./settings";
import { ChartView } from './chart-view';

export default class BarePlugin extends Plugin {
	settings!: BarePluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerBasesView('chart', {
			name: 'Chart',
			icon: 'bar-chart',
			factory: (controller, containerEl) => new ChartView(controller, containerEl, this),
			options: ChartView.getViewOptions,
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
