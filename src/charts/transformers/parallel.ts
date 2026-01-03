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

    // 1. Identify Series (Grouping)
    const uniqueSeries = new Set<string>();
    for (const item of data) {
        let sName = 'Default';
        if (seriesProp) {
            const valRaw = getNestedValue(item, seriesProp);
            sName = valRaw === undefined || valRaw === null ? 'Default' : safeToString(valRaw);
        }
        uniqueSeries.add(sName);
    }

    // 2. Build Parallel Axes Config
    const axisConfigs: ParallelAxisOption[] = dimensions.map((dim, index) => {
        let isNumeric = true;
        const uniqueValues = new Set<string>();

        for (const item of data) {
            const valRaw = getNestedValue(item, dim);
            if (valRaw !== undefined && valRaw !== null && valRaw !== '') {
                if (isNaN(Number(valRaw))) {
                    isNumeric = false;
                }
                uniqueValues.add(safeToString(valRaw));
            }
        }

        if (isNumeric) {
            return { dim: index, name: dim, type: 'value' };
        } else {
            return { dim: index, name: dim, type: 'category', data: Array.from(uniqueValues) };
        }
    });

    // 3. Build Series Data
    const seriesDataMap = new Map<string, (string | number)[][]>();

    // Initialize map
    for (const s of uniqueSeries) {
        seriesDataMap.set(s, []);
    }

    for (const item of data) {
        let sName = 'Default';
        if (seriesProp) {
            const valRaw = getNestedValue(item, seriesProp);
            sName = valRaw === undefined || valRaw === null ? 'Default' : safeToString(valRaw);
        }

        const rowData: (string | number)[] = [];
        for (const dim of dimensions) {
            const valRaw = getNestedValue(item, dim);
            if (valRaw === undefined || valRaw === null) {
                rowData.push('N/A');
            } else {
                const valStr = safeToString(valRaw);
                const valNum = Number(valRaw);
                if (!isNaN(valNum)) {
                     rowData.push(valNum);
                } else {
                     rowData.push(valStr);
                }
            }
        }

        seriesDataMap.get(sName)?.push(rowData);
    }

    const seriesList: ParallelSeriesOption[] = [];

    if (!seriesProp) {
        const allData: (string | number)[][] = [];
        for (const arr of seriesDataMap.values()) {
            allData.push(...arr);
        }
         seriesList.push({
            type: 'parallel',
            data: allData,
            lineStyle: {
                width: 2
            }
        });
    } else {
        for (const [sName, sData] of seriesDataMap.entries()) {
            seriesList.push({
                name: sName,
                type: 'parallel',
                data: sData,
                lineStyle: {
                    width: 2
                }
            });
        }
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
        // The ECharts type definition for `parallelAxis` likely allows an array of objects.
        parallelAxis: axisConfigs as unknown as Record<string, unknown>[],
        series: seriesList,
        tooltip: {
            trigger: 'item'
        }
    };

    if (options?.legend) {
        opt.legend = {
            data: Array.from(uniqueSeries),
            top: 5
        };
    }

    return opt;
}
