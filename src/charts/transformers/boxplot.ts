import type { EChartsOption, SeriesOption } from 'echarts';
import * as R from 'remeda';
import type { BasesData, BaseTransformerOptions } from './base';
import { getNestedValue, safeToString } from './utils';

export interface BoxplotTransformerOptions extends BaseTransformerOptions {
    readonly seriesProp?: string;
}

export function createBoxplotChartOption(
    data: BasesData,
    xProp: string, // Category
    yProp: string, // Value (to be aggregated)
    options?: BoxplotTransformerOptions
): EChartsOption {
    const seriesProp = options?.seriesProp;

    const groups = R.pipe(
        data,
        R.groupBy(item => safeToString(getNestedValue(item, xProp)))
    );

    const categories = Object.keys(groups);
    const boxData = categories.map(cat => {
        const values = groups[cat]!.map(item => Number(getNestedValue(item, yProp)))
            .filter(n => !Number.isNaN(n) && n !== undefined && n !== null)
            .sort((a, b) => a - b);

        if (values.length === 0) return [0, 0, 0, 0, 0];

        const min = values[0]!;
        const max = values[values.length - 1]!;
        const q1 = quantile(values, 0.25);
        const median = quantile(values, 0.5);
        const q3 = quantile(values, 0.75);

        return [min, q1, median, q3, max];
    });

    const series: SeriesOption = {
        type: 'boxplot',
        data: boxData
    };

    return {
        xAxis: { type: 'category', data: categories, name: options?.xAxisLabel },
        yAxis: { type: 'value', name: options?.yAxisLabel },
        series: [series],
        tooltip: { trigger: 'item' }
    };
}

function quantile(sorted: number[], q: number): number {
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base]! + rest * (sorted[base + 1]! - sorted[base]!);
    } else {
        return sorted[base]!;
    }
}
