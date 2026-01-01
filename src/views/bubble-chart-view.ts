import { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';

export class BubbleChartView extends BaseChartView {
    type = 'bubble-chart';

    constructor(controller: QueryController, scrollEl: HTMLElement, plugin: BarePlugin) {
        super(controller, scrollEl, plugin);
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
        const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);
        const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY);
        // Cast BaseChartView to any to access the property if strict types fail
        const sizeProp = this.config.get(BaseChartView.SIZE_PROP_KEY);
        const showLegend = this.config.get(BaseChartView.LEGEND_KEY) as boolean;

        if (typeof xProp !== 'string' || typeof yProp !== 'string') {
            return null;
        }

        return transformDataToChartOption(data, xProp, yProp, 'bubble', {
            legend: showLegend,
            seriesProp: typeof seriesProp === 'string' ? seriesProp : undefined,
            sizeProp: typeof sizeProp === 'string' ? sizeProp : undefined
        });
    }

    static getViewOptions(): ViewOption[] {
        return [
            ...BaseChartView.getCommonViewOptions(),
            {
                displayName: 'Size Property',
                type: 'property',
                key: BaseChartView.SIZE_PROP_KEY,
                placeholder: 'Select property for bubble size',
            }
        ];
    }
}
