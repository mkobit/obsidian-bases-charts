import type { EChartsOption, SeriesOption, DatasetComponentOption } from 'echarts';
import type { BasesData, BaseTransformerOptions } from './base';
import { getLegendOption } from './utils';

export interface FunnelTransformerOptions extends BaseTransformerOptions {
    readonly sort?: 'ascending' | 'descending' | 'none';
}

export function createFunnelChartOption(
    data: BasesData,
    xProp: string, // Name
    yProp: string, // Value
    options?: FunnelTransformerOptions
): EChartsOption {
    const source = [...data];
    const dataset: DatasetComponentOption = {
        source: source as unknown as Record<string, unknown>[]
    };

    const series: SeriesOption = {
        type: 'funnel',
        sort: options?.sort || 'descending',
        encode: {
            name: xProp,
            value: yProp
        }
    };

    return {
        dataset,
        series: [series],
        legend: getLegendOption(options?.legend, options?.legendPosition, options?.legendOrient),
        tooltip: { trigger: 'item' }
    };
}
