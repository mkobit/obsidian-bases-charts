/* eslint-disable */
import type {
    EChartsOption,
    SeriesOption,
    LineSeriesOption,
    BarSeriesOption,
    PieSeriesOption,
    ScatterSeriesOption,
    RadarSeriesOption,
    FunnelSeriesOption,
    GaugeSeriesOption,
    HeatmapSeriesOption,
    CandlestickSeriesOption,
    TreemapSeriesOption,
    BoxplotSeriesOption
} from 'echarts';

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'bubble' | 'radar' | 'funnel' | 'gauge' | 'heatmap' | 'candlestick' | 'treemap' | 'boxplot';

interface BaseTransformerOptions {
    legend?: boolean;
}

export interface CartesianTransformerOptions extends BaseTransformerOptions {
    smooth?: boolean;
    showSymbol?: boolean;
    areaStyle?: boolean;
    stack?: boolean;
    seriesProp?: string;
}

export interface PieTransformerOptions extends BaseTransformerOptions {
    // Pie specific options if any
}

export interface ScatterTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;
    sizeProp?: string;
}

export interface RadarTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;
}

export interface GaugeTransformerOptions extends BaseTransformerOptions {
    min?: number;
    max?: number;
}

export interface HeatmapTransformerOptions extends BaseTransformerOptions {
    valueProp?: string;
}

export interface CandlestickTransformerOptions extends BaseTransformerOptions {
    openProp?: string;
    closeProp?: string;
    lowProp?: string;
    highProp?: string;
}

export interface TreemapTransformerOptions extends BaseTransformerOptions {
    // Treemap specific options if any
}

export interface BoxplotTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;
}

export type ChartTransformerOptions =
    | CartesianTransformerOptions
    | PieTransformerOptions
    | ScatterTransformerOptions
    | RadarTransformerOptions
    | GaugeTransformerOptions
    | HeatmapTransformerOptions
    | CandlestickTransformerOptions
    | TreemapTransformerOptions
    | BoxplotTransformerOptions;

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
    switch (chartType) {
        case 'pie':
            return createPieChartOption(data, xProp, yProp, options);
        case 'funnel':
            return createFunnelChartOption(data, xProp, yProp, options);
        case 'radar':
            return createRadarChartOption(data, xProp, yProp, options as RadarTransformerOptions);
        case 'gauge':
            return createGaugeChartOption(data, yProp, options as GaugeTransformerOptions);
        case 'bubble':
            return createScatterChartOption(data, xProp, yProp, 'scatter', options as ScatterTransformerOptions); // Bubble is Scatter with size
        case 'scatter':
            return createScatterChartOption(data, xProp, yProp, 'scatter', options as ScatterTransformerOptions);
        case 'heatmap':
            return createHeatmapChartOption(data, xProp, yProp, options as HeatmapTransformerOptions);
        case 'candlestick':
            return createCandlestickChartOption(data, xProp, options as CandlestickTransformerOptions);
        case 'treemap':
            return createTreemapChartOption(data, xProp, yProp, options as TreemapTransformerOptions);
        case 'boxplot':
            return createBoxplotChartOption(data, xProp, yProp, options as BoxplotTransformerOptions);
        case 'bar':
        case 'line':
        default:
            return createCartesianChartOption(data, xProp, yProp, chartType, options as CartesianTransformerOptions);
    }
}

function safeToString(val: unknown): string {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    return JSON.stringify(val);
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

function createPieChartOption(
    data: Record<string, unknown>[],
    nameProp: string,
    valueProp: string,
    options?: PieTransformerOptions
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

function createTreemapChartOption(
    data: Record<string, unknown>[],
    nameProp: string,
    valueProp: string,
    options?: TreemapTransformerOptions
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

    // Treemaps often benefit from sorting, but ECharts handles layout.
    // We filter out zero or negative values as treemap area must be positive usually,
    // though 0 might just be invisible.
    const validData = seriesData.filter(d => d.value > 0);

    const seriesItem: TreemapSeriesOption = {
        type: 'treemap',
        data: validData,
        roam: false, // Zoom/pan
        label: {
            show: true,
            formatter: '{b}'
        },
        itemStyle: {
            borderColor: '#fff'
        }
    };

    const opt: EChartsOption = {
        series: [seriesItem],
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}'
        }
    };

    if (options?.legend) {
        // Treemap usually doesn't use a standard legend in the same way,
        // but if we had categories it might. For flat data, it's less useful.
        // We'll leave it out or implement if requested.
    }

    return opt;
}

