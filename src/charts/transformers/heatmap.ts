import type { EChartsOption, HeatmapSeriesOption, XAXisComponentOption, YAXisComponentOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface HeatmapTransformerOptions extends BaseTransformerOptions {
    valueProp?: string;

    // Axis Options
    xAxisLabel?: string;
    yAxisLabel?: string;
    xAxisLabelRotate?: number;
    flipAxis?: boolean;
}

export function createHeatmapChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    options?: HeatmapTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;
    const xAxisLabel = options?.xAxisLabel;
    const yAxisLabel = options?.yAxisLabel;
    const xAxisLabelRotate = options?.xAxisLabelRotate;
    // Note: Heatmap "flipAxis" implies swapping X and Y axis definitions?
    // Heatmap is Cartesian. If we flip, X becomes Y and Y becomes X.
    // X is Category, Y is Category usually.
    // So "flipping" just means transposing the grid.
    const flipAxis = options?.flipAxis;

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

    let xAxisData = Array.from(uniqueX);
    let yAxisData = Array.from(uniqueY);

    // If flipping, we swap the logical meaning of X and Y in the data processing or just in the axis assignment.
    // Easier to just build standard X/Y data and then assign to axis options swapped.

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

        // Series Data Format for Heatmap: [xIndex, yIndex, value]
        // This corresponds to xAxis index and yAxis index.
        // If we flip axes later (swap xAxis config with yAxis config),
        // we must ensure that the indices match the swapped axes.

        // Strategy:
        // If flipAxis is true:
        //   Visual X-Axis uses yAxisData
        //   Visual Y-Axis uses xAxisData
        //   Data point should be [yIndex, xIndex, value]

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

    // Configure Axis Objects
    // Standard (No Flip):
    //   Axis 1 (Bottom/X) = xAxisData (Categories from xProp)
    //   Axis 2 (Left/Y)   = yAxisData (Categories from yProp)

    // Flipped:
    //   Axis 1 (Bottom/X) = yAxisData (Categories from yProp)
    //   Axis 2 (Left/Y)   = xAxisData (Categories from xProp)

    const axisFromXProp: XAXisComponentOption = {
        type: 'category',
        data: xAxisData,
        name: xAxisLabel || xProp,
        splitArea: { show: true },
        axisLabel: { rotate: xAxisLabelRotate }
    };

    const axisFromYProp: YAXisComponentOption = {
        type: 'category',
        data: yAxisData,
        name: yAxisLabel || yProp,
        splitArea: { show: true }
        // Rotation usually only needed for X axis (bottom)
    };

    const opt: EChartsOption = {
        tooltip: {
            position: 'top',
            formatter: (params: unknown) => {
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
        opt.xAxis = axisFromYProp; // Bottom axis shows Y categories
        opt.yAxis = axisFromXProp; // Left axis shows X categories
    } else {
        opt.xAxis = axisFromXProp;
        opt.yAxis = axisFromYProp;
    }

    return opt;
}
