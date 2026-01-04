import type { EChartsOption, SeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { getNestedValue, safeToString } from './utils';

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
    // We need to determine the type of each axis.
    // If a dimension has string values that are not numbers, it's a category axis.
    // If all are numbers, it's a value axis.

    const parallelAxis: ParallelAxisOption[] = dims.map((dim, index) => {
        // Collect all values for this dimension to infer type
        const values = data.map(item => getNestedValue(item, dim));

        // Check if all non-null values are numeric
        const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
        const isNumeric = nonNullValues.every(v => !isNaN(Number(v)));

        if (isNumeric && nonNullValues.length > 0) {
            return {
                dim: index,
                name: dim,
                type: 'value'
            };
        } else {
            // It's a category axis. We need to collect unique values for 'data'.
            const uniqueVals = Array.from(new Set(nonNullValues.map(v => safeToString(v))));
            // Sort categories might be good, or keep order?
            // uniqueVals.sort();
            return {
                dim: index,
                name: dim,
                type: 'category',
                data: uniqueVals
            };
        }
    });

    // 3. Prepare Data
    // Parallel series data is an array of arrays: [[dim0Val, dim1Val, ...], ...]
    // We can group by seriesProp if provided.

    const seriesDataMap = new Map<string, (string | number | null)[][]>();

    for (const item of data) {
        let seriesName = 'Series 1';
        if (seriesProp) {
            const sValRaw = getNestedValue(item, seriesProp);
            if (sValRaw !== undefined && sValRaw !== null) {
                seriesName = safeToString(sValRaw);
            }
        }

        const rowData: (string | number | null)[] = dims.map(dim => {
             const valRaw = getNestedValue(item, dim);
             if (valRaw === null || valRaw === undefined || valRaw === '') return null;
             // If the axis is numeric, return number, else string
             const isNum = parallelAxis.find(a => a.name === dim)?.type === 'value';
             return isNum ? Number(valRaw) : safeToString(valRaw);
        });

        if (!seriesDataMap.has(seriesName)) {
            seriesDataMap.set(seriesName, []);
        }
        seriesDataMap.get(seriesName)!.push(rowData);
    }

    const series: SeriesOption[] = Array.from(seriesDataMap.entries()).map(([name, sData]) => {
        return {
            name: name,
            type: 'parallel',
            lineStyle: {
                width: 2 // make lines visible
            },
            data: sData
        };
    });

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
        // and we can't easily import the internal one.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        parallelAxis: parallelAxis as any,
        series: series
    };

    if (options?.legend) {
        option.legend = {
            data: Array.from(seriesDataMap.keys())
        };
    }

    return option;
}
