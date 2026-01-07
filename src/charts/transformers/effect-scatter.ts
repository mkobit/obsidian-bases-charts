import type { EChartsOption, EffectScatterSeriesOption, DatasetComponentOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue, getLegendOption } from './utils';
import * as R from 'remeda';

export interface EffectScatterTransformerOptions extends BaseTransformerOptions {
    readonly seriesProp?: string;
    readonly sizeProp?: string;
}

interface ScatterDataPoint {
    readonly x: string;
    readonly y: number | null;
    readonly s: string;
    readonly size?: number;
}

export function createEffectScatterChartOption(
    data: readonly Record<string, unknown>[],
    xProp: string,
    yProp: string,
    options?: EffectScatterTransformerOptions
): EChartsOption {
    const seriesProp = options?.seriesProp;
    const sizeProp = options?.sizeProp;
    const xAxisLabel = options?.xAxisLabel ?? xProp;
    const yAxisLabel = options?.yAxisLabel ?? yProp;
    const xAxisRotate = options?.xAxisLabelRotate ?? 0;

    // 1. Normalize Data for Dataset
    // Structure: { x, y, s (series), size? }
    const normalizedData = R.map(data, (item) => {
        const xRaw = getNestedValue(item, xProp);
        const yRaw = Number(getNestedValue(item, yProp));
        const sRaw = seriesProp ? getNestedValue(item, seriesProp) : undefined;
        const sizeRaw = sizeProp ? Number(getNestedValue(item, sizeProp)) : undefined;

        return {
            x: xRaw === undefined || xRaw === null ? 'Unknown' : safeToString(xRaw),
            y: Number.isNaN(yRaw) ? null : yRaw,
            s: seriesProp && sRaw !== undefined && sRaw !== null ? safeToString(sRaw) : 'Series 1',
            ...(sizeProp ? { size: Number.isNaN(sizeRaw) ? 0 : sizeRaw } : {})
        };
    });

    // 2. Get unique X values (categories)
    const xAxisData = R.pipe(
        normalizedData,
        R.map(d => d.x),
        R.unique()
    );

    // 3. Get unique Series
    const seriesNames = R.pipe(
        normalizedData,
        R.map(d => d.s),
        R.unique()
    );

    // 4. Create Datasets
    const sourceDataset: DatasetComponentOption = { source: normalizedData };

    const filterDatasets: readonly DatasetComponentOption[] = seriesNames.map(name => ({
        transform: {
            type: 'filter',
            config: { dimension: 's', value: name }
        }
    }));

    const datasets: readonly DatasetComponentOption[] = [sourceDataset, ...filterDatasets];

    // 5. Build Series Options
    const seriesOptions: readonly EffectScatterSeriesOption[] = seriesNames.map((name, idx) => {
        const datasetIndex = idx + 1;

        return {
            name: name,
            type: 'effectScatter',
            datasetIndex: datasetIndex,
            encode: {
                x: 'x',
                y: 'y',
                tooltip: sizeProp ? ['x', 'y', 'size', 's'] : ['x', 'y', 's']
            },
            ...(sizeProp ? {
                symbolSize: (val: unknown) => {
                    const point = val as ScatterDataPoint;
                    return (point && typeof point === 'object' && 'size' in point)
                        ? Math.max(0, Number(point.size))
                        : 10;
                }
            } : {})
        };
    });

    const opt: EChartsOption = {
        // eslint-disable-next-line functional/prefer-readonly-type
        dataset: datasets as unknown as DatasetComponentOption[],
        xAxis: {
            type: 'category', // Consistent with bar/line
            data: xAxisData,
            name: xAxisLabel,
            splitLine: { show: true },
            axisLabel: {
                rotate: xAxisRotate
            }
        },
        yAxis: {
            type: 'value',
            name: yAxisLabel,
            splitLine: { show: true }
        },
        // eslint-disable-next-line functional/prefer-readonly-type
        series: seriesOptions as unknown as EffectScatterSeriesOption[],
        tooltip: {
            trigger: 'item'
        },
        ...(getLegendOption(options) ? { legend: getLegendOption(options) } : {})
    };

    return opt;
}
