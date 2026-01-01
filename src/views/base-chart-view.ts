import {
    BasesView,
    QueryController,
    ViewOption,
    debounce
} from 'obsidian';
import * as echarts from 'echarts';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';

export abstract class BaseChartView extends BasesView {
    scrollEl: HTMLElement;
    containerEl: HTMLElement;
    chartEl: HTMLElement;
    plugin: BarePlugin;
    protected chart: echarts.ECharts | null = null;

    // Common Config Keys
    public static X_AXIS_PROP_KEY = 'xAxisProp';
    public static Y_AXIS_PROP_KEY = 'yAxisProp';
    public static SERIES_PROP_KEY = 'seriesProp';
    public static LEGEND_KEY = 'showLegend';

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

        if (!this.chart) {
            this.chart = echarts.init(this.chartEl, this.isDarkMode() ? 'dark' : undefined);
        }

        const data = this.data.data as unknown as Record<string, unknown>[];
        const option = this.getChartOption(data);

        if (option) {
            // Re-merge with notMerge: true to ensure clean slate for dynamic series
            this.chart.setOption(option, true);
        } else {
            this.chart.clear();
        }
    }

    protected abstract getChartOption(data: Record<string, unknown>[]): EChartsOption | null;

    private updateChartTheme = (): void => {
        if (this.chart) {
            this.chart.dispose();
            this.chart = echarts.init(this.chartEl, this.isDarkMode() ? 'dark' : undefined);
            this.renderChart();
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
            }
        ];
    }
}
