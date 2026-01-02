import type { EChartsOption, BoxplotSeriesOption } from 'echarts';
import type { BoxplotTransformerOptions } from './types';
import { safeToString, getNestedValue } from './utils';

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
    const min = sorted[0]!;
    const max = sorted[sorted.length - 1]!;
    const q1 = quantile(sorted, 0.25);
    const median = quantile(sorted, 0.5);
    const q3 = quantile(sorted, 0.75);
    return [min, q1, median, q3, max];
}

export function createBoxplotChartOption(
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
