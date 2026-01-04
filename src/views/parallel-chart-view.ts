import type { ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type { ParallelTransformerOptions } from '../charts/transformer';
import type { EChartsOption } from 'echarts';

export class ParallelChartView extends BaseChartView {
    type = 'parallel';

    static getViewOptions(): ViewOption[] {
        return [
            {
                name: 'Dimensions (comma-separated)',
                key: 'xProp', // repurpose xProp for dimensions list
                type: 'text',
                placeholder: 'e.g. price,rating,volume'
            },
            {
                name: 'Series property',
                key: 'seriesProp',
                type: 'property',
                placeholder: 'Property to group by'
            },
            ...BaseChartView.getCommonViewOptions()
        ];
    }

    getChartOption(data: Record<string, unknown>[]): EChartsOption {
        const xProp = this.config.get('xProp') as string;
        const seriesProp = this.config.get('seriesProp') as string;
        const showLegend = this.config.get('showLegend') as boolean;

        const options: ParallelTransformerOptions = {
            seriesProp,
            legend: showLegend
        };

        return transformDataToChartOption(data, xProp, '', 'parallel', options);
    }
}
