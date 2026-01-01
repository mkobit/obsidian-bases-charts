import { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';

export class GaugeChartView extends BaseChartView {
    type = 'gauge-chart';

    constructor(controller: QueryController, scrollEl: HTMLElement, plugin: BarePlugin) {
        super(controller, scrollEl, plugin);
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);
        // Cast BaseChartView to any to access new props
        const minVal = Number(this.config.get(BaseChartView.MIN_VALUE_KEY));
        const maxVal = Number(this.config.get(BaseChartView.MAX_VALUE_KEY));

        if (typeof yProp !== 'string') {
            return null;
        }

        return transformDataToChartOption(data, '', yProp, 'gauge', {
            min: isNaN(minVal) ? 0 : minVal,
            max: isNaN(maxVal) ? 100 : maxVal
        });
    }

    static getViewOptions(): ViewOption[] {
        return [
            {
                displayName: 'Value Property',
                type: 'property',
                key: BaseChartView.Y_AXIS_PROP_KEY,
                placeholder: 'Select value property',
            },
            {
                displayName: 'Min Value',
                type: 'text',
                key: BaseChartView.MIN_VALUE_KEY,
                placeholder: '0',
            },
            {
                displayName: 'Max Value',
                type: 'text',
                key: BaseChartView.MAX_VALUE_KEY,
                placeholder: '100',
            }
        ];
    }
}
