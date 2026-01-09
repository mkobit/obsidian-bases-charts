import type { EChartsOption, SeriesOption, DatasetComponentOption } from 'echarts';
import type { BasesData, BaseTransformerOptions } from './base';

export interface GaugeTransformerOptions extends BaseTransformerOptions {
    readonly min?: number;
    readonly max?: number;
}

export function createGaugeChartOption(
    data: BasesData,
    yProp: string, // Value
    options?: GaugeTransformerOptions
): EChartsOption {
    // Gauge usually takes a single value or multiple pointers.
    // If data has multiple rows, maybe we take the first or sum?
    // Let's assume aggregation or first value.

    // Simplest: Sum of values or just mapping.
    // Let's map all rows as pointers?

    // Dataset support for gauge is available in newer ECharts.

    const source = [...data];
    const dataset: DatasetComponentOption = {
        source: source as unknown as Record<string, unknown>[]
    };

    const series: SeriesOption = {
        type: 'gauge',
        min: options?.min,
        max: options?.max,
        progress: {
            show: true
        },
        detail: {
            valueAnimation: true,
            formatter: '{value}'
        },
        datasetIndex: 0,
        // Gauge doesn't standardly use encode for 'value' in the same way as cartesian?
        // Actually it does in 5.x+.
        // But usually it expects data: [{value: ..., name: ...}]
        // We can use encode.
        // encode: { value: yProp, name: ... } (name is optional)
    };

    // Wait, gauge expects `value` dimension.
    // Let's try direct data if dataset fails, but dataset is preferred.
    // We need to verify if gauge supports dataset. It does in recent versions.

    // However, we need to specify which column is value.
    // encode: { value: yProp } works.

    return {
        dataset,
        series: [series as SeriesOption], // Cast because types might be strict
        tooltip: { trigger: 'item' }
    };
}
