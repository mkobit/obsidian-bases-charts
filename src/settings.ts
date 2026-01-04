import { App, PluginSettingTab, Setting } from "obsidian";
import BarePlugin from "./main";

export interface BarePluginSettings {
	mySetting: string;
	defaultHeight?: string;
}

export const DEFAULT_SETTINGS: BarePluginSettings = {
	mySetting: 'default',
	defaultHeight: '500px'
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
			.setName('Setting #1')
			.setDesc('A secret setting')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default chart height')
			.setDesc('The default height for charts (e.g. 500px)')
			.addText(text => text
				.setPlaceholder('500px')
				.setValue(this.plugin.settings.defaultHeight || '500px')
				.onChange(async (value) => {
					this.plugin.settings.defaultHeight = value;
					await this.plugin.saveSettings();
				}));
	}
}
