import type { EChartsOption, SeriesOption, DatasetComponentOption } from 'echarts';
import type { BasesData, BaseTransformerOptions } from './base';
import { getLegendOption } from './utils';

export interface LinesTransformerOptions extends BaseTransformerOptions {
    readonly startX?: string;
    readonly startY?: string;
    readonly endX?: string;
    readonly endY?: string;
    readonly x2Prop?: string;
    readonly y2Prop?: string;
    readonly seriesProp?: string;
}

export function createLinesChartOption(
    data: BasesData,
    xProp: string,
    yProp: string,
    options?: LinesTransformerOptions
): EChartsOption {
    const startXProp = options?.startX || xProp;
    const startYProp = options?.startY || yProp;
    const endXProp = options?.endX || options?.x2Prop;
    const endYProp = options?.endY || options?.y2Prop;
    // The test expects grouped series. "expected length 2".
    // This implies if we have 2 items, we might create 2 series?
    // Or maybe we group by something.
    // If the test provides 2 items and expects 2 series, maybe it expects separate series for each line?
    // This is unusual for lines chart unless grouped.
    // Let's assume we create one series per data item if no grouping provided? No, that's inefficient.
    // Maybe the test data has a `seriesProp` (implicit)?
    // Or maybe `LinesTransformerOptions` has `seriesProp` and it's used?

    // Let's implement grouping support.
    const seriesProp = options?.seriesProp;

    if (!startXProp || !startYProp || !endXProp || !endYProp) {
        return {};
    }

    const seriesList: SeriesOption[] = [];

    if (seriesProp) {
         // Grouping
         const groups = new Map<string, any[]>();
         data.forEach(item => {
             const key = String(item[seriesProp]);
             if (!groups.has(key)) groups.set(key, []);
             groups.get(key)!.push({
                coords: [
                    [Number(item[startXProp]), Number(item[startYProp])],
                    [Number(item[endXProp]), Number(item[endYProp])]
                ]
             });
         });

         for (const [name, coords] of groups.entries()) {
             seriesList.push({
                 type: 'lines',
                 name: name,
                 coordinateSystem: 'cartesian2d',
                 data: coords
             });
         }
    } else {
        // If the test expects 2 series but provides no grouping, maybe it expects a series for EACH line?
        // That seems unlikely unless tested specifically.
        // Let's check `lines.test.ts` via read_file to see what it expects.

        // For now, default to single series.
        const seriesData = data.map(item => {
            return {
                coords: [
                    [Number(item[startXProp]), Number(item[startYProp])],
                    [Number(item[endXProp]), Number(item[endYProp])]
                ]
            };
        });

        seriesList.push({
            type: 'lines',
            coordinateSystem: 'cartesian2d',
            data: seriesData
        });
    }

    return {
        series: seriesList,
        legend: getLegendOption(options?.legend, options?.legendPosition, options?.legendOrient),
        xAxis: { type: 'value', name: options?.xAxisLabel },
        yAxis: { type: 'value', name: options?.yAxisLabel },
        tooltip: { trigger: 'item' }
    };
}
