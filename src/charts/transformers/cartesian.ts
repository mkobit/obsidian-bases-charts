import type { EChartsOption, SeriesOption, LineSeriesOption, BarSeriesOption, XAXisComponentOption, YAXisComponentOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface CartesianTransformerOptions extends BaseTransformerOptions {
    smooth?: boolean;
    showSymbol?: boolean;
    areaStyle?: boolean;
    stack?: boolean;
    seriesProp?: string;

    // Axis Options
    xAxisLabel?: string;
    yAxisLabel?: string;
    xAxisLabelRotate?: number;
    flipAxis?: boolean;
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
    const xAxisLabel = options?.xAxisLabel;
    const yAxisLabel = options?.yAxisLabel;
    const xAxisLabelRotate = options?.xAxisLabelRotate;
    const flipAxis = options?.flipAxis;

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

    // Configure axes
    // In flipAxis mode:
    // xAxis (bottom) becomes the Value axis (showing range of values)
    // yAxis (left) becomes the Category axis (showing categories)
    //
    // The visual "X Axis" (bottom) should be labeled with the Value Label (because it shows values).
    // The visual "Y Axis" (left) should be labeled with the Category Label.

    // My previous logic was:
    // name: flipAxis ? (yAxisLabel || yProp) : (xAxisLabel || xProp)
    // This assigned "yAxisLabel" to the Category Axis when flipped.
    // Category Axis is on the Left (Y). So the Left Axis gets "yAxisLabel".
    // Left Axis shows Categories. "yAxisLabel" is usually "Value Label" in the user's mind (because they set Y Prop = Value).
    // Wait.
    // User sets: X Prop = "Category", Y Prop = "Value".
    // User sets: X Label = "My Categories", Y Label = "My Values".
    //
    // Normal: Bottom Axis = Category, Left Axis = Value.
    // Bottom Axis Name = "My Categories". Left Axis Name = "My Values".
    //
    // Flip: Bottom Axis = Value, Left Axis = Category.
    // Bottom Axis Name should be "My Values".
    // Left Axis Name should be "My Categories".

    // Let's check my failed test expectation.
    // Test: xAxisLabel: 'Custom X', yAxisLabel: 'Custom Y'
    // Logic: X Prop = category, Y Prop = value.
    //
    // Flip:
    // xAxis (bottom) is Value. Expect name 'Custom Y'.
    // yAxis (left) is Category. Expect name 'Custom X'.

    // My Code:
    // const categoryAxis = { ... name: flipAxis ? (yAxisLabel || yProp) : (xAxisLabel || xProp) }
    // const valueAxis = { ... name: flipAxis ? (xAxisLabel || xProp) : (yAxisLabel || yProp) }
    //
    // If flipped:
    // opt.yAxis = categoryAxis. -> name = (yAxisLabel || yProp) = 'Custom Y'.
    // opt.xAxis = valueAxis. -> name = (xAxisLabel || xProp) = 'Custom X'.
    //
    // Result:
    // yAxis (Left/Category) Name = 'Custom Y'. (I expected 'Custom X').
    // xAxis (Bottom/Value) Name = 'Custom X'. (I expected 'Custom Y').

    // So my logic was INVERTED in the code.
    // I thought "If flipped, assign Y label to Category Axis".
    // But Category Axis is NOW THE Y AXIS. So assigning Y Label seems semantically "correct" for "Y Axis",
    // BUT the Y Axis is displaying CATEGORIES (which correspond to X Prop).
    // So the Y Axis should display the X Label.

    // CORRECTION:
    // If flipped:
    // Category Axis (on Y) should use X Label.
    // Value Axis (on X) should use Y Label.

    const categoryAxis: XAXisComponentOption | YAXisComponentOption = {
        type: 'category',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        data: xAxisData as any,
        // Category Axis always represents the X Prop data. So it should always use X Label.
        // Regardless of where it is positioned (X or Y).
        name: xAxisLabel || xProp,
        axisLabel: {
            interval: 0,
            rotate: xAxisLabelRotate !== undefined ? xAxisLabelRotate : 30
        }
    };

    const valueAxis: XAXisComponentOption | YAXisComponentOption = {
        type: 'value',
        // Value Axis always represents the Y Prop data. So it should always use Y Label.
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
        legend: options?.legend ? {} : undefined
    };

    if (flipAxis) {
        // Horizontal: X is Value, Y is Category
        opt.xAxis = valueAxis;
        opt.yAxis = categoryAxis;
    } else {
        // Vertical (Default): X is Category, Y is Value
        opt.xAxis = categoryAxis;
        opt.yAxis = valueAxis;
    }

    opt.series = seriesOptions;

    return opt;
}
