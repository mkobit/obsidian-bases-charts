import type { EChartsOption, SeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { getNestedValue, safeToString } from './utils';
import * as R from 'remeda';

export interface ParallelTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;
}

// Define the interface locally as it might not be exported by echarts top-level
interface ParallelAxisOption {
    dim: number;
    name: string;
    type?: 'category' | 'value';
    data?: string[];
    nameLocation?: 'start' | 'middle' | 'end';
}

export function createParallelChartOption(
    data: Record<string, unknown>[],
    dimensionsStr: string,
    options?: ParallelTransformerOptions
): EChartsOption {
    // 1. Parse dimensions
    const dims = dimensionsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (dims.length === 0) {
        return {
            title: {
                text: 'No dimensions specified'
            }
        };
    }

    const seriesProp = options?.seriesProp;

    // 2. Prepare Parallel Axis
    // Use standard map to avoid remeda type issues with indexed map in strict mode
    const parallelAxis: ParallelAxisOption[] = dims.map((dim, index) => {
        // Collect all values for this dimension to infer type
        const values = R.map(data, item => getNestedValue(item, dim));

        // Check if all non-null values are numeric
        const nonNullValues = R.filter(values, v => v !== null && v !== undefined && v !== '');
        const isNumeric = nonNullValues.every(v => !isNaN(Number(v)));

        if (isNumeric && nonNullValues.length > 0) {
            return {
                dim: index,
                name: dim,
                type: 'value'
            };
        } else {
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
        }
    });

    // 3. Prepare Data
    // Group by series first
    const seriesDataMap = R.pipe(
        data,
        R.groupBy(item => {
            if (seriesProp) {
                const sValRaw = getNestedValue(item, seriesProp);
                if (sValRaw !== undefined && sValRaw !== null) {
                    return safeToString(sValRaw);
                }
            }
            return 'Series 1';
        }),
        R.mapValues(items => {
            return R.map(items, item => {
                return R.map(dims, dim => {
                     const valRaw = getNestedValue(item, dim);
                     if (valRaw === null || valRaw === undefined || valRaw === '') return null;

                     const axis = parallelAxis.find(a => a.name === dim);
                     const isNum = axis?.type === 'value';
                     return isNum ? Number(valRaw) : safeToString(valRaw);
                });
            });
        })
    );

    const series: SeriesOption[] = R.pipe(
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
        // Casting to any because strict ECharts types might complain about local ParallelAxisOption
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        parallelAxis: parallelAxis as any,
        series: series,
        ...(options?.legend ? {
            legend: {
                data: R.keys(seriesDataMap)
            }
        } : {})
    };

    return option;
}
