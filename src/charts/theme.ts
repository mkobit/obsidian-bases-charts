import * as echarts from 'echarts';

/**
 * Determines the theme name to use based on settings and current Obsidian theme.
 * @param themeSetting The theme setting from the plugin ('auto', 'light', 'dark', 'custom').
 * @param isDarkMode Whether the current Obsidian theme is dark.
 * @param customThemeJson The JSON string for the custom theme.
 * @returns The theme name to pass to echarts.init.
 */
export function getChartTheme(
    themeSetting: 'auto' | 'light' | 'dark' | 'custom',
    isDarkMode: boolean,
    customThemeJson?: string
): string | undefined {
    if (themeSetting === 'custom') {
        if (customThemeJson) {
            try {
                // Parse JSON and cast to object to avoid unsafe 'any' assignment
                const themeObj = JSON.parse(customThemeJson) as Record<string, unknown>;

                // Register the theme globally with ECharts
                // We use a fixed name 'bare-plugin-custom-theme' and overwrite it.
                // Note: registering the same theme name again overwrites it.
                // echarts.registerTheme expects 'object', Record<string, unknown> satisfies this.
                echarts.registerTheme('bare-plugin-custom-theme', themeObj);
                return 'bare-plugin-custom-theme';
            } catch (e) {
                console.error('Failed to parse custom chart theme JSON:', e);
                // Fallback to auto
            }
        }
    }

    if (themeSetting === 'dark') return 'dark';
    if (themeSetting === 'light') return undefined; // 'undefined' is the default (usually light-ish)

    // Auto
    return isDarkMode ? 'dark' : undefined;
}
