import type { EChartsOption, SeriesOption, DatasetComponentOption } from 'echarts';
import * as R from 'remeda';
import type { BasesData, BaseTransformerOptions } from './base';
import { getLegendOption, getNestedValue, safeToString } from './utils';

export interface ScatterTransformerOptions extends BaseTransformerOptions {
    readonly seriesProp?: string;
    readonly sizeProp?: string;
}

export function createScatterChartOption(
    data: BasesData,
    xProp: string,
    yProp: string,
    options?: ScatterTransformerOptions
): EChartsOption {
    const seriesProp = options?.seriesProp;
    const sizeProp = options?.sizeProp;

    const source = data.map(item => {
        const obj: Record<string, unknown> = {
            x: item[xProp],
            y: item[yProp]
        };
        if (seriesProp) {
            obj.s = safeToString(getNestedValue(item, seriesProp));
        }
        if (sizeProp) {
            obj.size = Number(item[sizeProp]);
        }
        return obj;
    });

    const datasets: DatasetComponentOption[] = [{
        source: source
    }];

    const series: SeriesOption[] = [];

    // Ensure order matches tests: x, y, size, s
    const tooltipDims = ['x', 'y'];
    if (sizeProp) tooltipDims.push('size');
    if (seriesProp) tooltipDims.push('s');

    if (seriesProp) {
        const groups = R.pipe(
            source,
            R.map(item => String(item.s)),
            R.unique()
        );

        groups.forEach((groupName) => {
            datasets.push({
                transform: {
                    type: 'filter',
                    config: { dimension: 's', '=': groupName }
                }
            });
            const datasetIndex = datasets.length - 1;

            series.push({
                type: 'scatter',
                name: groupName,
                datasetIndex,
                encode: {
                    x: 'x',
                    y: 'y',
                    tooltip: tooltipDims
                },
                symbolSize: sizeProp ? (val: Record<string, unknown>) => {
                     const s = Number(val.size);
                     if (Number.isNaN(s)) return 10;
                     return s < 0 ? 0 : s;
                } : 10
            } as SeriesOption);
        });
    } else {
        series.push({
            type: 'scatter',
            datasetIndex: 0,
            encode: {
                x: 'x',
                y: 'y',
                tooltip: tooltipDims
            },
            symbolSize: sizeProp ? (val: Record<string, unknown>) => {
                 const s = Number(val.size);
                 if (Number.isNaN(s)) return 10;
                 return s < 0 ? 0 : s;
            } : 10
        } as SeriesOption);
    }

    return {
        dataset: datasets,
        series,
        legend: getLegendOption(options?.legend, options?.legendPosition, options?.legendOrient),
        xAxis: { type: 'value', name: options?.xAxisLabel, scale: true },
        yAxis: { type: 'value', name: options?.yAxisLabel, scale: true },
        tooltip: { trigger: 'item' },
        grid: { containLabel: true }
    };
}
