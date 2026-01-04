import type { EChartsOption, ScatterSeriesOption } from 'echarts';
import type { BaseTransformerOptions, AxisOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface ScatterTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;
    sizeProp?: string;

    axis?: AxisOptions;
}

type ScatterDataPoint = (string | number)[];

export function createScatterChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    options?: ScatterTransformerOptions
): EChartsOption {
    const seriesProp = options?.seriesProp;
    const sizeProp = options?.sizeProp;

    const xAxisLabel = options?.axis?.xAxisLabel;
    const yAxisLabel = options?.axis?.yAxisLabel;
    const xAxisLabelRotate = options?.axis?.xAxisLabelRotate;
    const flipAxis = options?.axis?.flipAxis;

    const uniqueX = new Set<string>();
    for (const item of data) {
        const valRaw = getNestedValue(item, xProp);
        const xVal = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);
        uniqueX.add(xVal);
    }
    const xAxisData = Array.from(uniqueX);

    const seriesMap = data.reduce((acc, item) => {
        const xValRaw = getNestedValue(item, xProp);
        const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);

        const yVal = Number(getNestedValue(item, yProp));
        if (isNaN(yVal)) return acc;

        let sName = 'Series 1';
        if (seriesProp) {
            const sRaw = getNestedValue(item, seriesProp);
            sName = sRaw === undefined || sRaw === null ? 'Series 1' : safeToString(sRaw);
        }

        if (!acc.has(sName)) {
            acc.set(sName, []);
        }

        const point: ScatterDataPoint = [xVal, yVal];

        if (sizeProp) {
            const sizeVal = Number(getNestedValue(item, sizeProp));
            point.push(isNaN(sizeVal) ? 0 : sizeVal);
        }

        acc.get(sName)?.push(point);
        return acc;
    }, new Map<string, ScatterDataPoint[]>());

    const seriesOptions: ScatterSeriesOption[] = Array.from(seriesMap.entries()).map(([sName, sData]) => {
        const seriesItem: ScatterSeriesOption = {
            name: sName,
            type: 'scatter',
            data: sData
        };

        if (sizeProp) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            seriesItem.symbolSize = function (data: any) {
                if (Array.isArray(data) && data.length > 2) {
                     const r = data[2] as number;
                     return Math.max(0, r);
                }
                return 10;
            };
        }

        return seriesItem;
    });

    const categoryAxis = {
        type: 'category' as const,
        data: xAxisData,
        name: xAxisLabel || xProp,
        splitLine: { show: true },
        axisLabel: {
            rotate: xAxisLabelRotate
        }
    };

    const valueAxis = {
        type: 'value' as const,
        name: yAxisLabel || yProp,
        splitLine: { show: true }
    };

    const opt: EChartsOption = {
        legend: options?.legend ? {} : undefined,
        tooltip: {
            trigger: 'item',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params: any) => {
                const p = params as { value: ScatterDataPoint, seriesName: string };
                if (!p || typeof p !== 'object') return '';

                const vals = p.value;
                let tip = '';
                if (Array.isArray(vals)) {
                    const xName = flipAxis ? (yAxisLabel || yProp) : (xAxisLabel || xProp);
                    const yName = flipAxis ? (xAxisLabel || xProp) : (yAxisLabel || yProp);

                    tip = `${p.seriesName}<br/>${xName}: ${vals[0]}<br/>${yName}: ${vals[1]}`;
                    if (sizeProp && vals.length > 2) {
                        tip += `<br/>${sizeProp}: ${vals[2]}`;
                    }
                }
                return tip;
            }
        },
        series: seriesOptions
    };

    if (flipAxis) {
        opt.xAxis = valueAxis;
        opt.yAxis = categoryAxis;

        seriesOptions.forEach(s => {
            if (Array.isArray(s.data)) {
                // Explicitly type 'pt' as ScatterDataPoint (or unknown[] if we are looser)
                // ScatterDataPoint is (string|number)[]
                s.data = s.data.map((pt) => {
                    const point = pt as unknown as (string | number)[];
                    const [x, y, ...rest] = point;
                    // Return explicitly typed array
                    return [y, x, ...rest] as (string | number)[];
                });
            }
        });
    } else {
        opt.xAxis = categoryAxis;
        opt.yAxis = valueAxis;
    }

    return opt;
}
