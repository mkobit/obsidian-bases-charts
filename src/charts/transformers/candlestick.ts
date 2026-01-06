import type { EChartsOption, CandlestickSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface CandlestickTransformerOptions extends BaseTransformerOptions {
    openProp?: string;
    closeProp?: string;
    lowProp?: string;
    highProp?: string;
}

export function createCandlestickChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    options?: CandlestickTransformerOptions
): EChartsOption {
    const openProp = options?.openProp ?? 'open';
    const closeProp = options?.closeProp ?? 'close';
    const lowProp = options?.lowProp ?? 'low';
    const highProp = options?.highProp ?? 'high';
    const xAxisLabel = options?.xAxisLabel ?? xProp;
    const xAxisRotate = options?.xAxisLabelRotate ?? 0;

    // Functional extraction
    const processedData = data
        .map(item => {
            const xValRaw = getNestedValue(item, xProp);
            const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);

            const openRaw = getNestedValue(item, openProp);
            const closeRaw = getNestedValue(item, closeProp);
            const lowRaw = getNestedValue(item, lowProp);
            const highRaw = getNestedValue(item, highProp);

            // Use conditional expression instead of if statement
            const rawValuesValid = openRaw !== null && openRaw !== undefined &&
                                   closeRaw !== null && closeRaw !== undefined &&
                                   lowRaw !== null && lowRaw !== undefined &&
                                   highRaw !== null && highRaw !== undefined;

            return rawValuesValid
                ? (() => {
                    const openVal = Number(openRaw);
                    const closeVal = Number(closeRaw);
                    const lowVal = Number(lowRaw);
                    const highVal = Number(highRaw);

                    const numericValuesValid = !Number.isNaN(openVal) && !Number.isNaN(closeVal) && !Number.isNaN(lowVal) && !Number.isNaN(highVal);

                    return numericValuesValid
                        ? { x: xVal, y: [openVal, closeVal, lowVal, highVal] }
                        : null;
                })()
                : null;
        })
        .filter((d): d is { x: string; y: number[] } => d !== null);

    const xAxisData = processedData.map(d => d.x);
    const values = processedData.map(d => d.y);

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
            name: xAxisLabel,
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false },
            axisLabel: {
                rotate: xAxisRotate
            }
        },
        yAxis: {
            scale: true,
            splitArea: {
                show: true
            },
            name: options?.yAxisLabel // Often empty for candlestick but good to have
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
