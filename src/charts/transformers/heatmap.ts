import type { EChartsOption, SeriesOption, DatasetComponentOption } from 'echarts';
import type { BasesData, BaseTransformerOptions } from './base';

export interface HeatmapTransformerOptions extends BaseTransformerOptions {
    readonly seriesProp?: string;
    readonly valueProp?: string;
}

export function createHeatmapChartOption(
    data: BasesData,
    xProp: string,
    yProp: string,
    options?: HeatmapTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;

    // Normalize data to { x, y, value }
    const source = data.map(item => ({
        x: item[xProp],
        y: item[yProp],
        value: valueProp ? (item[valueProp] !== undefined ? Number(item[valueProp]) : 0) : 0
    }));

    const dataset: DatasetComponentOption = {
        source: source as unknown as Record<string, unknown>[]
    };

    // Collect categories for axes
    const xCategories = Array.from(new Set(source.map(d => String(d.x)))).sort();
    const yCategories = Array.from(new Set(source.map(d => String(d.y)))).sort();

    // Calculate min/max for visualMap
    const values = source.map(d => d.value);
    const minVal = values.length > 0 ? Math.min(...values) : 0;
    const maxVal = values.length > 0 ? Math.max(...values) : 100;

    const series: SeriesOption = {
        type: 'heatmap',
        datasetIndex: 0,
        encode: {
            x: 'x',
            y: 'y',
            value: 'value'
        }
    };

    return {
        dataset: [dataset],
        series: [series],
        visualMap: {
            min: options?.visualMapMin ?? minVal,
            max: options?.visualMapMax ?? maxVal,
            calculable: true,
            orient: options?.visualMapOrient || 'horizontal',
            left: 'center',
            bottom: '15%'
        },
        xAxis: { type: 'category', name: options?.xAxisLabel, data: xCategories },
        yAxis: { type: 'category', name: options?.yAxisLabel, data: yCategories },
        tooltip: { trigger: 'item' },
        grid: { height: '50%', top: '10%' }
    };
}
