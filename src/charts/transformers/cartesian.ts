import type { EChartsOption, SeriesOption, LineSeriesOption, BarSeriesOption, DatasetComponentOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface CartesianTransformerOptions extends BaseTransformerOptions {
    smooth?: boolean;
    showSymbol?: boolean;
    areaStyle?: boolean;
    stack?: boolean;
    seriesProp?: string;
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

    // Keys for the flat dataset
    const X_DIM = 'x';
    const Y_DIM = 'y';
    const S_DIM = 's';

    const uniqueX = new Set<string>();
    const uniqueSeries = new Set<string>();

    // 1. Normalize data to flat structure
    const flatData = [];

    for (const item of data) {
        const xValRaw = getNestedValue(item, xProp);
        const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);
        uniqueX.add(xVal);

        const yValRaw = getNestedValue(item, yProp);
        const yVal = Number(yValRaw);

        // Filter out invalid numbers (matches logic in original: !isNaN(yVal))
        if (isNaN(yVal)) {
            continue;
        }

        let sVal: string | undefined = undefined;
        if (seriesProp) {
            const sValRaw = getNestedValue(item, seriesProp);
            if (sValRaw !== undefined && sValRaw !== null) {
                sVal = safeToString(sValRaw);
            } else {
                sVal = 'Series 1';
            }
            uniqueSeries.add(sVal);
        }

        flatData.push({
            [X_DIM]: xVal,
            [Y_DIM]: yVal,
            [S_DIM]: sVal
        });
    }

    const xAxisData = Array.from(uniqueX);

    // 2. Configure Dataset
    // Root dataset at index 0
    const datasets: DatasetComponentOption[] = [{
        source: flatData,
        dimensions: seriesProp ? [X_DIM, Y_DIM, S_DIM] : [X_DIM, Y_DIM]
    }];

    // 3. Configure Series
    const seriesOptions: SeriesOption[] = [];

    if (seriesProp) {
        const seriesNames = Array.from(uniqueSeries);

        for (const sName of seriesNames) {
            // Create a transform dataset for this series
            datasets.push({
                transform: {
                    type: 'filter',
                    config: { dimension: S_DIM, value: sName }
                }
            });
            const datasetIndex = datasets.length - 1;

            const base: any = {
                name: sName,
                type: chartType,
                datasetIndex: datasetIndex,
                encode: {
                    x: X_DIM,
                    y: Y_DIM
                }
            };
            seriesOptions.push(base);
        }
    } else {
        // Single series, use root dataset
        const base: any = {
            name: yProp, // Or just use default
            type: chartType,
            datasetIndex: 0,
            encode: {
                x: X_DIM,
                y: Y_DIM
            }
        };
        seriesOptions.push(base);
    }

    // Apply common styles
    seriesOptions.forEach(s => {
        if (chartType === 'line') {
             const line = s as LineSeriesOption;
             if (options?.smooth) line.smooth = true;
             if (options?.showSymbol === false) line.showSymbol = false;
             if (options?.areaStyle) line.areaStyle = {};
             if (isStacked) line.stack = 'total';
        } else {
            const bar = s as BarSeriesOption;
            if (isStacked) bar.stack = 'total';
        }
    });

    const opt: EChartsOption = {
        dataset: datasets,
        xAxis: {
            type: 'category',
            data: xAxisData, // Explicitly set categories to ensure order and show all even if data missing
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
