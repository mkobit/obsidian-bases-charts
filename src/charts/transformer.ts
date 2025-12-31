import type { EChartsOption, LineSeriesOption, BarSeriesOption } from 'echarts';

export type ChartType = 'bar' | 'line';

export interface LineChartOptions {
    smooth?: boolean;
    showSymbol?: boolean;
    areaStyle?: boolean;
}

/**
 * Transforms Bases data into an ECharts option object.
 *
 * @param data The raw data array from the Bases query.
 * @param xProp The property key to use for the X-axis (category).
 * @param yProp The property key to use for the Y-axis (value).
 * @param chartType The type of chart to generate ('bar' or 'line').
 * @param options Additional chart options (currently only supports LineChartOptions).
 * @returns An ECharts option object.
 */
export function transformDataToChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    chartType: ChartType = 'bar',
    options?: LineChartOptions
): EChartsOption {
    const xData: string[] = [];
    const yData: number[] = [];

    // Map to aggregate values if there are duplicate x-axis categories
    // Or just push for now. Let's assume aggregation might be needed later,
    // but for "basic", simple mapping is enough.
    // However, charts usually expect unique categories on X-axis or it treats them as separate points.

    for (const item of data) {
        // We only care about the properties, not the full object structure if it's nested.
        // Bases data usually comes as flat objects or with predictable structure.
        // Let's assume `data` is an array of objects where keys are property names.

        let xVal: unknown = item[xProp];
        let yVal: unknown = item[yProp];

        // Handle potential nesting or different structures if needed,
        // but for now assume direct access.

        // Handle "file.name" or similar if passed as prop
        if (xProp.includes('.')) {
             xVal = getNestedValue(item, xProp);
        }
        if (yProp.includes('.')) {
             yVal = getNestedValue(item, yProp);
        }

        // Basic validation
        if (xVal === undefined || xVal === null) {
            xVal = "Unknown";
        }

        // Ensure yVal is a number
        const numVal = typeof yVal === 'number' ? yVal : parseFloat(String(yVal));

        if (!isNaN(numVal)) {
            xData.push(String(xVal));
            yData.push(numVal);
        }
    }

    // Use union type for seriesItem
    let seriesItem: LineSeriesOption | BarSeriesOption;

    if (chartType === 'line') {
        const lineSeries: LineSeriesOption = {
            data: yData,
            type: 'line',
            name: yProp
        };
        if (options) {
            if (options.smooth !== undefined) lineSeries.smooth = options.smooth;
            if (options.showSymbol !== undefined) lineSeries.showSymbol = options.showSymbol;
            if (options.areaStyle) lineSeries.areaStyle = {};
        }
        seriesItem = lineSeries;
    } else {
        seriesItem = {
            data: yData,
            type: 'bar',
            name: yProp
        };
    }

    return {
        xAxis: {
            type: 'category',
            data: xData,
            name: xProp
        },
        yAxis: {
            type: 'value',
            name: yProp
        },
        series: [seriesItem],
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            containLabel: true
        }
    };
}

function getNestedValue(obj: unknown, path: string): unknown {
    if (typeof obj !== 'object' || obj === null) {
        return undefined;
    }

    return path.split('.').reduce((o: unknown, key: string) => {
        if (typeof o === 'object' && o !== null && key in o) {
             return (o as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
}
