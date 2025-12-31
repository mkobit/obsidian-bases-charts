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
    protected static X_AXIS_PROP_KEY = 'xAxisProp';
    protected static Y_AXIS_PROP_KEY = 'yAxisProp';

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
            this.chart.setOption(option);
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
            }
        ];
    }
}