function createCandlestickChartOption(
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

function createFunnelChartOption(
    data: Record<string, unknown>[],
    nameProp: string,
    valueProp: string,
    options?: BaseTransformerOptions
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

    // Sort data for funnel (usually expected to be sorted, but ECharts can handle it)
    seriesData.sort((a, b) => b.value - a.value);

    const seriesItem: FunnelSeriesOption = {
        type: 'funnel',
        data: seriesData,
        label: {
            show: true,
            position: 'inside'
        }
    };

    const opt: EChartsOption = {
        series: [seriesItem],
        tooltip: {
            trigger: 'item',
            formatter: '{b} : {c}%' // Assuming value is percentage or just raw count
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

function createGaugeChartOption(
    data: Record<string, unknown>[],
    valueProp: string,
    options?: GaugeTransformerOptions
): EChartsOption {
    // Sum all values
    let total = 0;
    data.forEach(item => {
        const val = Number(getNestedValue(item, valueProp));
        if (!isNaN(val)) {
            total += val;
        }
    });

    const min = options?.min ?? 0;
    const max = options?.max ?? 100;

    const seriesItem: GaugeSeriesOption = {
        type: 'gauge',
        min: min,
        max: max,
        progress: {
            show: true
        },
        detail: {
            valueAnimation: true,
            formatter: '{value}'
        },
        data: [
            {
                value: total,
                name: valueProp
            }
        ]
    };

    return {
        series: [seriesItem],
        tooltip: {
            formatter: '{a} <br/>{b} : {c}'
        }
    };
}

function createRadarChartOption(
    data: Record<string, unknown>[],
    indicatorProp: string,
    valueProp: string,
    options?: RadarTransformerOptions
): EChartsOption {
    const seriesProp = options?.seriesProp;

    // 1. Identify Indicators (Axes)
    const uniqueIndicators = new Set<string>();
    data.forEach(item => {
        const valRaw = getNestedValue(item, indicatorProp);
        const val = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);
        uniqueIndicators.add(val);
    });
    const indicatorsList = Array.from(uniqueIndicators);

    // 2. Identify Series
    const uniqueSeries = new Set<string>();
    if (seriesProp) {
        data.forEach(item => {
            const valRaw = getNestedValue(item, seriesProp);
            const val = valRaw === undefined || valRaw === null ? 'Series 1' : safeToString(valRaw);
            uniqueSeries.add(val);
        });
    } else {
        uniqueSeries.add(valueProp); // Use value prop name as default series name if no grouping
    }

    // 3. Build Data
    // Map: SeriesName -> [v1, v2, v3...] corresponding to indicatorsList
    const seriesMap = new Map<string, (number | null)[]>();
    uniqueSeries.forEach(s => {
        seriesMap.set(s, new Array(indicatorsList.length).fill(null)); // Fill with null or 0? 0 usually for Radar
    });

    data.forEach(item => {
        const indRaw = getNestedValue(item, indicatorProp);
        const indVal = indRaw === undefined || indRaw === null ? 'Unknown' : safeToString(indRaw);
        const indIndex = indicatorsList.indexOf(indVal);

        if (indIndex === -1) return;

        let sName = valueProp;
        if (seriesProp) {
            const sRaw = getNestedValue(item, seriesProp);
            sName = sRaw === undefined || sRaw === null ? 'Series 1' : safeToString(sRaw);
        }

        const val = Number(getNestedValue(item, valueProp));
        if (!isNaN(val)) {
             const arr = seriesMap.get(sName);
             if (arr) arr[indIndex] = val;
        }
    });

    // 4. Construct Option
    const radarIndicators = indicatorsList.map(name => ({ name })); // Auto max?

    const seriesData = Array.from(seriesMap.entries()).map(([name, values]) => {
        // Use default value 0 for nulls, and ensure we map to number[]
        const safeValues = values.map(v => v === null ? 0 : v);
        return {
            value: safeValues,
            name: name
        };
    });

    const seriesItem: RadarSeriesOption = {
        type: 'radar',
        data: seriesData
    };

    const opt: EChartsOption = {
        radar: {
            indicator: radarIndicators
        },
        series: [seriesItem],
        tooltip: {
            trigger: 'item'
        }
    };

    if (options?.legend) {
        opt.legend = {
            data: Array.from(uniqueSeries)
        };
    }

    return opt;
}

function createHeatmapChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    options?: HeatmapTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;

    // 1. Identify X Categories (Horizontal)
    const uniqueX = new Set<string>();
    data.forEach(item => {
        const valRaw = getNestedValue(item, xProp);
        const xVal = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);
        uniqueX.add(xVal);
    });
    const xAxisData = Array.from(uniqueX);

    // 2. Identify Y Categories (Vertical)
    const uniqueY = new Set<string>();
    data.forEach(item => {
        const valRaw = getNestedValue(item, yProp);
        const yVal = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);
        uniqueY.add(yVal);
    });
    const yAxisData = Array.from(uniqueY);

    // 3. Build Data [xIndex, yIndex, value]
    const seriesData: [number, number, number][] = [];
    let minVal = Infinity;
    let maxVal = -Infinity;

    data.forEach(item => {
        const xValRaw = getNestedValue(item, xProp);
        const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);
        const xIndex = xAxisData.indexOf(xVal);

        const yValRaw = getNestedValue(item, yProp);
        const yVal = yValRaw === undefined || yValRaw === null ? 'Unknown' : safeToString(yValRaw);
        const yIndex = yAxisData.indexOf(yVal);

        if (xIndex === -1 || yIndex === -1) return;

        let val = 0;
        if (valueProp) {
            const v = Number(getNestedValue(item, valueProp));
            if (!isNaN(v)) {
                val = v;
            }
        }

        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;

        seriesData.push([xIndex, yIndex, val]);
    });

    if (minVal === Infinity) minVal = 0;
    if (maxVal === -Infinity) maxVal = 10;

    const seriesItem: HeatmapSeriesOption = {
        type: 'heatmap',
        data: seriesData,
        label: {
            show: true
        }
    };

    const opt: EChartsOption = {
        tooltip: {
            position: 'top',
            formatter: (params: any) => {
                if (!params || !Array.isArray(params.value)) return '';
                const xIndex = params.value[0] as number;
                const yIndex = params.value[1] as number;
                const val = params.value[2] as number;
                return `${xProp}: ${xAxisData[xIndex]}<br/>${yProp}: ${yAxisData[yIndex]}<br/>Value: ${val}`;
            }
        },
        grid: {
            height: '70%',
            top: '10%'
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            splitArea: {
                show: true
            }
        },
        yAxis: {
            type: 'category',
            data: yAxisData,
            splitArea: {
                show: true
            }
        },
        visualMap: {
            min: minVal,
            max: maxVal,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '0%'
        },
        series: [seriesItem]
    };

    return opt;
}

