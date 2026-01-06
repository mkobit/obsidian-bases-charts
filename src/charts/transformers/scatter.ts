import type { EChartsOption, ScatterSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';
import * as R from 'remeda';

export interface ScatterTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;
    sizeProp?: string;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const datasets: any[] = [{ source: normalizedData }];

    seriesNames.forEach(name => {
        datasets.push({
            transform: {
                type: 'filter',
                config: { dimension: 's', value: name }
            }
        });
    });

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
            ...(sizeProp ? {
                symbolSize: function (val: any) {
                    // When using dataset, val is the data object { x, y, s, size } or array
                    // But with encode, ECharts passes the whole item.
                    // However, we can simply map the dimension.
                    // Actually, simpler approach with dataset:
                    // Use `symbolSize` callback which receives the whole data item.
                    return val && typeof val === 'object' && 'size' in val
                        ? Math.max(0, Number(val.size))
                        : 10;
                }
            } : {})
        };
    });

    const opt: EChartsOption = {
        dataset: datasets,
        xAxis: {
            type: 'category', // Consistent with bar/line
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        ...(options?.legend ? { legend: {} } : {})
    };

    return opt;
}
