import type { EChartsOption, ParallelSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

// Define ParallelAxisOption manually since it's not exported nicely
interface ParallelAxisOption {
    dim: number;
    name: string;
    type?: 'value' | 'category' | 'time' | 'log';
    data?: (string | number)[];
}

export interface ParallelTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;
}

export function createParallelChartOption(
    data: Record<string, unknown>[],
    dimensionsStr: string,
    _unusedYProp: string, // Not used for Parallel
    options?: ParallelTransformerOptions
): EChartsOption {
    const seriesProp = options?.seriesProp;
    const dimensions = dimensionsStr.split(',').map(d => d.trim()).filter(d => d.length > 0);

    if (dimensions.length === 0) {
        return {};
    }

    // 1. Identify Series (Grouping) using functional pattern
    const getSeriesName = (item: Record<string, unknown>): string => {
        if (!seriesProp) return 'Default';
        const valRaw = getNestedValue(item, seriesProp);
        return valRaw === undefined || valRaw === null ? 'Default' : safeToString(valRaw);
    };

    const uniqueSeries = Array.from(new Set(data.map(getSeriesName)));

    // 2. Build Parallel Axes Config using functional pattern
    const axisConfigs: ParallelAxisOption[] = dimensions.map((dim, index) => {
        const values = data.map(item => getNestedValue(item, dim));
        const nonNullValues = values.filter(v => v !== undefined && v !== null && v !== '');

        // Determine if numeric
        const isNumeric = nonNullValues.length > 0 && nonNullValues.every(v => !isNaN(Number(v)));

        if (isNumeric) {
            return { dim: index, name: dim, type: 'value' };
        } else {
            const uniqueValues = Array.from(new Set(nonNullValues.map(safeToString)));
            return { dim: index, name: dim, type: 'category', data: uniqueValues };
        }
    });

    // 3. Build Series Data using functional pattern
    const groupedData = data.reduce<Record<string, (string | number)[][]>>((acc, item) => {
        const sName = getSeriesName(item);

        const rowData = dimensions.map(dim => {
            const valRaw = getNestedValue(item, dim);
            if (valRaw === undefined || valRaw === null) {
                return 'N/A';
            }
            const valNum = Number(valRaw);
            return !isNaN(valNum) ? valNum : safeToString(valRaw);
        });

        if (!acc[sName]) {
            acc[sName] = [];
        }
        // ESLint complains if we assert non-null unnecessarily, but Typescript might not infer it correctly without strictNullChecks or flow analysis on object access.
        // If acc[sName] is assigned above, it is definitely there.
        acc[sName].push(rowData);
        return acc;
    }, {});

    const seriesList: ParallelSeriesOption[] = Object.entries(groupedData).map(([sName, sData]) => {
        const seriesOpt: ParallelSeriesOption = {
            type: 'parallel',
            data: sData,
            lineStyle: {
                width: 2
            }
        };

        if (seriesProp) {
            seriesOpt.name = sName;
        }

        return seriesOpt;
    });

    // If no series prop, flatten all data into one series if multiple groups were accidentally created (shouldn't happen with 'Default')
    // Actually, if seriesProp is undefined, getSeriesName returns 'Default', so we have one entry 'Default'.
    // If we want a clean single series without name when no seriesProp is present:
    if (!seriesProp && seriesList.length === 1) {
        delete seriesList[0]!.name;
    }

    const opt: EChartsOption = {
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
        // Using unknown[] cast to satisfy both strict type checks (EChartsOption expects something compatible)
        // and lint rules (no explicit any).
        parallelAxis: axisConfigs as unknown as Record<string, unknown>[],
        series: seriesList,
        tooltip: {
            trigger: 'item'
        }
    };

    if (options?.legend) {
        opt.legend = {
            data: uniqueSeries,
            top: 5
        };
    }

    return opt;
}
