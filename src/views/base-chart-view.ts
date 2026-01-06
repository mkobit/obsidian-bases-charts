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
    private resizeObserver: ResizeObserver | null = null;

    // Common Config Keys
    public static X_AXIS_PROP_KEY = 'xAxisProp';
    public static Y_AXIS_PROP_KEY = 'yAxisProp';
    public static SERIES_PROP_KEY = 'seriesProp';
    public static LEGEND_KEY = 'showLegend';
    public static HEIGHT_KEY = 'height';

    // New Config Keys (Made public for easier access in subclasses without casting)
    public static SIZE_PROP_KEY = 'sizeProp';
    public static MIN_VALUE_KEY = 'minVal';
    public static MAX_VALUE_KEY = 'maxVal';
    public static VALUE_PROP_KEY = 'valueProp';

    // Axis Config Keys
    public static X_AXIS_LABEL_KEY = 'xAxisLabel';
    public static Y_AXIS_LABEL_KEY = 'yAxisLabel';
    public static X_AXIS_LABEL_ROTATE_KEY = 'xAxisLabelRotate';
    public static FLIP_AXIS_KEY = 'flipAxis';

    constructor(controller: QueryController, scrollEl: HTMLElement, plugin: BarePlugin) {
        super(controller);
        this.scrollEl = scrollEl;
        this.plugin = plugin;
        this.containerEl = scrollEl.createDiv({ cls: 'bases-echarts-container' });
        this.chartEl = this.containerEl.createDiv({ cls: 'bases-echarts' });
    }

    onload(): void {
        this.registerEvent(this.app.workspace.on('css-change', this.updateChartTheme, this));

        this.resizeObserver = new ResizeObserver(() => {
            this.onResizeDebounce();
        });
        this.resizeObserver.observe(this.containerEl);
    }

    onunload() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
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
        if (!this.chartEl) {return;}

        // Apply height from config or settings
        const height = (this.config.get(BaseChartView.HEIGHT_KEY) as string) || this.plugin.settings.defaultHeight;
        this.chartEl.style.height = height;

        if (this.chart) {
             // If height changed, we might need to resize explicitly if not caught by observer yet
             this.chart.resize();
        } else {
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
            },
            {
                displayName: 'Height',
                type: 'text',
                key: BaseChartView.HEIGHT_KEY,
                placeholder: 'e.g., 500px, 50vh',
            }
        ];
    }

    static getAxisViewOptions(): ViewOption[] {
        return [
            {
                displayName: 'X-Axis Label',
                type: 'text',
                key: BaseChartView.X_AXIS_LABEL_KEY,
                placeholder: 'Override X-Axis label',
            },
            {
                displayName: 'Y-Axis Label',
                type: 'text',
                key: BaseChartView.Y_AXIS_LABEL_KEY,
                placeholder: 'Override Y-Axis label',
            },
            {
                displayName: 'X-Axis Label Rotation',
                type: 'text',
                key: BaseChartView.X_AXIS_LABEL_ROTATE_KEY,
                placeholder: 'Degrees (e.g. 45)',
            },
            {
                displayName: 'Flip Axis',
                type: 'toggle',
                key: BaseChartView.FLIP_AXIS_KEY,
            }
        ];
    }
}
