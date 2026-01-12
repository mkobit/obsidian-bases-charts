import type { App } from 'obsidian';
import { PluginSettingTab, Setting } from 'obsidian';
import { t } from './lang/i18n';
import type BarePlugin from './main';

export interface BarePluginSettings {
	mySetting: string;
	defaultHeight: string;
}

export const DEFAULT_SETTINGS: BarePluginSettings = {
	mySetting: 'default',
	defaultHeight: '500px',
};

export class SettingTab extends PluginSettingTab {
	plugin: BarePlugin;

	constructor(app: Readonly<App>, plugin: Readonly<BarePlugin>) {
		super(
			app as App,
			plugin as BarePlugin,
		);
		this.plugin = plugin as BarePlugin;
	}


	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName(t('settings.default_height'))
			.setDesc(t('settings.default_height_desc'))
			.addText(text => text
				.setPlaceholder('500px')
				.setValue(this.plugin.settings.defaultHeight)
				.onChange(async (value) => {
					this.plugin.settings.defaultHeight = value;
					await this.plugin.saveSettings();
				}));
	}
}
