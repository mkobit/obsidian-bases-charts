import {
    BasesView,
    QueryController,
    ViewOption,
    debounce
} from 'obsidian';
import * as echarts from 'echarts';
import { transformDataToChartOption, ChartType } from './charts/transformer';
import type BarePlugin from './main';

export const ChartViewType = 'chart';

export class ChartView extends BasesView {
    type = ChartViewType;
    scrollEl: HTMLElement;
    containerEl: HTMLElement;
    chartEl: HTMLElement;
    plugin: BarePlugin;

    private chart: echarts.ECharts | null = null;

    // Config keys
    private static X_AXIS_PROP_KEY = 'xAxisProp';
    private static Y_AXIS_PROP_KEY = 'yAxisProp';
    private static CHART_TYPE_KEY = 'chartType';

    constructor(controller: QueryController, scrollEl: HTMLElement, plugin: BarePlugin) {
        super(controller);
        this.scrollEl = scrollEl;
        this.plugin = plugin;
        this.containerEl = scrollEl.createDiv({ cls: 'bases-chart-container' });
        // Height handled by CSS 'bases-chart' class
        this.chartEl = this.containerEl.createDiv({ cls: 'bases-chart' });
    }

    onload(): void {
        // Handle resize
        this.registerEvent(this.app.workspace.on('resize', this.onResizeDebounce, this));
        // Handle theme change (ECharts has dark theme support)
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

    private renderChart(): void {
        if (!this.chartEl) return;

        // Initialize chart if needed
        if (!this.chart) {
            this.chart = echarts.init(this.chartEl, this.isDarkMode() ? 'dark' : undefined);
        }

        // Get props from config
        const xProp = this.config.get(ChartView.X_AXIS_PROP_KEY);
        const yProp = this.config.get(ChartView.Y_AXIS_PROP_KEY);
        // Default to 'bar' if not set or invalid
        let chartTypeVal = this.config.get(ChartView.CHART_TYPE_KEY) as string;

        // Validate chart type
        let chartType: ChartType = 'bar';
        if (chartTypeVal === 'line') {
            chartType = 'line';
        }

        if (typeof xProp !== 'string' || typeof yProp !== 'string') {
            this.chart.clear();
            return;
        }

        // Ensure data is in the expected format for the transformer
        // BasesQueryResult.data is an array of BasesEntry.
        // We need to map it to a Record<string, unknown> if possible, or just cast it safely if BasesEntry behaves like an object.
        // Since we don't have easy access to BasesEntry keys without iterating or knowing schema, and transformer handles loose objects:
        const data = this.data.data as unknown as Record<string, unknown>[];

        const option = transformDataToChartOption(data, xProp, yProp, chartType);
        this.chart.setOption(option);
    }

    private updateChartTheme = (): void => {
        if (this.chart) {
            this.chart.dispose();
            this.chart = echarts.init(this.chartEl, this.isDarkMode() ? 'dark' : undefined);
            this.renderChart();
        }
    }

    private isDarkMode(): boolean {
        // Obsidian 1.0+ way to check for dark mode
        return document.body.classList.contains('theme-dark');
    }

    static getViewOptions(): ViewOption[] {
        return [
            {
                displayName: 'X-Axis Property',
                type: 'property',
                key: ChartView.X_AXIS_PROP_KEY,
                placeholder: 'Select category property',
            },
            {
                displayName: 'Y-Axis Property',
                type: 'property',
                key: ChartView.Y_AXIS_PROP_KEY,
                placeholder: 'Select value property',
            },
            {
                displayName: 'Chart Type (bar/line)',
                type: 'text',
                key: ChartView.CHART_TYPE_KEY,
                placeholder: 'bar',
            }
        ];
    }
}
