import type { ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type { ParallelTransformerOptions } from '../charts/transformer';
import type { EChartsOption } from 'echarts';
import { BasesData } from '../charts/transformers/base';

export class ParallelChartView extends BaseChartView {
    readonly type = 'parallel';

    static getViewOptions(_?: unknown): ViewOption[] {
        return [
            {
                displayName: 'Dimensions (comma-separated)',
                key: 'xProp', // repurpose xProp for dimensions list
                type: 'text',
                placeholder: 'e.g. price,rating,volume'
            },
            {
                displayName: 'Series property',
                key: 'seriesProp',
                type: 'property',
                placeholder: 'Property to group by'
            },
            ...BaseChartView.getCommonViewOptions()
        ];
    }

    getChartOption(data: BasesData): EChartsOption {
        const xProp = this.config.get('xProp') as string;
        const seriesProp = this.config.get('seriesProp') as string;

        const options: ParallelTransformerOptions = {
            ...this.getCommonTransformerOptions(),
            seriesProp
        };

        return transformDataToChartOption(data, xProp, '', 'parallel', options);
    }
}
