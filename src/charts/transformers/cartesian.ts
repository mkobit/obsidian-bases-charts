import type { EChartsOption, SeriesOption, LineSeriesOption, BarSeriesOption, XAXisComponentOption, YAXisComponentOption } from 'echarts';
import type { BaseTransformerOptions, AxisOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface CartesianTransformerOptions extends BaseTransformerOptions {
    smooth?: boolean;
    showSymbol?: boolean;
    areaStyle?: boolean;
    stack?: boolean;
    seriesProp?: string;

    axis?: AxisOptions;
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

    const xAxisLabel = options?.axis?.xAxisLabel;
    const yAxisLabel = options?.axis?.yAxisLabel;
    const xAxisLabelRotate = options?.axis?.xAxisLabelRotate;
    const flipAxis = options?.axis?.flipAxis;

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

        let sVal = yProp;
        if (seriesProp) {
            const sValRaw = getNestedValue(item, seriesProp);
            if (sValRaw !== undefined && sValRaw !== null) {
                sVal = safeToString(sValRaw);
            } else {
                sVal = 'Series 1';
            }
        }

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

    // Extract axis settings into plain objects to avoid strict type mismatch when swapping
    const categoryAxisSettings = {
        type: 'category' as const,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        data: xAxisData as any,
        name: xAxisLabel || xProp,
        axisLabel: {
            interval: 0,
            rotate: xAxisLabelRotate !== undefined ? xAxisLabelRotate : 30
        }
    };

    const valueAxisSettings = {
        type: 'value' as const,
        name: yAxisLabel || yProp
    };

    const opt: EChartsOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        grid: {
            containLabel: true
        },
        legend: options?.legend ? {} : undefined,
        series: seriesOptions
    };

    if (flipAxis) {
        // Horizontal: X is Value, Y is Category
        opt.xAxis = valueAxisSettings;
        opt.yAxis = categoryAxisSettings;
    } else {
        // Vertical (Default): X is Category, Y is Value
        opt.xAxis = categoryAxisSettings;
        opt.yAxis = valueAxisSettings;
    }

    return opt;
}
