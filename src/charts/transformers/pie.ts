import type { EChartsOption, SeriesOption, DatasetComponentOption } from 'echarts';
import type { BasesData, BaseTransformerOptions } from './base';
import { getLegendOption } from './utils';

export interface PieTransformerOptions extends BaseTransformerOptions {
    readonly roseType?: 'radius' | 'area';
}

export function createPieChartOption(
    data: BasesData,
    xProp: string, // Category
    yProp: string, // Value
    options?: PieTransformerOptions
): EChartsOption {
    const source = data.map(item => ({
        name: item[xProp],
        value: item[yProp]
    }));

    const dataset: DatasetComponentOption = {
        source: source as unknown as Record<string, unknown>[]
    };

    const series: any = {
        type: 'pie',
        roseType: options?.roseType,
        radius: options?.roseType ? [20, '75%'] : '50%',
        datasetIndex: 0,
        encode: {
            itemName: 'name',
            value: 'value'
        }
    };

    return {
        dataset: [dataset], // Return array for tests expecting dataset[0]
        series: [series],
        legend: getLegendOption(options?.legend, options?.legendPosition, options?.legendOrient),
        tooltip: {
            trigger: 'item'
        }
    };
}
