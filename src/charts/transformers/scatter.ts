import type { EChartsOption, ScatterSeriesOption } from 'echarts';
import type { ScatterTransformerOptions } from './types';
import { safeToString, getNestedValue } from './utils';

// Define specific type for Scatter data points [x, y, size?]
// Using unknown as the base to satisfy ECharts loose types but casting internally
type ScatterDataPoint = (string | number)[];

export function createScatterChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
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
            point.push(isNaN(sizeVal) ? 0 : sizeVal);
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
            seriesItem.symbolSize = function (data: unknown) {
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
            formatter: (params: unknown) => {
                const p = params as { value: ScatterDataPoint, seriesName: string };
                if (!p || typeof p !== 'object') return '';

                const vals = p.value;
                let tip = '';
                if (Array.isArray(vals)) {
                    tip = `${p.seriesName}<br/>${xProp}: ${vals[0]}<br/>${yProp}: ${vals[1]}`;
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