// Define specific type for Scatter data points [x, y, size?]
// Using unknown as the base to satisfy ECharts loose types but casting internally
type ScatterDataPoint = (string | number)[];

function createScatterChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    type: 'scatter',
    options?: ScatterTransformerOptions
): EChartsOption {
    const seriesProp = options?.seriesProp;
    const sizeProp = options?.sizeProp;

    // We will use category axis for X to be consistent with Bar/Line behavior in this plugin
    // This allows non-numeric X values.

    // 1. Get all unique X values (categories)
    const uniqueX = new Set<string>();
    data.forEach(item => {
        const valRaw = getNestedValue(item, xProp);
        const xVal = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);
        uniqueX.add(xVal);
    });
    const xAxisData = Array.from(uniqueX);

    // 2. Build Series
    // Map: SeriesName -> Data[]
    const seriesMap = new Map<string, ScatterDataPoint[]>();

    data.forEach(item => {
        const xValRaw = getNestedValue(item, xProp);
        const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);

        const yVal = Number(getNestedValue(item, yProp));
        if (isNaN(yVal)) return;

        let sName = 'Series 1';
        if (seriesProp) {
            const sRaw = getNestedValue(item, seriesProp);
            sName = sRaw === undefined || sRaw === null ? 'Series 1' : safeToString(sRaw);
        }

        if (!seriesMap.has(sName)) {
            seriesMap.set(sName, []);
        }

        // Base point is [x, y]
        const point: ScatterDataPoint = [xVal, yVal];

        // Add size if exists (making it [x, y, size])
        if (sizeProp) {
            const sizeVal = Number(getNestedValue(item, sizeProp));
            (point as any).push(isNaN(sizeVal) ? 0 : sizeVal);
        }

        seriesMap.get(sName)?.push(point);
    });

    const seriesOptions: ScatterSeriesOption[] = [];
    seriesMap.forEach((sData, sName) => {
        const seriesItem: ScatterSeriesOption = {
            name: sName,
            type: 'scatter',
            data: sData
        };

        if (sizeProp) {
            // Map the 3rd dimension (index 2) to symbolSize
            // ECharts callback: (val: Array) => number
            seriesItem.symbolSize = function (data: any) {
                if (Array.isArray(data) && data.length > 2) {
                     const r = data[2] as number;
                     return Math.max(0, r);
                }
                return 10; // Default size
            };
        }

        seriesOptions.push(seriesItem);
    });

    const opt: EChartsOption = {
        xAxis: {
            type: 'category',
            data: xAxisData,
            name: xProp,
            splitLine: { show: true } // Scatter usually looks better with grid
        },
        yAxis: {
            type: 'value',
            name: yProp,
            splitLine: { show: true }
        },
        series: seriesOptions,
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                if (!params || typeof params !== 'object') return '';

                const vals = params.value;
                let tip = '';
                if (Array.isArray(vals)) {
                    tip = `${params.seriesName}<br/>${xProp}: ${vals[0]}<br/>${yProp}: ${vals[1]}`;
                    if (sizeProp && vals.length > 2) {
                        tip += `<br/>${sizeProp}: ${vals[2]}`;
                    }
                }
                return tip;
            }
        }
    };

    if (options?.legend) {
        opt.legend = {};
    }

    return opt;
}

function createCartesianChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    chartType: 'bar' | 'line',
    options?: CartesianTransformerOptions
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
            seriesMap.set(sName, arr as any);
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
            data: xAxisData as any, // Cast to any to satisfy explicit any check if inference fails
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

function quantile(ascSorted: number[], p: number): number {
    const n = ascSorted.length;
    if (n === 0) return 0;
    const pos = (n - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (base + 1 < n) {
        return ascSorted[base]! + (ascSorted[base + 1]! - ascSorted[base]!) * rest;
    } else {
        return ascSorted[base]!;
    }
}

function calculateBoxplotStats(values: number[]): number[] {
    if (values.length === 0) return [];
    const sorted = values.slice().sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const q1 = quantile(sorted, 0.25);
    const median = quantile(sorted, 0.5);
    const q3 = quantile(sorted, 0.75);
    return [min, q1, median, q3, max];
}

function createBoxplotChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    options?: BoxplotTransformerOptions
): EChartsOption {
    const seriesProp = options?.seriesProp;

    // 1. Single pass to aggregate data
    // Map<SeriesName, Map<CategoryName, number[]>>
    const seriesMap = new Map<string, Map<string, number[]>>();
    const uniqueX = new Set<string>();

    data.forEach(item => {
        const xValRaw = getNestedValue(item, xProp);
        const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);
        uniqueX.add(xVal);

        let sName = yProp;
        if (seriesProp) {
            const sRaw = getNestedValue(item, seriesProp);
            sName = sRaw === undefined || sRaw === null ? 'Series 1' : safeToString(sRaw);
        }

        const yVal = Number(getNestedValue(item, yProp));
        if (isNaN(yVal)) return;

        if (!seriesMap.has(sName)) {
            seriesMap.set(sName, new Map());
        }
        const catMap = seriesMap.get(sName)!;
        if (!catMap.has(xVal)) {
            catMap.set(xVal, []);
        }
        catMap.get(xVal)!.push(yVal);
    });

    const xAxisData = Array.from(uniqueX);
    const seriesOptions: BoxplotSeriesOption[] = [];

    seriesMap.forEach((catMap, sName) => {
        const seriesData: number[][] = [];
        xAxisData.forEach(xVal => {
            const values = catMap.get(xVal) || [];
            seriesData.push(calculateBoxplotStats(values));
        });

        seriesOptions.push({
            name: sName,
            type: 'boxplot',
            data: seriesData
        });
    });

    const opt: EChartsOption = {
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: options?.legend ? {} : undefined,
        xAxis: {
            type: 'category',
            data: xAxisData,
            boundaryGap: true,
            splitArea: {
                show: false
            },
            splitLine: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            splitArea: {
                show: true
            }
        },
        series: seriesOptions
    };
    return opt;
}
