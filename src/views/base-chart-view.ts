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
    readonly scrollEl: HTMLElement;
    readonly containerEl: HTMLElement;
    readonly chartEl: HTMLElement;
    readonly plugin: BarePlugin;
    protected chart: echarts.ECharts | null = null;
    private resizeObserver: ResizeObserver | null = null;

    // Common Config Keys
    public static readonly X_AXIS_PROP_KEY = 'xAxisProp';
    public static readonly Y_AXIS_PROP_KEY = 'yAxisProp';
    public static readonly SERIES_PROP_KEY = 'seriesProp';
    public static readonly LEGEND_KEY = 'showLegend';
    public static readonly LEGEND_POSITION_KEY = 'legendPosition';
    public static readonly LEGEND_ORIENT_KEY = 'legendOrient';
    public static readonly HEIGHT_KEY = 'height';

    // New Config Keys (Made public for easier access in subclasses without casting)
    public static readonly SIZE_PROP_KEY = 'sizeProp';
    public static readonly MIN_VALUE_KEY = 'minVal';
    public static readonly MAX_VALUE_KEY = 'maxVal';
    public static readonly VALUE_PROP_KEY = 'valueProp';

    // Axis Config Keys
    public static readonly X_AXIS_LABEL_KEY = 'xAxisLabel';
    public static readonly Y_AXIS_LABEL_KEY = 'yAxisLabel';
    public static readonly X_AXIS_LABEL_ROTATE_KEY = 'xAxisLabelRotate';
    public static readonly FLIP_AXIS_KEY = 'flipAxis';

    // Visual Map Config Keys
    public static readonly VISUAL_MAP_MIN_KEY = 'visualMapMin';
    public static readonly VISUAL_MAP_MAX_KEY = 'visualMapMax';
    public static readonly VISUAL_MAP_COLOR_KEY = 'visualMapColor';
    public static readonly VISUAL_MAP_ORIENT_KEY = 'visualMapOrient';
    public static readonly VISUAL_MAP_TYPE_KEY = 'visualMapType';

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

    private readonly onResizeDebounce = debounce(() => {
        this.chart?.resize();
    }, 100, true);

    onResize(): void {
        this.onResizeDebounce();
    }

    onDataUpdated(): void {
        this.renderChart();
    }

    protected getCommonTransformerOptions(): import('../charts/transformers/base').BaseTransformerOptions {
        return {
            legend: this.config.get(BaseChartView.LEGEND_KEY) as boolean,
            legendPosition: this.config.get(BaseChartView.LEGEND_POSITION_KEY) as 'top' | 'bottom' | 'left' | 'right',
            legendOrient: this.config.get(BaseChartView.LEGEND_ORIENT_KEY) as 'horizontal' | 'vertical',
            flipAxis: this.config.get(BaseChartView.FLIP_AXIS_KEY) as boolean,
            xAxisLabel: this.config.get(BaseChartView.X_AXIS_LABEL_KEY) as string,
            yAxisLabel: this.config.get(BaseChartView.Y_AXIS_LABEL_KEY) as string,
            xAxisLabelRotate: Number(this.config.get(BaseChartView.X_AXIS_LABEL_ROTATE_KEY) || 0),
        };
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

        const data = this.data.data as unknown as readonly Record<string, unknown>[];
        const option = this.getChartOption(data);

        if (option) {
            // Re-merge with notMerge: true to ensure clean slate for dynamic series
            this.chart.setOption(option, true);
        } else {
            this.chart.clear();
        }
    }

    protected abstract getChartOption(data: readonly Record<string, unknown>[]): EChartsOption | null;

    private readonly updateChartTheme = (): void => {
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
                displayName: 'Legend Position',
                type: 'dropdown',
                key: BaseChartView.LEGEND_POSITION_KEY,
                options: {
                    'top': 'Top',
                    'bottom': 'Bottom',
                    'left': 'Left',
                    'right': 'Right'
                }
            } as ViewOption,
            {
                displayName: 'Legend Orientation',
                type: 'dropdown',
                key: BaseChartView.LEGEND_ORIENT_KEY,
                options: {
                    'horizontal': 'Horizontal',
                    'vertical': 'Vertical'
                }
            } as ViewOption,
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

    static getVisualMapViewOptions(): ViewOption[] {
        return [
            {
                displayName: 'Visual Map Min',
                type: 'text',
                key: BaseChartView.VISUAL_MAP_MIN_KEY,
                placeholder: 'Min value (default: auto)',
            },
            {
                displayName: 'Visual Map Max',
                type: 'text',
                key: BaseChartView.VISUAL_MAP_MAX_KEY,
                placeholder: 'Max value (default: auto)',
            },
            {
                displayName: 'Visual Map Colors',
                type: 'text',
                key: BaseChartView.VISUAL_MAP_COLOR_KEY,
                placeholder: 'Comma-separated hex colors (e.g. #fff,#000)',
            },
            {
                displayName: 'Visual Map Orientation',
                type: 'text', // Ideally a dropdown, but ViewOption only supports basic types? Or use text with validation.
                key: BaseChartView.VISUAL_MAP_ORIENT_KEY,
                placeholder: 'horizontal or vertical (default: horizontal)',
            },
             {
                displayName: 'Visual Map Type',
                type: 'text',
                key: BaseChartView.VISUAL_MAP_TYPE_KEY,
                placeholder: 'continuous or piecewise (default: continuous)',
            }
        ];
    }
}
