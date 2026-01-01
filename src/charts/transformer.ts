import type {
    EChartsOption,
    SeriesOption,
    LineSeriesOption,
    BarSeriesOption,
    PieSeriesOption,
    ScatterSeriesOption,
    RadarSeriesOption,
    FunnelSeriesOption,
    GaugeSeriesOption
} from 'echarts';

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'bubble' | 'radar' | 'funnel' | 'gauge';

export interface ChartTransformerOptions {
    smooth?: boolean;
    showSymbol?: boolean;
    areaStyle?: boolean;
    legend?: boolean;
    stack?: boolean;
    seriesProp?: string; // Property to group by (for stacking or multi-series)
    sizeProp?: string; // For bubble chart
    min?: number; // For gauge
    max?: number; // For gauge
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
    switch (chartType) {
        case 'pie':
            return createPieChartOption(data, xProp, yProp, options);
        case 'funnel':
            return createFunnelChartOption(data, xProp, yProp, options);
        case 'radar':
            return createRadarChartOption(data, xProp, yProp, options);
        case 'gauge':
            return createGaugeChartOption(data, yProp, options);
        case 'bubble':
            return createScatterChartOption(data, xProp, yProp, 'scatter', options); // Bubble is Scatter with size
        case 'scatter':
            return createScatterChartOption(data, xProp, yProp, 'scatter', options);
        case 'bar':
        case 'line':
        default:
            return createCartesianChartOption(data, xProp, yProp, chartType, options);
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

function createFunnelChartOption(
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
    options?: ChartTransformerOptions
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
    options?: ChartTransformerOptions
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
        return {
            value: values.map(v => v === null ? 0 : v), // Radar needs numbers
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

function createScatterChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    type: 'scatter',
    options?: ChartTransformerOptions
): EChartsOption {
    const seriesProp = options?.seriesProp;
    const sizeProp = options?.sizeProp;

    // We will use category axis for X to be consistent with Bar/Line behavior in this plugin
    // This allows non-numeric X values.
    // However, if we want TRUE scatter (numeric X), ECharts can auto-detect if we provide data as [x, y].
    // But sticking to the pattern:

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
    // For Scatter, Data[] should be [xIndex, yValue, sizeValue?] or [xValue, yValue, sizeValue?]
    // Since we define xAxis data explicitly, we can use [xIndex, yValue] or just match the index logic.
    // But Scatter is better with `[x, y]` format where x can be category string or index.

    // Let's use `[xVal, yVal, sizeVal]` format. ECharts handles category string in xVal if xAxis type is category.

    const seriesMap = new Map<string, unknown[][]>();

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

        const point = [xVal, yVal];

        // Add size if exists
        if (sizeProp) {
            const sizeVal = Number(getNestedValue(item, sizeProp));
            point.push(isNaN(sizeVal) ? 0 : sizeVal);
        }

        seriesMap.get(sName)?.push(point);
    });

    const seriesOptions: ScatterSeriesOption[] = [];
    seriesMap.forEach((sData, sName) => {
        const seriesItem: ScatterSeriesOption = {
            name: sName,
            type: 'scatter',
            data: sData as any
        };

        if (sizeProp) {
            // Map the 3rd dimension (index 2) to symbolSize
            // We need a scaling function, but for now just raw value or simple scaling?
            // ECharts callback: (val: Array) => number
            seriesItem.symbolSize = function (data: any) {
                // data is [x, y, size]
                // Let's clamp or scale?
                // Using raw value for now, user might need to ensure it's reasonable size (e.g. 10-50)
                // Or we can add a simple multiplier/clamp.
                // Let's trust the data for now, maybe Math.sqrt(size) * constant?
                // Standard bubble chart practice: sqrt(area) prop to radius.
                const r = data[2];
                return Math.max(0, r);
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
                const vals = params.value; // [x, y, size]
                let tip = `${params.seriesName}<br/>${xProp}: ${vals[0]}<br/>${yProp}: ${vals[1]}`;
                if (sizeProp && vals.length > 2) {
                    tip += `<br/>${sizeProp}: ${vals[2]}`;
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
