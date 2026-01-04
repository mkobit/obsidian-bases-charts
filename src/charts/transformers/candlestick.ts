import type { EChartsOption, CandlestickSeriesOption } from 'echarts';
import type { BaseTransformerOptions, AxisOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface CandlestickTransformerOptions extends BaseTransformerOptions {
    openProp?: string;
    closeProp?: string;
    lowProp?: string;
    highProp?: string;

    axis?: AxisOptions;
}

export function createCandlestickChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    options?: CandlestickTransformerOptions
): EChartsOption {
    const openProp = options?.openProp || 'open';
    const closeProp = options?.closeProp || 'close';
    const lowProp = options?.lowProp || 'low';
    const highProp = options?.highProp || 'high';

    const xAxisLabel = options?.axis?.xAxisLabel;
    const yAxisLabel = options?.axis?.yAxisLabel;
    const xAxisLabelRotate = options?.axis?.xAxisLabelRotate;
    const flipAxis = options?.axis?.flipAxis;

    // 1. Prepare Data
    // ECharts Candlestick Data: [Open, Close, Lowest, Highest]
    const categoryData: string[] = [];
    const values: number[][] = [];

    // Helper to validate numbers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isValid = (v: any) => v !== null && v !== undefined && !isNaN(Number(v));

    for (const item of data) {
        const xValRaw = getNestedValue(item, xProp);
        const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);

        const openRaw = getNestedValue(item, openProp);
        const closeRaw = getNestedValue(item, closeProp);
        const lowRaw = getNestedValue(item, lowProp);
        const highRaw = getNestedValue(item, highProp);

        if (isValid(openRaw) && isValid(closeRaw) && isValid(lowRaw) && isValid(highRaw)) {
             categoryData.push(xVal);
             values.push([Number(openRaw), Number(closeRaw), Number(lowRaw), Number(highRaw)]);
        }
    }

    const seriesItem: CandlestickSeriesOption = {
        type: 'candlestick',
        data: values,
        itemStyle: {
            color: '#14b143',
            color0: '#ef232a',
            borderColor: '#14b143',
            borderColor0: '#ef232a'
        }
    };

    // Configure Axes using plain objects to avoid strict type mismatch
    const categoryAxisSettings = {
        type: 'category' as const,
        data: categoryData,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax',
        name: flipAxis ? (yAxisLabel || 'Price') : (xAxisLabel || xProp),
        axisLabel: {
             rotate: xAxisLabelRotate
        }
    };

    const valueAxisSettings = {
        scale: true,
        splitArea: { show: true },
        name: flipAxis ? (xAxisLabel || xProp) : (yAxisLabel || 'Price')
    };

    const opt: EChartsOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' }
        },
        dataZoom: [
            { type: 'inside', start: 50, end: 100 },
            { show: true, type: 'slider', top: '90%', start: 50, end: 100 }
        ],
        series: [seriesItem]
    };

    if (flipAxis) {
        // Horizontal
        // valueAxisSettings is for Value axis (now on X)
        // categoryAxisSettings is for Category axis (now on Y)
        opt.xAxis = valueAxisSettings;
        opt.yAxis = categoryAxisSettings;
    } else {
        // Vertical
        opt.xAxis = categoryAxisSettings;
        opt.yAxis = valueAxisSettings;
    }

    return opt;
}
