import type { EChartsOption, BoxplotSeriesOption } from 'echarts';
// @ts-expect-error ECharts extension imports can be tricky with type definitions
import prepareBoxplotData from 'echarts/extension/dataTool/prepareBoxplotData';
import type { BaseTransformerOptions, AxisOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface BoxplotTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;

    axis?: AxisOptions;
}

export function createBoxplotChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    options?: BoxplotTransformerOptions
): EChartsOption {
    const seriesProp = options?.seriesProp;
    const xAxisLabel = options?.axis?.xAxisLabel;
    const yAxisLabel = options?.axis?.yAxisLabel;
    const xAxisLabelRotate = options?.axis?.xAxisLabelRotate;
    const flipAxis = options?.axis?.flipAxis;

    // 1. Collect all unique X values (categories)
    const xAxisData = Array.from(new Set(data.map(item => {
        const xValRaw = getNestedValue(item, xProp);
        return xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);
    })));

    // 2. Group data by series and category
    // Map<SeriesName, Map<CategoryName, number[]>>
    const seriesMap = data.reduce((acc, item) => {
        const xValRaw = getNestedValue(item, xProp);
        const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);

        let sName = yProp;
        if (seriesProp) {
            const sRaw = getNestedValue(item, seriesProp);
            sName = sRaw === undefined || sRaw === null ? 'Series 1' : safeToString(sRaw);
        }

        const yVal = Number(getNestedValue(item, yProp));
        if (isNaN(yVal)) return acc;

        if (!acc.has(sName)) {
            acc.set(sName, new Map());
        }
        const catMap = acc.get(sName)!;
        if (!catMap.has(xVal)) {
            catMap.set(xVal, []);
        }
        catMap.get(xVal)!.push(yVal);
        return acc;
    }, new Map<string, Map<string, number[]>>());

    // 3. Transform to ECharts series
    const seriesOptions: BoxplotSeriesOption[] = Array.from(seriesMap.entries()).map(([sName, catMap]) => {
        // Prepare data for prepareBoxplotData
        // We need a 2D array where each row is a category's data points
        const rawData = xAxisData.map(xVal => catMap.get(xVal) || []);

        // Use standard ECharts data tool to process the data
        // prepareBoxplotData expects [ [v1, v2...], [v3, v4...] ] where each inner array is a category
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const result = prepareBoxplotData(rawData);

        return {
            name: sName,
            type: 'boxplot',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            data: result.boxData
        };
    });

    const categoryAxisSettings = {
        type: 'category' as const,
        data: xAxisData,
        name: flipAxis ? (yAxisLabel || yProp) : (xAxisLabel || xProp),
        boundaryGap: true,
        splitArea: { show: false },
        splitLine: { show: false },
        axisLabel: {
            rotate: xAxisLabelRotate
        }
    };

    const valueAxisSettings = {
        type: 'value' as const,
        name: flipAxis ? (xAxisLabel || xProp) : (yAxisLabel || yProp),
        splitArea: { show: true }
    };

    const opt: EChartsOption = {
        tooltip: {
            trigger: 'item',
            axisPointer: { type: 'shadow' }
        },
        legend: options?.legend ? {} : undefined,
        series: seriesOptions
    };

    if (flipAxis) {
        opt.xAxis = valueAxisSettings;
        opt.yAxis = categoryAxisSettings;
    } else {
        opt.xAxis = categoryAxisSettings;
        opt.yAxis = valueAxisSettings;
    }

    return opt;
}
