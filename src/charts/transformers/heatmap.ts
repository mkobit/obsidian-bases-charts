import type { EChartsOption, HeatmapSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';
import * as R from 'remeda';

export interface HeatmapTransformerOptions extends BaseTransformerOptions {
    valueProp?: string;
}

export function createHeatmapChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    options?: HeatmapTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;

    // 1. Identify X Categories (Horizontal)
    const xAxisData = R.pipe(
        data,
        R.map(item => {
            const valRaw = getNestedValue(item, xProp);
            return valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);
        }),
        R.unique()
    );

    // 2. Identify Y Categories (Vertical)
    const yAxisData = R.pipe(
        data,
        R.map(item => {
            const valRaw = getNestedValue(item, yProp);
            return valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);
        }),
        R.unique()
    );

    // 3. Build Data [xIndex, yIndex, value]
    const seriesData = R.pipe(
        data,
        R.map(item => {
            const xValRaw = getNestedValue(item, xProp);
            const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);
            const xIndex = xAxisData.indexOf(xVal);

            const yValRaw = getNestedValue(item, yProp);
            const yVal = yValRaw === undefined || yValRaw === null ? 'Unknown' : safeToString(yValRaw);
            const yIndex = yAxisData.indexOf(yVal);

            return (xIndex === -1 || yIndex === -1)
                ? null
                : (() => {
                    const valNum = valueProp ? Number(getNestedValue(item, valueProp)) : Number.NaN;
                    const val = Number.isNaN(valNum) ? 0 : valNum;
                    return [xIndex, yIndex, val] as [number, number, number];
                })();
        }),
        R.filter((x): x is [number, number, number] => x !== null)
    );

    const values = R.map(seriesData, x => x[2]);
    const finalMinVal = values.length > 0 ? Math.min(...values) : 0;
    const finalMaxVal = values.length > 0 ? Math.max(...values) : 10;

    const seriesItem: HeatmapSeriesOption = {
        type: 'heatmap',
        data: seriesData,
        label: {
            show: true
        }
    };

    const opt: EChartsOption = {
        tooltip: {
            position: 'top',
            formatter: (params: unknown) => {
                const p = params as { value: (number | string)[] };
                return (!p || !Array.isArray(p.value))
                    ? ''
                    : (() => {
                        const xIndex = p.value[0] as number;
                        const yIndex = p.value[1] as number;
                        const val = p.value[2] as number;
                        return `${xProp}: ${xAxisData[xIndex]}<br/>${yProp}: ${yAxisData[yIndex]}<br/>Value: ${val}`;
                    })();
            }
        },
        grid: {
            height: '70%',
            top: '10%'
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            splitArea: {
                show: true
            }
        },
        yAxis: {
            type: 'category',
            data: yAxisData,
            splitArea: {
                show: true
            }
        },
        visualMap: {
            min: finalMinVal,
            max: finalMaxVal,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '0%'
        },
        series: [seriesItem]
    };

    return opt;
}
