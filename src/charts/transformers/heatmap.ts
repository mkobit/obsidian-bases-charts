import type { EChartsOption, HeatmapSeriesOption } from 'echarts';
import type { BaseTransformerOptions, AxisOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface HeatmapTransformerOptions extends BaseTransformerOptions {
    valueProp?: string;

    axis?: AxisOptions;
}

export function createHeatmapChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    options?: HeatmapTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;

    const xAxisLabel = options?.axis?.xAxisLabel;
    const yAxisLabel = options?.axis?.yAxisLabel;
    const xAxisLabelRotate = options?.axis?.xAxisLabelRotate;
    const flipAxis = options?.axis?.flipAxis;

    // 1. Identify Categories
    const uniqueX = new Set<string>();
    const uniqueY = new Set<string>();

    for (const item of data) {
        const xValRaw = getNestedValue(item, xProp);
        const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);
        uniqueX.add(xVal);

        const yValRaw = getNestedValue(item, yProp);
        const yVal = yValRaw === undefined || yValRaw === null ? 'Unknown' : safeToString(yValRaw);
        uniqueY.add(yVal);
    }

    const xAxisData = Array.from(uniqueX);
    const yAxisData = Array.from(uniqueY);

    // 3. Build Data [xIndex, yIndex, value]
    const { seriesData, minVal, maxVal } = data.reduce<{
        seriesData: [number, number, number][];
        minVal: number;
        maxVal: number;
    }>((acc, item) => {
        const xValRaw = getNestedValue(item, xProp);
        const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);
        const xIndex = xAxisData.indexOf(xVal);

        const yValRaw = getNestedValue(item, yProp);
        const yVal = yValRaw === undefined || yValRaw === null ? 'Unknown' : safeToString(yValRaw);
        const yIndex = yAxisData.indexOf(yVal);

        if (xIndex === -1 || yIndex === -1) return acc;

        let val = 0;
        if (valueProp) {
            const v = Number(getNestedValue(item, valueProp));
            if (!isNaN(v)) {
                val = v;
            }
        }

        if (val < acc.minVal) acc.minVal = val;
        if (val > acc.maxVal) acc.maxVal = val;

        if (flipAxis) {
            acc.seriesData.push([yIndex, xIndex, val]);
        } else {
            acc.seriesData.push([xIndex, yIndex, val]);
        }

        return acc;
    }, { seriesData: [], minVal: Infinity, maxVal: -Infinity });

    const finalMinVal = minVal === Infinity ? 0 : minVal;
    const finalMaxVal = maxVal === -Infinity ? 10 : maxVal;

    const seriesItem: HeatmapSeriesOption = {
        type: 'heatmap',
        data: seriesData,
        label: {
            show: true
        }
    };

    const axisFromXProp = {
        type: 'category' as const,
        data: xAxisData,
        name: xAxisLabel || xProp,
        splitArea: { show: true },
        axisLabel: { rotate: xAxisLabelRotate }
    };

    const axisFromYProp = {
        type: 'category' as const,
        data: yAxisData,
        name: yAxisLabel || yProp,
        splitArea: { show: true }
    };

    const opt: EChartsOption = {
        tooltip: {
            position: 'top',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params: any) => {
                const p = params as { value: (number | string)[] };
                if (!p || !Array.isArray(p.value)) return '';
                // p.value is [colIndex, rowIndex, val]
                const colIndex = p.value[0] as number;
                const rowIndex = p.value[1] as number;
                const val = p.value[2] as number;

                if (flipAxis) {
                    // Col = Y-Data, Row = X-Data
                    return `${yProp}: ${yAxisData[colIndex]}<br/>${xProp}: ${xAxisData[rowIndex]}<br/>Value: ${val}`;
                } else {
                    // Col = X-Data, Row = Y-Data
                    return `${xProp}: ${xAxisData[colIndex]}<br/>${yProp}: ${yAxisData[rowIndex]}<br/>Value: ${val}`;
                }
            }
        },
        grid: {
            height: '70%',
            top: '10%'
        },
        visualMap: {
            min: finalMinVal,
            max: finalMaxVal,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '0%'
        },
        series: [seriesItem]
    };

    if (flipAxis) {
        opt.xAxis = axisFromYProp as unknown as EChartsOption['xAxis']; // Bottom axis shows Y categories
        opt.yAxis = axisFromXProp as unknown as EChartsOption['yAxis']; // Left axis shows X categories
    } else {
        opt.xAxis = axisFromXProp as unknown as EChartsOption['xAxis'];
        opt.yAxis = axisFromYProp as unknown as EChartsOption['yAxis'];
    }

    return opt;
}
