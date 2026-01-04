import type { EChartsOption, SeriesOption, LineSeriesOption, BarSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

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

    // 1. Collect all unique X values and Series values
    const uniqueX = new Set<string>();
    const uniqueSeries = new Set<string>();
    // Map of xVal -> { sVal -> yVal }
    const dataMap = new Map<string, Map<string, number>>();

    for (const item of data) {
        const valRaw = getNestedValue(item, xProp);
        const xVal = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);
        uniqueX.add(xVal);

        let sVal = yProp; // Default series name if no seriesProp
        if (seriesProp) {
            const sValRaw = getNestedValue(item, seriesProp);
            if (sValRaw !== undefined && sValRaw !== null) {
                sVal = safeToString(sValRaw);
            } else {
                sVal = 'Series 1';
            }
        }
        uniqueSeries.add(sVal);

        const yVal = Number(getNestedValue(item, yProp));
        if (!isNaN(yVal)) {
            if (!dataMap.has(xVal)) {
                dataMap.set(xVal, new Map());
            }
            dataMap.get(xVal)!.set(sVal, yVal);
        }
    }

    const xAxisData = Array.from(uniqueX);
    const seriesNames = Array.from(uniqueSeries);

    // 2. Build Dataset Source (2D Array)
    // Row 1: [xProp, ...seriesNames]
    const datasetSource: (string | number | null)[][] = [];

    // Header
    datasetSource.push([xProp, ...seriesNames]);

    // Rows
    for (const xVal of xAxisData) {
        const row: (string | number | null)[] = [xVal];
        const rowData = dataMap.get(xVal);
        for (const sName of seriesNames) {
            if (rowData && rowData.has(sName)) {
                row.push(rowData.get(sName)!);
            } else {
                row.push(null);
            }
        }
        datasetSource.push(row);
    }

    // 3. Build Series Options
    const seriesOptions: SeriesOption[] = seriesNames.map((sName) => {
        const base = {
            name: sName,
            // No data property here!
        };

        if (chartType === 'line') {
             const lineItem: LineSeriesOption = {
                 ...base,
                 type: 'line'
             };
             if (options?.smooth) lineItem.smooth = true;
             if (options?.showSymbol === false) lineItem.showSymbol = false;
             if (options?.areaStyle) lineItem.areaStyle = {};
             if (isStacked) lineItem.stack = 'total';
             return lineItem;
        } else {
            const barItem: BarSeriesOption = {
                ...base,
                type: 'bar'
            };
            if (isStacked) barItem.stack = 'total';
            return barItem;
        }
    });

    const opt: EChartsOption = {
        dataset: {
            source: datasetSource
        },
        xAxis: {
            type: 'category',
            name: xProp
        },
        yAxis: {
            type: 'value',
            name: yProp
        },
        series: seriesOptions,
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            containLabel: true
        }
    };

    if (options?.legend) {
        opt.legend = {};
    }

    return opt;
}
