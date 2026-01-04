import { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';

export class CandlestickChartView extends BaseChartView {
    type = 'candlestick-chart';

    constructor(controller: QueryController, scrollEl: HTMLElement, plugin: BarePlugin) {
        super(controller, scrollEl, plugin);
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
        const openProp = this.config.get('openProp');
        const closeProp = this.config.get('closeProp');
        const lowProp = this.config.get('lowProp');
        const highProp = this.config.get('highProp');

        // Axis Config
        const xAxisLabel = this.config.get(BaseChartView.X_AXIS_LABEL_KEY) as string;
        const yAxisLabel = this.config.get(BaseChartView.Y_AXIS_LABEL_KEY) as string;
        const xAxisLabelRotate = this.config.get(BaseChartView.X_AXIS_LABEL_ROTATE_KEY) as number;
        const flipAxis = this.config.get(BaseChartView.FLIP_AXIS_KEY) as boolean;

        if (typeof xProp !== 'string' || typeof openProp !== 'string' || typeof closeProp !== 'string' || typeof lowProp !== 'string' || typeof highProp !== 'string') {
            return null;
        }

        // We pass the 4 props in options
        return transformDataToChartOption(data, xProp, '', 'candlestick', {
            openProp,
            closeProp,
            lowProp,
            highProp,
            xAxisLabel,
            yAxisLabel,
            xAxisLabelRotate,
            flipAxis
        });
    }

    static getViewOptions(): ViewOption[] {
        return [
            {
                displayName: 'Date Property',
                type: 'property',
                key: BaseChartView.X_AXIS_PROP_KEY,
                placeholder: 'Select date property',
            },
            {
                displayName: 'Open Property',
                type: 'property',
                key: 'openProp',
                placeholder: 'Select open price property',
            },
            {
                displayName: 'Close Property',
                type: 'property',
                key: 'closeProp',
                placeholder: 'Select close price property',
            },
            {
                displayName: 'Low Property',
                type: 'property',
                key: 'lowProp',
                placeholder: 'Select low price property',
            },
            {
                displayName: 'High Property',
                type: 'property',
                key: 'highProp',
                placeholder: 'Select high price property',
            },
            {
                displayName: 'Height',
                type: 'text',
                key: BaseChartView.HEIGHT_KEY,
                placeholder: 'e.g., 500px'
            },
            ...BaseChartView.getAxisViewOptions()
        ];
    }
}
