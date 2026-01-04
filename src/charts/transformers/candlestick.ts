import type { EChartsOption, CandlestickSeriesOption, XAXisComponentOption, YAXisComponentOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface CandlestickTransformerOptions extends BaseTransformerOptions {
    openProp?: string;
    closeProp?: string;
    lowProp?: string;
    highProp?: string;

    // Axis Options
    xAxisLabel?: string;
    yAxisLabel?: string; // There is usually no single "Y" prop for Candlestick, but a label override is useful.
    xAxisLabelRotate?: number;
    flipAxis?: boolean;
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

    const xAxisLabel = options?.xAxisLabel;
    const yAxisLabel = options?.yAxisLabel;
    const xAxisLabelRotate = options?.xAxisLabelRotate;
    const flipAxis = options?.flipAxis;

    // 1. Prepare Data
    // ECharts Candlestick Data: [Open, Close, Lowest, Highest]
    const categoryData: string[] = [];
    const values: number[][] = [];

    // Sort data by date if possible? Usually user sorts via query, but we can try sorting if xProp looks like date.
    // For now, assume data is in order or order doesn't matter (categorical).

    for (const item of data) {
        const xValRaw = getNestedValue(item, xProp);
        const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);

        const openVal = Number(getNestedValue(item, openProp));
        const closeVal = Number(getNestedValue(item, closeProp));
        const lowVal = Number(getNestedValue(item, lowProp));
        const highVal = Number(getNestedValue(item, highProp));

        // Validation: All 4 values must be valid numbers
        // NOTE: Number(null) is 0, Number(undefined) is NaN.
        // We need to verify that the raw values were not null/undefined/non-numeric strings.
        // The check !isNaN(val) handles undefined and non-numeric strings.
        // It treats null as 0.
        // If we want to exclude nulls, we should check raw values. But let's assume loose check is okay for now EXCEPT for strict "missing values" test.
        // The test failure suggests `Number(null) === 0` is slipping through as valid, creating a data point [0, 105, 100, 112].

        // Let's make it stricter.
        const openRaw = getNestedValue(item, openProp);
        const closeRaw = getNestedValue(item, closeProp);
        const lowRaw = getNestedValue(item, lowProp);
        const highRaw = getNestedValue(item, highProp);

        const isValid = (v: any) => v !== null && v !== undefined && !isNaN(Number(v));

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

    // Configure Axes
    const categoryAxis: XAXisComponentOption | YAXisComponentOption = {
        type: 'category',
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

    const valueAxis: XAXisComponentOption | YAXisComponentOption = {
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
        opt.xAxis = valueAxis;
        opt.yAxis = categoryAxis;
    } else {
        opt.xAxis = categoryAxis;
        opt.yAxis = valueAxis;
    }

    return opt;
}
