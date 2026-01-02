import type { EChartsOption, CandlestickSeriesOption } from 'echarts';
import type { CandlestickTransformerOptions } from './types';
import { safeToString, getNestedValue } from './utils';

export function createCandlestickChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    options?: CandlestickTransformerOptions
): EChartsOption {
    const openProp = options?.openProp ?? 'open';
    const closeProp = options?.closeProp ?? 'close';
    const lowProp = options?.lowProp ?? 'low';
    const highProp = options?.highProp ?? 'high';

    // 1. Extract X Axis Data
    // We assume data is somewhat sorted or we just take it as is.
    // ECharts Candlestick expects category axis for X usually.
    const xAxisData: string[] = [];
    const values: number[][] = []; // [open, close, low, high]

    // Use a unique set for X to avoid duplicates if that is an issue,
    // but candlestick usually implies sequential time data.
    // However, if we have duplicate X values, ECharts might just overlay them.
    // For now, let's process sequentially but filter out incomplete rows.

    data.forEach(item => {
        const xValRaw = getNestedValue(item, xProp);
        const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);

        const openRaw = getNestedValue(item, openProp);
        const closeRaw = getNestedValue(item, closeProp);
        const lowRaw = getNestedValue(item, lowProp);
        const highRaw = getNestedValue(item, highProp);

        // Explicitly check for null or undefined before converting to number
        // Because Number(null) is 0, which we might want to treat as missing for financial data
        if (openRaw === null || openRaw === undefined ||
            closeRaw === null || closeRaw === undefined ||
            lowRaw === null || lowRaw === undefined ||
            highRaw === null || highRaw === undefined) {
            return;
        }

        const openVal = Number(openRaw);
        const closeVal = Number(closeRaw);
        const lowVal = Number(lowRaw);
        const highVal = Number(highRaw);

        // Skip if any required value is missing
        if (isNaN(openVal) || isNaN(closeVal) || isNaN(lowVal) || isNaN(highVal)) {
            return;
        }

        // Only add if not "Unknown" or handle duplicates?
        // ECharts expects aligned arrays.
        xAxisData.push(xVal);
        values.push([openVal, closeVal, lowVal, highVal]);
    });

    const seriesItem: CandlestickSeriesOption = {
        type: 'candlestick',
        data: values,
        itemStyle: {
            // Western standard: Up = Green, Down = Red
            color: '#14b143',
            color0: '#ef232a',
            borderColor: '#14b143',
            borderColor0: '#ef232a'
        }
    };

    const opt: EChartsOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false }
        },
        yAxis: {
            scale: true,
            splitArea: {
                show: true
            }
        },
        dataZoom: [
            {
                type: 'inside',
                start: 50,
                end: 100
            },
            {
                show: true,
                type: 'slider',
                top: '90%',
                start: 50,
                end: 100
            }
        ],
        series: [seriesItem]
    };

    return opt;
}
