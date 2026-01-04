import {
    BasesView,
    QueryController,
    ViewOption,
    debounce
} from 'obsidian';
import * as echarts from 'echarts';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';
import { getChartTheme } from '../charts/theme';

export abstract class BaseChartView extends BasesView {
    scrollEl: HTMLElement;
    containerEl: HTMLElement;
    chartEl: HTMLElement;
    plugin: BarePlugin;
    protected chart: echarts.ECharts | null = null;
    protected currentCssClass: string | null = null;

    // Common Config Keys
    public static X_AXIS_PROP_KEY = 'xAxisProp';
    public static Y_AXIS_PROP_KEY = 'yAxisProp';
    public static SERIES_PROP_KEY = 'seriesProp';
    public static LEGEND_KEY = 'showLegend';

    // Theme & Style Config Keys
    public static CSS_CLASS_KEY = 'cssClass';
    public static CUSTOM_OPTION_KEY = 'customOption';

    // New Config Keys (Made public for easier access in subclasses without casting)
    public static SIZE_PROP_KEY = 'sizeProp';
    public static MIN_VALUE_KEY = 'minVal';
    public static MAX_VALUE_KEY = 'maxVal';
    public static VALUE_PROP_KEY = 'valueProp';

    constructor(controller: QueryController, scrollEl: HTMLElement, plugin: BarePlugin) {
        super(controller);
        this.scrollEl = scrollEl;
        this.plugin = plugin;
        this.containerEl = scrollEl.createDiv({ cls: 'bases-chart-container' });
        this.chartEl = this.containerEl.createDiv({ cls: 'bases-chart' });
    }

    onload(): void {
        this.registerEvent(this.app.workspace.on('resize', this.onResizeDebounce, this));
        this.registerEvent(this.app.workspace.on('css-change', this.updateChartTheme, this));
    }

    onunload() {
        if (this.chart) {
            this.chart.dispose();
            this.chart = null;
        }
    }

    private onResizeDebounce = debounce(() => {
        this.chart?.resize();
    }, 100, true);

    onResize(): void {
        this.onResizeDebounce();
    }

    onDataUpdated(): void {
        this.renderChart();
    }

    protected renderChart(): void {
        if (!this.chartEl) return;

        // 1. Determine Theme
        const themeSetting = this.plugin.settings.chartTheme;
        const customThemeDef = this.plugin.settings.customThemeDefinition;
        const isDark = this.isDarkMode();
        const themeName = getChartTheme(themeSetting, isDark, customThemeDef);

        // 2. Handle CSS Class
        const cssClass = this.config.get(BaseChartView.CSS_CLASS_KEY) as string;
        if (this.currentCssClass && this.currentCssClass !== cssClass) {
            this.containerEl.removeClass(this.currentCssClass);
            this.currentCssClass = null;
        }
        if (cssClass) {
            this.containerEl.addClass(cssClass);
            this.currentCssClass = cssClass;
        }

        // 3. Initialize or Re-initialize Chart if theme changed
        // (ECharts instance is tied to a theme, need to dispose to change theme)
        // Optimization: check if current instance theme matches desired theme?
        // ECharts doesn't easily expose current theme name.
        // For now, simpler to re-init if unsure, or just rely on 'updateChartTheme' to handle theme switches.
        // But 'updateChartTheme' is for global changes.
        // If the user *just* opened this view, this.chart is null.

        // We will dispose and re-init to ensure correct theme is applied every render
        // (in case settings changed). This might be slightly expensive but ensures correctness.
        // Actually, let's only do it if chart is null or if we suspect theme change.
        // For simplicity and correctness with the new dynamic theme settings, re-init is safest.
        if (this.chart) {
             this.chart.dispose();
             this.chart = null;
        }

        if (!this.chart) {
            this.chart = echarts.init(this.chartEl, themeName);
        }

        // 4. Generate Chart Option
        const data = this.data.data as unknown as Record<string, unknown>[];
        let option = this.getChartOption(data);

        if (option) {
            // 5. Apply Default Transparent Background (to support Obsidian themes)
            if (!option.backgroundColor) {
                option.backgroundColor = 'transparent';
            }

            // 6. Merge Custom Options (Per-View)
            const customOptionStr = this.config.get(BaseChartView.CUSTOM_OPTION_KEY) as string;
            if (customOptionStr) {
                try {
                    // Safe cast to avoid 'unsafe assignment of any' lint error
                    const customOpt = JSON.parse(customOptionStr) as EChartsOption;

                    // We will do two setOption calls.
                    // First call clears/resets.
                    this.chart.setOption(option, true);

                    // Second call merges user overrides.
                    this.chart.setOption(customOpt, false);
                    return; // Early return as we already set options.

                } catch (e) {
                    console.warn('Invalid Custom Option JSON:', e);
                }
            }

            this.chart.setOption(option, true);
        } else {
            this.chart.clear();
        }
    }

    protected abstract getChartOption(data: Record<string, unknown>[]): EChartsOption | null;

    private updateChartTheme = (): void => {
        // Triggered when Obsidian theme changes (Light/Dark) or plugin settings might have changed theme
        if (this.chart) {
            this.renderChart(); // Re-render handles disposal and re-init with correct theme
        }
    }

    private isDarkMode(): boolean {
        return document.body.classList.contains('theme-dark');
    }

    static getCommonViewOptions(): ViewOption[] {
        return [
            {
                displayName: 'X-Axis Property',
                type: 'property',
                key: BaseChartView.X_AXIS_PROP_KEY,
                placeholder: 'Select category property',
            },
            {
                displayName: 'Y-Axis Property',
                type: 'property',
                key: BaseChartView.Y_AXIS_PROP_KEY,
                placeholder: 'Select value property',
            },
            {
                displayName: 'Series Property (Optional)',
                type: 'property',
                key: BaseChartView.SERIES_PROP_KEY,
                placeholder: 'Select series/group property',
            },
            {
                displayName: 'Show Legend',
                type: 'toggle',
                key: BaseChartView.LEGEND_KEY,
            },
            {
                displayName: 'Custom CSS class',
                type: 'text',
                key: BaseChartView.CSS_CLASS_KEY,
                placeholder: 'e.g. my-custom-chart',
            },
            {
                displayName: 'Custom ECharts option (JSON)',
                type: 'text',
                key: BaseChartView.CUSTOM_OPTION_KEY,
                placeholder: '{"grid": {"left": 50}}',
            }
        ];
    }
}
