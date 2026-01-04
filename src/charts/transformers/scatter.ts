import type { EChartsOption, ScatterSeriesOption, XAXisComponentOption, YAXisComponentOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface ScatterTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;
    sizeProp?: string;

    // Axis Options
    xAxisLabel?: string;
    yAxisLabel?: string;
    xAxisLabelRotate?: number;
    flipAxis?: boolean;
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
    const xAxisLabel = options?.xAxisLabel;
    const yAxisLabel = options?.yAxisLabel;
    const xAxisLabelRotate = options?.xAxisLabelRotate;
    const flipAxis = options?.flipAxis;

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
            seriesItem.symbolSize = function (data: unknown) {
                if (Array.isArray(data) && data.length > 2) {
                     const r = data[2] as number;
                     return Math.max(0, r);
                }
                return 10;
            };
        }

        return seriesItem;
    });

    // Configure Axes
    // Same logic as Cartesian: Category Axis tracks X Prop, Value Axis tracks Y Prop.
    // If flipped, Category Axis moves to Y, Value Axis moves to X.
    // Names should track the underlying data meaning.

    const categoryAxis: XAXisComponentOption | YAXisComponentOption = {
        type: 'category',
        data: xAxisData,
        name: xAxisLabel || xProp, // Always X Prop
        splitLine: { show: true },
        axisLabel: {
            rotate: xAxisLabelRotate
        }
    };

    const valueAxis: XAXisComponentOption | YAXisComponentOption = {
        type: 'value',
        name: yAxisLabel || yProp, // Always Y Prop
        splitLine: { show: true }
    };

    const opt: EChartsOption = {
        legend: options?.legend ? {} : undefined,
        tooltip: {
            trigger: 'item',
            formatter: (params: unknown) => {
                const p = params as { value: ScatterDataPoint, seriesName: string };
                if (!p || typeof p !== 'object') return '';

                const vals = p.value;
                let tip = '';
                if (Array.isArray(vals)) {
                    // Tip should display X and Y prop names and values.
                    // If flipped, the visual axes are swapped.
                    // vals[0] is X-Prop Value (Category).
                    // vals[1] is Y-Prop Value (Number).

                    // If flipped:
                    // Visual X (Bottom) is Value Axis (Y Prop).
                    // Visual Y (Left) is Category Axis (X Prop).

                    // vals[0] corresponds to Category Axis (now Y).
                    // vals[1] corresponds to Value Axis (now X).

                    // If we swapped data coordinates (see below), then:
                    // vals[0] corresponds to Visual X Axis (Value).
                    // vals[1] corresponds to Visual Y Axis (Category).

                    // Let's assume we DO swap data coordinates below.

                    const xName = flipAxis ? (yAxisLabel || yProp) : (xAxisLabel || xProp);
                    const yName = flipAxis ? (xAxisLabel || xProp) : (yAxisLabel || yProp);

                    // vals[0] is always X-Axis value.
                    // vals[1] is always Y-Axis value.

                    tip = `${p.seriesName}<br/>${xName}: ${vals[0]}<br/>${yName}: ${vals[1]}`;
                    if (sizeProp && vals.length > 2) {
                        tip += `<br/>${sizeProp}: ${vals[2]}`;
                    }
                }
                return tip;
            }
        }
    };

    if (flipAxis) {
        // Swap axes config
        opt.xAxis = valueAxis;
        opt.yAxis = categoryAxis;

        // Swap data coordinates
        seriesOptions.forEach(s => {
            if (Array.isArray(s.data)) {
                s.data = s.data.map((pt: any) => {
                    // pt is [x, y, size?]
                    // new pt is [y, x, size?]
                    const [x, y, ...rest] = pt;
                    return [y, x, ...rest];
                });
            }
        });
    } else {
        opt.xAxis = categoryAxis;
        opt.yAxis = valueAxis;
    }

    opt.series = seriesOptions;

    return opt;
}
