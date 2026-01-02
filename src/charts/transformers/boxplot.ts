import type { EChartsOption, BoxplotSeriesOption } from 'echarts';
// @ts-expect-error ECharts extension imports can be tricky with type definitions
import prepareBoxplotData from 'echarts/extension/dataTool/prepareBoxplotData';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface BoxplotTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;
}

export function createBoxplotChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    options?: BoxplotTransformerOptions
): EChartsOption {
    const seriesProp = options?.seriesProp;

    // 1. Single pass to aggregate data
    // Map<SeriesName, Map<CategoryName, number[]>>
    const seriesMap = new Map<string, Map<string, number[]>>();
    const uniqueX = new Set<string>();

    data.forEach(item => {
        const xValRaw = getNestedValue(item, xProp);
        const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);
        uniqueX.add(xVal);

        let sName = yProp;
        if (seriesProp) {
            const sRaw = getNestedValue(item, seriesProp);
            sName = sRaw === undefined || sRaw === null ? 'Series 1' : safeToString(sRaw);
        }

        const yVal = Number(getNestedValue(item, yProp));
        if (isNaN(yVal)) return;

        if (!seriesMap.has(sName)) {
            seriesMap.set(sName, new Map());
        }
        const catMap = seriesMap.get(sName)!;
        if (!catMap.has(xVal)) {
            catMap.set(xVal, []);
        }
        catMap.get(xVal)!.push(yVal);
    });

    const xAxisData = Array.from(uniqueX);
    const seriesOptions: BoxplotSeriesOption[] = [];

    seriesMap.forEach((catMap, sName) => {
        // Prepare data for prepareBoxplotData
        // We need a 2D array where each row is a category's data points
        const rawData: number[][] = [];

        xAxisData.forEach(xVal => {
             const values = catMap.get(xVal) || [];
             rawData.push(values);
        });

        // Use standard ECharts data tool to process the data
        // prepareBoxplotData expects [ [v1, v2...], [v3, v4...] ] where each inner array is a category
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const result = prepareBoxplotData(rawData);

        // Result.boxData is the [min, Q1, median, Q3, max] arrays
        // Result.outliers is the outlier data points

        seriesOptions.push({
            name: sName,
            type: 'boxplot',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            data: result.boxData
        });
    });

    const opt: EChartsOption = {
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: options?.legend ? {} : undefined,
        xAxis: {
            type: 'category',
            data: xAxisData,
            boundaryGap: true,
            splitArea: {
                show: false
            },
            splitLine: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            splitArea: {
                show: true
            }
        },
        series: seriesOptions
    };
    return opt;
}
