import type { EChartsOption, ScatterSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';
import * as R from 'remeda';

export interface ScatterTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;
    sizeProp?: string;
}

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
    // flipAxis is not supported for scatter yet due to complexity in data mapping
    const xAxisLabel = options?.xAxisLabel ?? xProp;
    const yAxisLabel = options?.yAxisLabel ?? yProp;
    const xAxisRotate = options?.xAxisLabelRotate ?? 0;

    // We will use category axis for X to be consistent with Bar/Line behavior in this plugin
    // This allows non-numeric X values.

    // 1. Get all unique X values (categories)
    const xAxisData = R.pipe(
        data,
        R.map(item => {
            const valRaw = getNestedValue(item, xProp);
            return valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);
        }),
        R.unique()
    );

    // 2. Build Series
    const seriesOptions = R.pipe(
        data,
        R.groupBy(item => {
            return !seriesProp
                ? 'Series 1'
                : (() => {
                    const sRaw = getNestedValue(item, seriesProp);
                    return sRaw === undefined || sRaw === null ? 'Series 1' : safeToString(sRaw);
                })();
        }),
        R.entries(),
        R.map(([sName, items]) => {
            const sData: ScatterDataPoint[] = R.pipe(
                items,
                R.map(item => {
                    const xValRaw = getNestedValue(item, xProp);
                    const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);

                    const yVal = Number(getNestedValue(item, yProp));
                    return Number.isNaN(yVal)
                        ? null
                        : (() => {
                            // Base point is [x, y]
                            const point: ScatterDataPoint = [xVal, yVal];

                            // Add size if exists (making it [x, y, size])
                            return sizeProp
                                ? (() => {
                                    const sizeVal = Number(getNestedValue(item, sizeProp));
                                    const finalSize = Number.isNaN(sizeVal) ? 0 : sizeVal;
                                    return [...point, finalSize] as ScatterDataPoint;
                                })()
                                : point;
                        })();
                }),
                R.filter((x): x is ScatterDataPoint => x !== null)
            );

            const seriesItem: ScatterSeriesOption = {
                name: sName,
                type: 'scatter',
                data: sData,
                ...(sizeProp ? {
                    symbolSize: function (data: unknown) {

                        const dArr = Array.isArray(data) ? data : [];
                        return dArr.length > 2
                             ? Math.max(0, dArr[2] as number)
                             : 10; // Default size
                    }
                } : {})
            };

            return seriesItem;
        })
    );

    const opt: EChartsOption = {
        xAxis: {
            type: 'category',
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
        series: seriesOptions,
        tooltip: {
            trigger: 'item',
            formatter: (params: unknown) => {
                const p = params as { value: ScatterDataPoint, seriesName: string };
                return (!p || typeof p !== 'object')
                    ? ''
                    : (() => {
                        const vals = p.value;
                        return (!Array.isArray(vals))
                            ? ''
                            : (() => {
                                const val0 = vals[0] === undefined ? '' : String(vals[0]);
                                const val1 = vals[1] === undefined ? '' : String(vals[1]);
                                const baseTip = `${p.seriesName}<br/>${xProp}: ${val0}<br/>${yProp}: ${val1}`;

                                const sizeTip = (sizeProp && vals.length > 2)
                                    ? `<br/>${sizeProp}: ${vals[2] === undefined ? '' : String(vals[2])}`
                                    : '';

                                return baseTip + sizeTip;
                            })();
                    })();
            }
        },
        ...(options?.legend ? { legend: {} } : {})
    };

    return opt;
}
