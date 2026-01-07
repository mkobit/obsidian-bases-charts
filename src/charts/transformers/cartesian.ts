import type { EChartsOption, SeriesOption, LineSeriesOption, BarSeriesOption, DatasetComponentOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue, getLegendOption } from './utils';
import * as R from 'remeda';

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
    const flipAxis = options?.flipAxis ?? false;
    const xAxisLabel = options?.xAxisLabel ?? xProp;
    const yAxisLabel = options?.yAxisLabel ?? yProp;
    const xAxisRotate = options?.xAxisLabelRotate ?? 0;

    // 1. Normalize Data for Dataset
    // Structure: { x, y, s }
    const normalizedData = R.map(data, (item) => {
        const xValRaw = getNestedValue(item, xProp);
        const yValRaw = Number(getNestedValue(item, yProp));
        const sValRaw = seriesProp ? getNestedValue(item, seriesProp) : undefined;

        return {
            x: xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw),
            y: Number.isNaN(yValRaw) ? null : yValRaw,
            s: seriesProp && sValRaw !== undefined && sValRaw !== null ? safeToString(sValRaw) : 'Series 1'
        };
    });

    // 2. Get unique X values (categories) for the axis
    // This ensures the axis has all categories even if filtered out in some series
    const xAxisData = R.pipe(
        normalizedData,
        R.map(d => d.x),
        R.unique()
    );

    // 3. Identify Series
    const seriesNames = R.pipe(
        normalizedData,
        R.map(d => d.s),
        R.unique()
    );

    // 4. Create Datasets
    const sourceDataset: DatasetComponentOption = { source: normalizedData };

    // If we have a seriesProp, we create filtered datasets for each series
    // If no seriesProp, we just use the source dataset directly (datasetIndex 0)
    const filterDatasets: DatasetComponentOption[] = seriesProp
        ? seriesNames.map(name => ({
            transform: {
                type: 'filter',
                config: { dimension: 's', value: name }
            }
        }))
        : [];

    const datasets: DatasetComponentOption[] = [sourceDataset, ...filterDatasets];

    // 5. Build Series Options
    const seriesOptions: SeriesOption[] = seriesNames.map((name, idx) => {
        // If seriesProp exists, we use the filtered datasets (starting at index 1)
        // If not, we use the source dataset (index 0)
        const datasetIndex = seriesProp ? idx + 1 : 0;

        const base = {
            name: name,
            datasetIndex: datasetIndex,
            // Encode: Map dimensions to axes
            // If flipped: X-Axis is Value (y data), Y-Axis is Category (x data)
            // So encode.x -> 'y', encode.y -> 'x'
            encode: flipAxis
                ? { x: 'y', y: 'x', tooltip: ['x', 'y', 's'] }
                : { x: 'x', y: 'y', tooltip: ['x', 'y', 's'] }
        };

        return chartType === 'line'
            ? (() => {
                 const lineItem: LineSeriesOption = {
                     ...base,
                     type: 'line',
                     ...(options?.smooth ? { smooth: true } : {}),
                     ...(options?.showSymbol === false ? { showSymbol: false } : {}),
                     ...(options?.areaStyle ? { areaStyle: {} } : {}),
                     ...(isStacked ? { stack: 'total' } : {})
                 };
                 return lineItem;
            })()
            : (() => {
                const barItem: BarSeriesOption = {
                    ...base,
                    type: 'bar',
                    ...(isStacked ? { stack: 'total' } : {})
                };
                return barItem;
            })();
    });

    const opt: EChartsOption = {
        dataset: datasets,
        xAxis: flipAxis
            ? {
                type: 'value',
                name: yAxisLabel
            }
            : {
                type: 'category',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
                data: xAxisData as any,
                name: xAxisLabel,
                axisLabel: {
                    rotate: xAxisRotate
                }
            },
        yAxis: flipAxis
            ? {
                type: 'category',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
                data: xAxisData as any,
                name: xAxisLabel,
                axisLabel: {
                    rotate: xAxisRotate
                }
            }
            : {
                type: 'value',
                name: yAxisLabel
            },
        series: seriesOptions,
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            containLabel: true
        },
        ...(getLegendOption(options) ? { legend: getLegendOption(options) } : {})
    };

    return opt;
}
