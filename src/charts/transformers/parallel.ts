import type { EChartsOption, SeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { getNestedValue, safeToString, getLegendOption } from './utils';
import * as R from 'remeda';

export interface ParallelTransformerOptions extends BaseTransformerOptions {
    readonly seriesProp?: string;
}

// Define the interface locally as it might not be exported by echarts top-level
interface ParallelAxisOption {
    readonly dim: number;
    readonly name: string;
    readonly type?: 'category' | 'value';
    readonly data?: readonly string[];
    readonly nameLocation?: 'start' | 'middle' | 'end';
}

export function createParallelChartOption(
    data: readonly Record<string, unknown>[],
    dimensionsStr: string,
    options?: ParallelTransformerOptions
): EChartsOption {
    // 1. Parse dimensions
    const dims = dimensionsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);

    return dims.length === 0
        ? {
            title: {
                text: 'No dimensions specified'
            }
        }
        : (() => {
            const seriesProp = options?.seriesProp;

            // 2. Prepare Parallel Axis
            // Use standard map to avoid remeda type issues with indexed map in strict mode
            const parallelAxis: readonly ParallelAxisOption[] = dims.map((dim, index) => {
                // Collect all values for this dimension to infer type
                const values = R.map(data, item => getNestedValue(item, dim));

                // Check if all non-null values are numeric
                const nonNullValues = R.filter(values, v => v !== null && v !== undefined && v !== '');
                const isNumeric = nonNullValues.every(v => !Number.isNaN(Number(v)));

                return (isNumeric && nonNullValues.length > 0)
                    ? {
                        dim: index,
                        name: dim,
                        type: 'value'
                    }
                    : (() => {
                        const uniqueVals = R.pipe(
                            nonNullValues,
                            R.map(v => safeToString(v)),
                            R.unique()
                        );
                        return {
                            dim: index,
                            name: dim,
                            type: 'category',
                            data: uniqueVals
                        };
                    })();
            });

            // 3. Prepare Data
            // Group by series first
            const seriesDataMap = R.pipe(
                data,
                R.groupBy(item => {
                    return seriesProp
                        ? (() => {
                            const sValRaw = getNestedValue(item, seriesProp);
                            return (sValRaw !== undefined && sValRaw !== null) ? safeToString(sValRaw) : 'Series 1';
                        })()
                        : 'Series 1';
                }),
                R.mapValues(items => {
                    return R.map(items, item => {
                        return R.map(dims, dim => {
                             const valRaw = getNestedValue(item, dim);

                             return (valRaw === null || valRaw === undefined || valRaw === '')
                                ? null
                                : (() => {
                                     const axis = parallelAxis.find(a => a.name === dim);
                                     const isNum = axis?.type === 'value';
                                     return isNum ? Number(valRaw) : safeToString(valRaw);
                                })();
                        });
                    });
                })
            );

            const series: readonly SeriesOption[] = R.pipe(
                seriesDataMap,
                R.entries(),
                R.map(([name, sData]) => {
                    return {
                        name: name,
                        type: 'parallel' as const,
                        lineStyle: {
                            width: 2 // make lines visible
                        },
                        data: sData
                    };
                })
            );

            const option: EChartsOption = {
                parallel: {
                    left: '5%',
                    right: '13%',
                    bottom: '10%',
                    top: '20%',
                    parallelAxisDefault: {
                        type: 'value',
                        nameLocation: 'end',
                        nameGap: 20
                    }
                },
                parallelAxis: parallelAxis as unknown as EChartsOption['parallelAxis'],
                // eslint-disable-next-line functional/prefer-readonly-type
                series: series as unknown as SeriesOption[],
                ...(getLegendOption(options) ? {
                    legend: {
                        data: R.keys(seriesDataMap),
                        ...getLegendOption(options)
                    }
                } : {})
            };

            return option;
        })();
}
