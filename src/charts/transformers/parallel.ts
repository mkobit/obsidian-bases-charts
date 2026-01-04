import type { EChartsOption } from 'echarts';
import { BaseTransformerOptions } from './base';
import { getNestedValue, safeToString } from './utils';

// ECharts does not export ParallelAxisOption directly in the main namespace sometimes,
// or it's deeply nested. We define a partial interface for what we need to satisfy TS.
export interface ParallelAxisOption {
    dim: number;
    name: string;
    type?: 'category' | 'value' | 'time' | 'log';
    data?: string[]; // For category type
    min?: number;
    max?: number;
}

export interface ParallelTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;
}

export function createParallelChartOption(
    data: Record<string, unknown>[],
    dimsProp: string, // We repurpose xProp to pass comma-separated dimensions
    options?: ParallelTransformerOptions
): EChartsOption {
    if (!data || data.length === 0 || !dimsProp) {
        return {};
    }

    const dimensionKeys = dimsProp.split(',').map(d => d.trim()).filter(d => d.length > 0);

    if (dimensionKeys.length === 0) {
        return {};
    }

    // 1. Determine Axis Types (Value or Category)
    // We scan the data to see if a dimension is purely numeric or categorical.
    const axisTypes: Record<string, 'value' | 'category'> = {};
    const categoryDomains: Record<string, Set<string>> = {};

    dimensionKeys.forEach(key => {
        let isNumeric = true;
        const seenValues = new Set<string>();

        for (const item of data) {
            const val = getNestedValue(item, key);
            if (val === null || val === undefined) continue;

            if (typeof val !== 'number') {
                // If it's a string looking like a number, we might consider it numeric,
                // but for safety in Parallel Coordinates, strict number check is often better
                // unless we parse. Let's try to be flexible: if it parses as number, good.
                const numVal = parseFloat(String(val));
                if (isNaN(numVal)) {
                    isNumeric = false;
                }
            }
            seenValues.add(safeToString(val));
        }

        if (isNumeric) {
            axisTypes[key] = 'value';
        } else {
            axisTypes[key] = 'category';
            categoryDomains[key] = seenValues;
        }
    });

    // 2. Build ParallelAxis configuration
    const parallelAxis: ParallelAxisOption[] = dimensionKeys.map((key, index) => {
        const type = axisTypes[key];
        const baseConfig: ParallelAxisOption = {
            dim: index,
            name: key,
            type: type
        };

        if (type === 'category') {
            baseConfig.data = Array.from(categoryDomains[key] || []).sort();
        }

        return baseConfig;
    });

    // 3. Build Series Data
    const seriesProp = options?.seriesProp;
    const seriesList: any[] = []; // ECharts SeriesOption

    if (seriesProp) {
        // Group by seriesProp
        const groupedRows: Record<string, (string | number)[][]> = {};

        data.forEach(item => {
            const groupKey = safeToString(getNestedValue(item, seriesProp)) || 'Undefined';
            if (!groupedRows[groupKey]) {
                groupedRows[groupKey] = [];
            }

            const row: (string | number)[] = dimensionKeys.map(key => {
                 const val = getNestedValue(item, key);
                 if (axisTypes[key] === 'value') {
                     const num = parseFloat(String(val));
                     return isNaN(num) ? 0 : num;
                 }
                 return safeToString(val);
            });

            groupedRows[groupKey].push(row);
        });

        Object.keys(groupedRows).forEach(name => {
            seriesList.push({
                name: name,
                type: 'parallel',
                lineStyle: {
                    width: 2
                },
                data: groupedRows[name]
            });
        });

    } else {
        // Single series
        const rows = data.map(item => {
            return dimensionKeys.map(key => {
                const val = getNestedValue(item, key);
                if (axisTypes[key] === 'value') {
                    const num = parseFloat(String(val));
                    return isNaN(num) ? 0 : num;
                }
                return safeToString(val);
            });
        });

        seriesList.push({
            type: 'parallel',
            lineStyle: {
                width: 2,
                 // color: '#5470C6' // Default ECharts color
            },
            data: rows
        });
    }

    return {
        tooltip: {
            padding: 10,
            backgroundColor: '#222',
            borderColor: '#777',
            borderWidth: 1
        },
        legend: options?.legend ? {
            show: true,
            data: seriesList.map(s => s.name).filter(n => n)
        } : undefined,
        parallelAxis: parallelAxis,
        series: seriesList
    };
}
