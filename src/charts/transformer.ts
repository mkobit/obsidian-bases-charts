import type { EChartsOption, SeriesOption, XAXisComponentOption, YAXisComponentOption } from 'echarts';

export type ChartType = 'bar' | 'line' | 'pie';

export interface ChartTransformerOptions {
    smooth?: boolean;
    showSymbol?: boolean;
    areaStyle?: boolean;
    legend?: boolean;
    stack?: boolean;
    seriesProp?: string; // Property to group by (for stacking or multi-series)
}

/**
 * Transforms Bases data into an ECharts option object.
 */
export function transformDataToChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    chartType: ChartType = 'bar',
    options?: ChartTransformerOptions
): EChartsOption {
    if (chartType === 'pie') {
        return createPieChartOption(data, xProp, yProp, options);
    }

    // For Bar/Line (Cartesian)
    return createCartesianChartOption(data, xProp, yProp, chartType, options);
}

function createPieChartOption(
    data: Record<string, unknown>[],
    nameProp: string,
    valueProp: string,
    options?: ChartTransformerOptions
): EChartsOption {
    const seriesData = data.map(item => {
        const name = String(getNestedValue(item, nameProp) ?? 'Unknown');
        const val = Number(getNestedValue(item, valueProp));
        return {
            name: name,
            value: isNaN(val) ? 0 : val
        };
    });

    const seriesItem: SeriesOption = {
        type: 'pie',
        data: seriesData,
        radius: '50%',
        emphasis: {
            itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        }
    };

    const opt: EChartsOption = {
        series: [seriesItem],
        tooltip: {
            trigger: 'item'
        }
    };

    if (options?.legend) {
        opt.legend = {
            orient: 'vertical',
            left: 'left'
        };
    }

    return opt;
}

function createCartesianChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    chartType: 'bar' | 'line',
    options?: ChartTransformerOptions
): EChartsOption {
    const seriesProp = options?.seriesProp;
    const isStacked = options?.stack;

    // Process Data
    let xAxisData: string[] = [];
    let seriesMap: Map<string, (number | null)[]> = new Map();

    if (seriesProp) {
        // Multi-series logic
        // 1. Get all unique X values (categories)
        const uniqueX = new Set<string>();
        data.forEach(item => {
            const xVal = String(getNestedValue(item, xProp) ?? 'Unknown');
            uniqueX.add(xVal);
        });
        xAxisData = Array.from(uniqueX);

        // 2. Initialize series data arrays
        // We need to map { seriesName -> [val for x1, val for x2, ...] }
        // Find all unique series names first
        const uniqueSeries = new Set<string>();
        data.forEach(item => {
            const sVal = String(getNestedValue(item, seriesProp) ?? 'Series 1');
            uniqueSeries.add(sVal);
        });

        uniqueSeries.forEach(sName => {
            seriesMap.set(sName, new Array(xAxisData.length).fill(null));
        });

        // 3. Populate
        data.forEach(item => {
            const xVal = String(getNestedValue(item, xProp) ?? 'Unknown');
            const sVal = String(getNestedValue(item, seriesProp) ?? 'Series 1');
            const yVal = Number(getNestedValue(item, yProp));

            const xIndex = xAxisData.indexOf(xVal);
            if (xIndex !== -1 && !isNaN(yVal)) {
                const arr = seriesMap.get(sVal);
                if (arr) {
                    // Simple overwrite for now, could sum if multiple entries exist for same x/series
                    arr[xIndex] = yVal;
                }
            }
        });

    } else {
        // Single series logic
        const yData: number[] = [];
        data.forEach(item => {
            const xVal = String(getNestedValue(item, xProp) ?? 'Unknown');
            const yVal = Number(getNestedValue(item, yProp));
            if (!isNaN(yVal)) {
                xAxisData.push(xVal);
                yData.push(yVal);
            }
        });
        seriesMap.set(yProp, yData);
    }

    // Build Series Options
    const seriesOptions: SeriesOption[] = [];

    seriesMap.forEach((sData, sName) => {
        const seriesItem: any = {
            name: sName,
            type: chartType,
            data: sData
        };

        if (chartType === 'line') {
            if (options?.smooth) seriesItem.smooth = true;
            if (options?.showSymbol === false) seriesItem.showSymbol = false;
            if (options?.areaStyle) seriesItem.areaStyle = {};
        }

        if (isStacked) {
            seriesItem.stack = 'total';
        }

        seriesOptions.push(seriesItem);
    });

    const opt: EChartsOption = {
        xAxis: {
            type: 'category',
            data: xAxisData,
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
