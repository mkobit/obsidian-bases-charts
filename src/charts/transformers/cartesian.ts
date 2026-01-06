import type { EChartsOption, SeriesOption, LineSeriesOption, BarSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';
import * as R from 'remeda';

export interface CartesianTransformerOptions extends BaseTransformerOptions {
    smooth?: boolean;
    showSymbol?: boolean;
    areaStyle?: boolean;
    stack?: boolean;
    seriesProp?: string;
}

export function createCartesianChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    chartType: 'bar' | 'line',
    options?: CartesianTransformerOptions
): EChartsOption {
    const seriesProp = options?.seriesProp;
    const isStacked = options?.stack;
    const flipAxis = options?.flipAxis ?? false;
    const xAxisLabel = options?.xAxisLabel ?? xProp;
    const yAxisLabel = options?.yAxisLabel ?? yProp;
    const xAxisRotate = options?.xAxisLabelRotate ?? 0;

    // 1. Get all unique X values (categories)
    const xAxisData = R.pipe(
        data,
        R.map((item) => {
            const valRaw = getNestedValue(item, xProp);
            return valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);
        }),
        R.unique()
    );

    // 2. Group data by series and map to axis
    const seriesDataMap = R.pipe(
        data,
        R.groupBy((item) => {
            return !seriesProp
                ? yProp
                : (() => {
                    const sValRaw = getNestedValue(item, seriesProp);
                    return sValRaw !== undefined && sValRaw !== null ? safeToString(sValRaw) : 'Series 1';
                })();
        }),
        R.mapValues((items) => {
            // Map items to their values by xIndex
            // We want an array of length xAxisData.length, with nulls where missing
            const valueMap = R.pipe(
                items,
                R.map((item) => {
                    const xValRaw = getNestedValue(item, xProp);
                    const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);
                    const yVal = Number(getNestedValue(item, yProp));
                    return { xVal, yVal };
                }),
                R.indexBy((x) => x.xVal)
            );

            return xAxisData.map((xVal) => {
                const found = valueMap[xVal];
                return found && !Number.isNaN(found.yVal) ? found.yVal : null;
            });
        })
    );

    // Build Series Options
    const seriesOptions: SeriesOption[] = R.pipe(
        seriesDataMap,
        R.entries(),
        R.map(([sName, sData]) => {
            const base = {
                name: sName,
                data: sData
            };

            return chartType === 'line'
                ? (() => {
                     const lineItem: LineSeriesOption = {
                         ...base,
                         type: 'line',
                         ...(options?.smooth ? { smooth: true } : {}),
                         ...(options?.showSymbol === false ? { showSymbol: false } : {}),
                         ...(options?.areaStyle ? { areaStyle: {} } : {}),
                         ...(isStacked ? { stack: 'total' } : {})
                     };
                     return lineItem;
                })()
                : (() => {
                    const barItem: BarSeriesOption = {
                        ...base,
                        type: 'bar',
                        ...(isStacked ? { stack: 'total' } : {})
                    };
                    return barItem;
                })();
        })
    );

    const opt: EChartsOption = {
        xAxis: flipAxis
            ? {
                type: 'value',
                name: yAxisLabel
            }
            : {
                type: 'category',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
                data: xAxisData as any,
                name: xAxisLabel,
                axisLabel: {
                    rotate: xAxisRotate
                }
            },
        yAxis: flipAxis
            ? {
                type: 'category',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
                data: xAxisData as any,
                name: xAxisLabel,
                axisLabel: {
                    rotate: xAxisRotate
                }
            }
            : {
                type: 'value',
                name: yAxisLabel
            },
        series: seriesOptions,
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            containLabel: true
        },
        ...(options?.legend ? { legend: {} } : {})
    };

    return opt;
}
