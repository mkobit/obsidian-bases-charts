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

    // 1. Get all unique X values (categories)
    const uniqueX = new Set<string>();
    for (const item of data) {
        const valRaw = getNestedValue(item, xProp);
        const xVal = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);
        uniqueX.add(xVal);
    }
    const xAxisData = Array.from(uniqueX);

    // 2. Group data by series
    const seriesMap = data.reduce((acc, item) => {
        const xValRaw = getNestedValue(item, xProp);
        const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);

        const sValRaw = getNestedValue(item, seriesProp);
        const sVal = seriesProp && sValRaw !== undefined && sValRaw !== null
            ? safeToString(sValRaw)
            : (seriesProp ? 'Series 1' : yProp);

        const yVal = Number(getNestedValue(item, yProp));

        const xIndex = xAxisData.indexOf(xVal);
        if (xIndex !== -1 && !isNaN(yVal)) {
            if (!acc.has(sVal)) {
                // Explicitly type the array to avoid "any[] assigned to (number|null)[]"
                acc.set(sVal, new Array(xAxisData.length).fill(null) as (number | null)[]);
            }
            const arr = acc.get(sVal);
            if (arr) {
                arr[xIndex] = yVal;
            }
        }
        return acc;
    }, new Map<string, (number | null)[]>());

    // Build Series Options
    const seriesOptions: SeriesOption[] = Array.from(seriesMap.entries()).map(([sName, sData]) => {
        const base = {
            name: sName,
            data: sData
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
        xAxis: {
            type: 'category',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
            data: xAxisData as any,
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
