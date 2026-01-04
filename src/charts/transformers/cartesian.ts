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

    // 1. Collect all unique X values and Series values using functional patterns
    const uniqueX = Array.from(new Set(data.map(item => {
        const valRaw = getNestedValue(item, xProp);
        return valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);
    })));

    const uniqueSeries = Array.from(new Set(data.map(item => {
        if (seriesProp) {
            const sValRaw = getNestedValue(item, seriesProp);
            return (sValRaw !== undefined && sValRaw !== null) ? safeToString(sValRaw) : 'Series 1';
        }
        return yProp;
    })));

    // Create a lookup map: xVal -> sVal -> yVal
    const dataMap = data.reduce((acc, item) => {
        const xValRaw = getNestedValue(item, xProp);
        const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);

        let sVal = yProp;
        if (seriesProp) {
            const sValRaw = getNestedValue(item, seriesProp);
            sVal = (sValRaw !== undefined && sValRaw !== null) ? safeToString(sValRaw) : 'Series 1';
        }

        const yVal = Number(getNestedValue(item, yProp));
        if (!isNaN(yVal)) {
            if (!acc.has(xVal)) {
                acc.set(xVal, new Map());
            }
            acc.get(xVal)!.set(sVal, yVal);
        }
        return acc;
    }, new Map<string, Map<string, number>>());

    // 2. Build Dataset Source (2D Array)
    const headerRow = [xProp, ...uniqueSeries];

    const dataRows = uniqueX.map(xVal => {
        const rowData = dataMap.get(xVal);
        const seriesValues = uniqueSeries.map(sName => {
            if (rowData && rowData.has(sName)) {
                return rowData.get(sName)!;
            }
            return null;
        });
        return [xVal, ...seriesValues];
    });

    const datasetSource = [headerRow, ...dataRows];

    // 3. Build Series Options
    const seriesOptions: SeriesOption[] = uniqueSeries.map((sName) => {
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
