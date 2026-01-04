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

    // 1. Normalize data to flat structure using functional patterns
    // First, map to raw values and filter invalid ones
    const validItems = data
        .map(item => {
            const xValRaw = getNestedValue(item, xProp);
            const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);

            const yValRaw = getNestedValue(item, yProp);
            const yVal = Number(yValRaw);

            let sVal: string | undefined = undefined;
            if (seriesProp) {
                const sValRaw = getNestedValue(item, seriesProp);
                if (sValRaw !== undefined && sValRaw !== null) {
                    sVal = safeToString(sValRaw);
                } else {
                    sVal = 'Series 1';
                }
            }

            return { xVal, yVal, sVal };
        })
        .filter(item => !isNaN(item.yVal));

    const flatData = validItems.map(item => ({
        [X_DIM]: item.xVal,
        [Y_DIM]: item.yVal,
        [S_DIM]: item.sVal
    }));

    // Extract unique values for X axis and Series
    const xAxisData = Array.from(new Set(validItems.map(i => i.xVal)));
    const uniqueSeries = Array.from(new Set(validItems.map(i => i.sVal).filter((s): s is string => s !== undefined)));

    // 2. Configure Dataset
    // Root dataset at index 0
    const sourceDataset: DatasetComponentOption = {
        source: flatData,
        dimensions: seriesProp ? [X_DIM, Y_DIM, S_DIM] : [X_DIM, Y_DIM]
    };

    // Create transform datasets for each series if seriesProp is defined
    const transformDatasets: DatasetComponentOption[] = seriesProp
        ? uniqueSeries.map(sName => ({
            transform: {
                type: 'filter',
                config: { dimension: S_DIM, value: sName }
            }
        }))
        : [];

    const datasets: DatasetComponentOption[] = [sourceDataset, ...transformDatasets];

    // Helper to apply common styles
    const applyStyles = (base: SeriesOption): SeriesOption => {
        if (chartType === 'line') {
             const line = { ...base, type: 'line' } as LineSeriesOption;
             if (options?.smooth) line.smooth = true;
             if (options?.showSymbol === false) line.showSymbol = false;
             if (options?.areaStyle) line.areaStyle = {};
             if (isStacked) line.stack = 'total';
             return line;
        } else {
            const bar = { ...base, type: 'bar' } as BarSeriesOption;
            if (isStacked) bar.stack = 'total';
            return bar;
        }
    };

    // 3. Configure Series
    let seriesOptions: SeriesOption[];

    if (seriesProp) {
        seriesOptions = uniqueSeries.map((sName, index) => {
            // datasetIndex: 0 is source, 1..N are transforms.
            // transform for series[0] is at datasets[1], etc.
            const datasetIndex = index + 1;

            const base: SeriesOption = {
                name: sName,
                datasetIndex: datasetIndex,
                encode: {
                    x: X_DIM,
                    y: Y_DIM
                }
            };
            return applyStyles(base);
        });
    } else {
        // Single series, use root dataset
        const base: SeriesOption = {
            name: yProp,
            datasetIndex: 0,
            encode: {
                x: X_DIM,
                y: Y_DIM
            }
        };
        seriesOptions = [applyStyles(base)];
    }

    const opt: EChartsOption = {
        dataset: datasets,
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
