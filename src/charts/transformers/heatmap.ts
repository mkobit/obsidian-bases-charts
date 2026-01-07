import type { EChartsOption, HeatmapSeriesOption, DatasetComponentOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue, getLegendOption } from './utils';
import * as R from 'remeda';

export interface HeatmapTransformerOptions extends BaseTransformerOptions {
    valueProp?: string;
}

export function createHeatmapChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    options?: HeatmapTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;
    const xAxisLabel = options?.xAxisLabel ?? xProp;
    const yAxisLabel = options?.yAxisLabel ?? yProp;
    const xAxisRotate = options?.xAxisLabelRotate ?? 0;

    // 1. Normalize Data
    // Structure: { x, y, value }
    const normalizedData = R.map(data, item => {
        const xValRaw = getNestedValue(item, xProp);
        const yValRaw = getNestedValue(item, yProp);
        const valNum = valueProp ? Number(getNestedValue(item, valueProp)) : Number.NaN;

        return {
            x: xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw),
            y: yValRaw === undefined || yValRaw === null ? 'Unknown' : safeToString(yValRaw),
            value: Number.isNaN(valNum) ? 0 : valNum
        };
    });

    // 2. Identify Categories for Axes
    // ECharts heatmap needs 'category' axes.
    // We should compute unique values to ensure order, or let ECharts infer.
    // Explicitly providing data to axes ensures all categories are shown even if not in dataset?
    // Actually, for heatmap, we usually want all categories.
    const xAxisData = R.pipe(normalizedData, R.map(d => d.x), R.unique());
    const yAxisData = R.pipe(normalizedData, R.map(d => d.y), R.unique());

    const values = R.map(normalizedData, d => d.value);
    const finalMinVal = values.length > 0 ? Math.min(...values) : 0;
    const finalMaxVal = values.length > 0 ? Math.max(...values) : 10;

    const dataset: DatasetComponentOption = {
        source: normalizedData
    };

    const seriesItem: HeatmapSeriesOption = {
        type: 'heatmap',
        datasetIndex: 0,
        encode: {
            x: 'x',
            y: 'y',
            value: 'value',
            tooltip: ['x', 'y', 'value']
        },
        label: {
            show: true
        }
    };

    const opt: EChartsOption = {
        dataset: [dataset],
        tooltip: {
            position: 'top',
            // Default tooltip for encoded data is usually fine, but we can customize if needed
        },
        grid: {
            height: '70%',
            top: '10%'
        },
        xAxis: {
            type: 'category',
            data: xAxisData, // Keeping explicit categories for order control
            name: xAxisLabel,
            splitArea: { show: true },
            axisLabel: { rotate: xAxisRotate }
        },
        yAxis: {
            type: 'category',
            data: yAxisData,
            name: yAxisLabel,
            splitArea: { show: true }
        },
        visualMap: {
            min: finalMinVal,
            max: finalMaxVal,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '0%'
        },
        series: [seriesItem],
        ...(getLegendOption(options) ? { legend: getLegendOption(options) } : {})
    };

    return opt;
}
