import type { EChartsOption, DatasetComponentOption, BarSeriesOption, ScatterSeriesOption } from 'echarts';
import type { BaseTransformerOptions, BasesData } from './base';
import { safeToString, getNestedValue, getLegendOption } from './utils';
import * as R from 'remeda';

export interface BulletTransformerOptions extends BaseTransformerOptions {
    readonly targetProp?: string;
}

export function createBulletChartOption(
    data: BasesData,
    categoryProp: string,
    valueProp: string,
    options?: BulletTransformerOptions
): EChartsOption {
    const targetProp = options?.targetProp;
    const xAxisLabel = options?.xAxisLabel ?? categoryProp;
    const yAxisLabel = options?.yAxisLabel ?? valueProp;
    const flipAxis = options?.flipAxis ?? false;

    const normalizedData = R.map(data, (item) => {
        const catVal = getNestedValue(item, categoryProp);
        const valVal = Number(getNestedValue(item, valueProp));
        const targetVal = targetProp ? Number(getNestedValue(item, targetProp)) : undefined;

        return {
            x: catVal === undefined || catVal === null ? 'Unknown' : safeToString(catVal),
            y: Number.isNaN(valVal) ? null : valVal,
            t: targetVal !== undefined && !Number.isNaN(targetVal) ? targetVal : null
        };
    });

    const categories = R.pipe(
        normalizedData,
        R.map(d => d.x),
        R.unique()
    );

    const dataset: DatasetComponentOption = {
        source: normalizedData
    };

    const barSeries: BarSeriesOption = {
        name: valueProp,
        type: 'bar',
        encode: flipAxis
            ? { x: 'y', y: 'x' }
            : { x: 'x', y: 'y' },
        barWidth: '60%',
        z: 2
    };

    const scatterSeries: ScatterSeriesOption = {
        name: targetProp ?? 'Target',
        type: 'scatter',
        encode: flipAxis
            ? { x: 't', y: 'x' }
            : { x: 'x', y: 't' },
        symbol: 'rect',
        symbolSize: flipAxis
            ? [4, 40]
            : [40, 4],
        z: 3
    };

    const series = targetProp
        ? [barSeries, scatterSeries]
        : [barSeries];

    return {
        dataset: [dataset],
        tooltip: { trigger: 'axis' },
        xAxis: flipAxis
            ? { type: 'value', name: yAxisLabel }
            : { type: 'category', data: categories, name: xAxisLabel },
        yAxis: flipAxis
            ? { type: 'category', data: categories, name: xAxisLabel }
            : { type: 'value', name: yAxisLabel },
        series: series,
        grid: {
            containLabel: true
        },
        ...(getLegendOption(options) ? { legend: getLegendOption(options) } : {})
    };
}
