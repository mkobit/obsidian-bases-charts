import type { EChartsOption, ScatterSeriesOption, DatasetComponentOption, VisualMapComponentOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';
import * as R from 'remeda';

export interface ScatterTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;
    sizeProp?: string;
}

interface ScatterDataPoint {
    x: string;
    y: number | null;
    s: string;
    size?: number;
}

export function createScatterChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    options?: ScatterTransformerOptions
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

    const filterDatasets: DatasetComponentOption[] = seriesNames.map(name => ({
        transform: {
            type: 'filter',
            config: { dimension: 's', value: name }
        }
    }));

    const datasets: DatasetComponentOption[] = [sourceDataset, ...filterDatasets];

    // Calculate Min/Max for VisualMap if needed
    let visualMapOption: VisualMapComponentOption | undefined;
    if (sizeProp || options?.visualMapType) {
        // If user explicitly asks for visual map or we have sizeProp (which maps to size)
        // If sizeProp exists, it maps to 'size' property in data

        const sizes = sizeProp ? R.pipe(normalizedData, R.map(d => d.size), R.filter((d): d is number => d !== undefined)) : [];
        const dataMin = sizes.length > 0 ? Math.min(...sizes) : 0;
        const dataMax = sizes.length > 0 ? Math.max(...sizes) : 10;

        const finalMinVal = options?.visualMapMin !== undefined ? options.visualMapMin : dataMin;
        const finalMaxVal = options?.visualMapMax !== undefined ? options.visualMapMax : dataMax;

        visualMapOption = {
            min: finalMinVal,
            max: finalMaxVal,
            calculable: true,
            orient: options?.visualMapOrient ?? 'horizontal',
            left: options?.visualMapLeft ?? 'center',
            bottom: options?.visualMapTop !== undefined ? undefined : '0%', // Default bottom if top not set
            top: options?.visualMapTop,
            type: options?.visualMapType ?? 'continuous',
            dimension: sizeProp ? 'size' : undefined, // Map to the 'size' dimension in the dataset
            inRange: {
                 // If visualMapColor provided, use it for color
                 // If sizeProp provided, we usually want symbolSize mapping.
                 // The docs say "scatter charts use radius to represent the third dimension"
                 ...(options?.visualMapColor ? { color: options.visualMapColor } : {}),
                 ...(sizeProp ? { symbolSize: [10, 50] } : {}) // Default size range if sizeProp is used
            }
        };
    }


    // 5. Build Series Options
    const seriesOptions: ScatterSeriesOption[] = seriesNames.map((name, idx) => {
        const datasetIndex = idx + 1;

        return {
            name: name,
            type: 'scatter',
            datasetIndex: datasetIndex,
            encode: {
                x: 'x',
                y: 'y',
                tooltip: sizeProp ? ['x', 'y', 'size', 's'] : ['x', 'y', 's']
            },
            // If visualMap is active and targets 'size' dimension, we don't need manual symbolSize callback usually,
            // UNLESS visualMap only handles color.
            // ECharts visualMap can handle symbolSize.
            // But if visualMap is NOT enabled, we fall back to manual callback.
            ...(sizeProp && !visualMapOption ? {
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
        dataset: datasets,
        xAxis: {
            type: 'category', // Consistent with bar/line
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
            data: xAxisData as any,
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
        series: seriesOptions,
        tooltip: {
            trigger: 'item'
        },
        ...(options?.legend ? { legend: {} } : {}),
        ...(visualMapOption ? { visualMap: visualMapOption } : {})
    };

    return opt;
}
