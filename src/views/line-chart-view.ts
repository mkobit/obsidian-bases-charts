import { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';

export class LineChartView extends BaseChartView {
    type = 'line-chart';

    constructor(controller: QueryController, scrollEl: HTMLElement, plugin: BarePlugin) {
        super(controller, scrollEl, plugin);
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
        const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);

        // Get line specific options
        const smooth = this.config.get('smooth') as boolean;
        const showSymbol = this.config.get('showSymbol') as boolean;
        const areaStyle = this.config.get('areaStyle') as boolean;

        if (typeof xProp !== 'string' || typeof yProp !== 'string') {
            return null;
        }

        return transformDataToChartOption(data, xProp, yProp, 'line', {
            smooth,
            showSymbol,
            areaStyle
        });
    }

    static getViewOptions(): ViewOption[] {
        return [
            ...BaseChartView.getCommonViewOptions(),
            {
                displayName: 'Smooth Line',
                type: 'toggle',
                key: 'smooth',
            },
            {
                displayName: 'Show Symbol',
                type: 'toggle',
                key: 'showSymbol',
            },
            {
                displayName: 'Area Style',
                type: 'toggle',
                key: 'areaStyle',
            }
        ];
    }
}
