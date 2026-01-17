import type { App } from 'obsidian'
import { PluginSettingTab, Setting, Notice } from 'obsidian'
import i18next from 'i18next'
import type BarePlugin from './main'
import { validateTheme } from './theme-validation'

export interface CustomTheme {
  name: string
  json: string
}

export interface BarePluginSettings {
  mySetting: string
  defaultHeight: string
  customThemes: CustomTheme[]
  selectedTheme: string
}

export const DEFAULT_SETTINGS: BarePluginSettings = {
  mySetting: 'default',
  defaultHeight: '500px',
  customThemes: [],
  selectedTheme: '',
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

    // Global Theme Selection
    new Setting(containerEl)
      .setName(i18next.t('settings.global_theme.name'))
      .setDesc(i18next.t('settings.global_theme.desc'))
      .addDropdown((dropdown) => {
        dropdown.addOption('', i18next.t('settings.global_theme.default_option'))
        this.plugin.settings.customThemes.forEach((theme) => {
          dropdown.addOption(theme.name, theme.name)
        })
        dropdown.setValue(this.plugin.settings.selectedTheme)
        dropdown.onChange(async (value) => {
          this.plugin.settings.selectedTheme = value
          await this.plugin.saveSettings()
        })
      })

    new Setting(containerEl).setName(i18next.t('settings.custom_themes.title')).setHeading()

    // List existing custom themes
    this.plugin.settings.customThemes.forEach((theme, index) => {
      new Setting(containerEl)
        .setName(theme.name)
        .setDesc(i18next.t('settings.custom_themes.desc'))
        .addExtraButton(button => button
          .setIcon('trash')
          .setTooltip(i18next.t('settings.custom_themes.delete_tooltip'))
          .onClick(async () => {
            this.plugin.settings.customThemes.splice(index, 1)
            if (this.plugin.settings.selectedTheme === theme.name) {
              this.plugin.settings.selectedTheme = ''
            }
            await this.plugin.saveSettings()
            this.display()
          }))
    })

    // Add New Theme Section
    new Setting(containerEl).setName(i18next.t('settings.add_theme.title')).setHeading()

    const newThemeState = { name: '',
      json: '' }

    new Setting(containerEl)
      .setName(i18next.t('settings.add_theme.name_label'))
      .addText(text => text
        .setPlaceholder('My custom theme')
        .onChange((value) => {
          newThemeState.name = value
        }))

    new Setting(containerEl)
      .setName(i18next.t('settings.add_theme.json_label'))
      .setDesc(i18next.t('settings.add_theme.json_desc'))
      .addTextArea(text => text
        .setPlaceholder('{"color": ["#5470c6", "#91cc75", ...]}')
        .onChange((value) => {
          newThemeState.json = value
        }))

    new Setting(containerEl)
      .addButton(button => button
        .setButtonText(i18next.t('settings.add_theme.button'))
        .setCta()
        .onClick(async () => {
          if (!newThemeState.name.trim() || !newThemeState.json.trim()) {
            new Notice('Please provide both a name and JSON for the theme.')
            return
          }

          if (this.plugin.settings.customThemes.some(t => t.name === newThemeState.name)) {
            new Notice(i18next.t('settings.add_theme.exists_error'))
            return
          }

          if (!validateTheme(newThemeState.json)) {
            new Notice(i18next.t('settings.add_theme.invalid_json_error'))
            return
          }

          this.plugin.settings.customThemes.push({
            name: newThemeState.name.trim(),
            json: newThemeState.json.trim(),
          })
          await this.plugin.saveSettings()
          new Notice('Theme added successfully')
          this.display() // Refresh to show in list and dropdown
        }))
  }
}
