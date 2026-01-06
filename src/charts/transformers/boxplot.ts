import type { EChartsOption, BoxplotSeriesOption } from 'echarts';
// @ts-expect-error ECharts extension imports can be tricky with type definitions
import prepareBoxplotData from 'echarts/extension/dataTool/prepareBoxplotData';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';
import * as R from 'remeda';

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

    // 1. Collect all unique X values (categories)
    const xAxisData = R.pipe(
        data,
        R.map(item => {
            const xValRaw = getNestedValue(item, xProp);
            return xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);
        }),
        R.unique()
    );

    // 2. Group data by series and category
    // Map<SeriesName, Map<CategoryName, number[]>>
    const seriesMap = R.pipe(
        data,
        R.groupBy(item => {
            return !seriesProp
                ? yProp
                : (() => {
                    const sRaw = getNestedValue(item, seriesProp);
                    return sRaw === undefined || sRaw === null ? 'Series 1' : safeToString(sRaw);
                })();
        }),
        R.mapValues(items => {
            return R.pipe(
                items,
                R.groupBy(item => {
                    const xValRaw = getNestedValue(item, xProp);
                    return xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);
                }),
                R.mapValues(catItems => {
                    return R.pipe(
                        catItems,
                        R.map(item => Number(getNestedValue(item, yProp))),
                        R.filter(val => !Number.isNaN(val))
                    );
                })
            );
        })
    );

    // 3. Transform to ECharts series
    const seriesOptions: BoxplotSeriesOption[] = R.pipe(
        seriesMap,
        R.entries(),
        R.map(([sName, catMap]) => {
            // Prepare data for prepareBoxplotData
            // We need a 2D array where each row is a category's data points
            const rawData = xAxisData.map(xVal => catMap[xVal] || []);

            // Use standard ECharts data tool to process the data
            // prepareBoxplotData expects [ [v1, v2...], [v3, v4...] ] where each inner array is a category
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
            const result = prepareBoxplotData(rawData);

            return {
                name: sName,
                type: 'boxplot' as const,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                data: result.boxData
            };
        })
    );

    const opt: EChartsOption = {
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'shadow'
            }
        },
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
        series: seriesOptions,
        ...(options?.legend ? { legend: {} } : {})
    };
    return opt;
}
