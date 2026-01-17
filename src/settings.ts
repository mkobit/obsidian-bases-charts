/* eslint-disable obsidianmd/ui/sentence-case */
import type { App } from 'obsidian'
import { PluginSettingTab, Setting, Notice } from 'obsidian'
import i18next from 'i18next'
import type BarePlugin from './main'

export interface BarePluginSettings {
  mySetting: string
  defaultHeight: string
  customThemeJson: string
}

export const DEFAULT_SETTINGS: BarePluginSettings = {
  mySetting: 'default',
  defaultHeight: '500px',
  customThemeJson: '',
}

export class SettingTab extends PluginSettingTab {
  plugin: BarePlugin

  constructor(app: Readonly<App>, plugin: Readonly<BarePlugin>) {
    super(
      app as App,
      plugin as BarePlugin,
    )
    this.plugin = plugin as BarePlugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    new Setting(containerEl)
      .setName('Default chart height')
      .setDesc('The default height for charts (e.g. 500px, 50vh).')
      .addText(text => text
        .setPlaceholder('500px')
        .setValue(this.plugin.settings.defaultHeight)
        .onChange(async (value) => {
          this.plugin.settings.defaultHeight = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName(i18next.t('settings.custom_theme.name'))
      .setDesc(i18next.t('settings.custom_theme.desc'))
      .addTextArea(text => text
        .setPlaceholder(i18next.t('settings.custom_theme.placeholder'))
        .setValue(this.plugin.settings.customThemeJson)
        .onChange(async (value) => {
          // Simple validation
          if (value.trim()) {
            try {
              JSON.parse(value)
            }
            catch {
              new Notice('Invalid JSON provided for ECharts theme.')
            }
          }

          this.plugin.settings.customThemeJson = value
          await this.plugin.saveSettings()
        }))
  }
}
