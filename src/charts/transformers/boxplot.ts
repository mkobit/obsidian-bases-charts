import type { EChartsOption, BoxplotSeriesOption, XAXisComponentOption, YAXisComponentOption } from 'echarts';
// @ts-expect-error ECharts extension imports can be tricky with type definitions
import prepareBoxplotData from 'echarts/extension/dataTool/prepareBoxplotData';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface BoxplotTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;

    // Axis Options
    xAxisLabel?: string;
    yAxisLabel?: string;
    xAxisLabelRotate?: number;
    flipAxis?: boolean;
}

export function createBoxplotChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    options?: BoxplotTransformerOptions
): EChartsOption {
    const seriesProp = options?.seriesProp;
    const xAxisLabel = options?.xAxisLabel;
    const yAxisLabel = options?.yAxisLabel;
    const xAxisLabelRotate = options?.xAxisLabelRotate;
    const flipAxis = options?.flipAxis;

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

    // Configure Axis
    const categoryAxis: XAXisComponentOption | YAXisComponentOption = {
        type: 'category',
        data: xAxisData,
        name: flipAxis ? (yAxisLabel || yProp) : (xAxisLabel || xProp),
        boundaryGap: true,
        splitArea: { show: false },
        splitLine: { show: false },
        axisLabel: {
            rotate: xAxisLabelRotate
        }
    };

    const valueAxis: XAXisComponentOption | YAXisComponentOption = {
        type: 'value',
        name: flipAxis ? (xAxisLabel || xProp) : (yAxisLabel || yProp),
        splitArea: { show: true }
    };

    const opt: EChartsOption = {
        tooltip: {
            trigger: 'item',
            axisPointer: { type: 'shadow' }
        },
        legend: options?.legend ? {} : undefined,
    };

    if (flipAxis) {
        opt.xAxis = valueAxis;
        opt.yAxis = categoryAxis;
    } else {
        opt.xAxis = categoryAxis;
        opt.yAxis = valueAxis;
    }

    opt.series = seriesOptions;

    return opt;
}
