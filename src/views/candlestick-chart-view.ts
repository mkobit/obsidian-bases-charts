import {
    BasesView,
    QueryController,
    ViewOption
} from 'obsidian';
import type { EChartsOption } from 'echarts';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';

export class CandlestickChartView extends BaseChartView {
    // Unique keys for Candlestick
    public static OPEN_PROP_KEY = 'openProp';
    public static CLOSE_PROP_KEY = 'closeProp';
    public static LOW_PROP_KEY = 'lowProp';
    public static HIGH_PROP_KEY = 'highProp';

    type = 'candlestick-chart';

    constructor(controller: QueryController, containerEl: HTMLElement, plugin: BarePlugin) {
        super(controller, containerEl, plugin);
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string;
        const openProp = this.config.get(CandlestickChartView.OPEN_PROP_KEY) as string;
        const closeProp = this.config.get(CandlestickChartView.CLOSE_PROP_KEY) as string;
        const lowProp = this.config.get(CandlestickChartView.LOW_PROP_KEY) as string;
        const highProp = this.config.get(CandlestickChartView.HIGH_PROP_KEY) as string;

        if (!xProp || !openProp || !closeProp || !lowProp || !highProp) {
            return null;
        }

        return transformDataToChartOption(data, xProp, '', 'candlestick', {
            openProp,
            closeProp,
            lowProp,
            highProp
        });
    }

    static getViewOptions(): ViewOption[] {
        return [
            {
                displayName: 'X-Axis Property (Date/Time)',
                type: 'property',
                key: BaseChartView.X_AXIS_PROP_KEY,
                placeholder: 'Select date property',
            },
            {
                displayName: 'Open Property',
                type: 'property',
                key: CandlestickChartView.OPEN_PROP_KEY,
                placeholder: 'Select Open price property',
            },
            {
                displayName: 'Close Property',
                type: 'property',
                key: CandlestickChartView.CLOSE_PROP_KEY,
                placeholder: 'Select Close price property',
            },
            {
                displayName: 'Lowest Property',
                type: 'property',
                key: CandlestickChartView.LOW_PROP_KEY,
                placeholder: 'Select Low price property',
            },
            {
                displayName: 'Highest Property',
                type: 'property',
                key: CandlestickChartView.HIGH_PROP_KEY,
                placeholder: 'Select High price property',
            }
        ];
    }
}
