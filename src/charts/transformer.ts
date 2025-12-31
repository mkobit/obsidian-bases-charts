import type { EChartsOption, SeriesOption, LineSeriesOption, BarSeriesOption, PieSeriesOption } from 'echarts';

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

function safeToString(val: unknown): string {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    // Fallback for objects/symbols to avoid [object Object] if possible, or just return it
    // The lint rule complains about default stringification of objects.
    return JSON.stringify(val);
}

function createPieChartOption(
    data: Record<string, unknown>[],
    nameProp: string,
    valueProp: string,
    options?: ChartTransformerOptions
): EChartsOption {
    const seriesData = data.map(item => {
        const valRaw = getNestedValue(item, nameProp);
        const name = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);

        const val = Number(getNestedValue(item, valueProp));
        return {
            name: name,
            value: isNaN(val) ? 0 : val
        };
    });

    const seriesItem: PieSeriesOption = {
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
            const valRaw = getNestedValue(item, xProp);
            const xVal = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);
            uniqueX.add(xVal);
        });
        xAxisData = Array.from(uniqueX);

        // 2. Initialize series data arrays
        // We need to map { seriesName -> [val for x1, val for x2, ...] }
        // Find all unique series names first
        const uniqueSeries = new Set<string>();
        data.forEach(item => {
            const valRaw = getNestedValue(item, seriesProp);
            const sVal = valRaw === undefined || valRaw === null ? 'Series 1' : safeToString(valRaw);
            uniqueSeries.add(sVal);
        });

        uniqueSeries.forEach(sName => {
            // Explicitly type the array to avoid "any[] assigned to (number|null)[]"
            const arr = new Array(xAxisData.length).fill(null) as (number | null)[];
            seriesMap.set(sName, arr);
        });

        // 3. Populate
        data.forEach(item => {
            const xValRaw = getNestedValue(item, xProp);
            const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);

            const sValRaw = getNestedValue(item, seriesProp);
            const sVal = sValRaw === undefined || sValRaw === null ? 'Series 1' : safeToString(sValRaw);

            const yVal = Number(getNestedValue(item, yProp));

            const xIndex = xAxisData.indexOf(xVal);
            if (xIndex !== -1 && !isNaN(yVal)) {
                const arr = seriesMap.get(sVal);
                if (arr) {
                    arr[xIndex] = yVal;
                }
            }
        });

    } else {
        // Single series logic
        const yData: number[] = [];
        data.forEach(item => {
            const xValRaw = getNestedValue(item, xProp);
            const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);

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
        // Construct the base object first
        let seriesItem: LineSeriesOption | BarSeriesOption;

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
             seriesItem = lineItem;
        } else {
            const barItem: BarSeriesOption = {
                ...base,
                type: 'bar'
            };
            if (isStacked) barItem.stack = 'total';
            seriesItem = barItem;
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
