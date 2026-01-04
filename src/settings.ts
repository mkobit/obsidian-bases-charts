import { App, PluginSettingTab, Setting } from "obsidian";
import BarePlugin from "./main";

export interface BarePluginSettings {
	mySetting: string;
	chartTheme: 'auto' | 'light' | 'dark' | 'custom';
	customThemeDefinition: string;
}

export const DEFAULT_SETTINGS: BarePluginSettings = {
	mySetting: 'default',
	chartTheme: 'auto',
	customThemeDefinition: '{}'
}

export class SettingTab extends PluginSettingTab {
	plugin: BarePlugin;

	constructor(app: App, plugin: BarePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Chart Theme')
			.setDesc('Select the theme to use for charts. "Auto" follows the Obsidian theme (Light/Dark). "Custom" uses the definition below.')
			.addDropdown(dropdown => dropdown
				.addOption('auto', 'Auto')
				.addOption('light', 'Light')
				.addOption('dark', 'Dark')
				.addOption('custom', 'Custom')
				.setValue(this.plugin.settings.chartTheme)
				.onChange(async (value) => {
					this.plugin.settings.chartTheme = value as 'auto' | 'light' | 'dark' | 'custom';
					await this.plugin.saveSettings();
					// Trigger a refresh of charts if possible, or user can reload
					this.plugin.app.workspace.trigger('css-change'); // Pseudo-event to trigger updates
				}));

		new Setting(containerEl)
			.setName('Custom Theme Definition')
			.setDesc('Paste your ECharts JSON theme definition here. Only used if "Chart Theme" is set to "Custom".')
			.addTextArea(text => text
				.setPlaceholder('{"version": 1, "theme": ...}')
				.setValue(this.plugin.settings.customThemeDefinition)
				.onChange(async (value) => {
					this.plugin.settings.customThemeDefinition = value;
					await this.plugin.saveSettings();
				}));
	}
}
