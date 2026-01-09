import type { EChartsOption, SeriesOption } from 'echarts';
import * as R from 'remeda';
import type { BasesData, BaseTransformerOptions } from './base';
import { getLegendOption, getNestedValue, safeToString } from './utils';

export interface ParallelTransformerOptions extends BaseTransformerOptions {
    readonly seriesProp?: string;
}

export function createParallelChartOption(
    data: BasesData,
    dimensionsProp: string, // Comma separated dimensions
    options?: ParallelTransformerOptions
): EChartsOption {
    if (!dimensionsProp) {
        return {
            title: {
                text: 'No dimensions provided',
                left: 'center',
                top: 'center'
            }
        };
    }

    const dims = dimensionsProp.split(',').map(s => s.trim()).filter(Boolean);
    if (dims.length === 0) {
        return {
             title: {
                text: 'No dimensions provided',
                left: 'center',
                top: 'center'
            }
        };
    }

    // Grouping
    const seriesProp = options?.seriesProp;
    const seriesList: SeriesOption[] = [];
    const parallelAxis: any[] = [];

    // Determine axis types
    const dimTypes = dims.map(dim => {
        if (data.length === 0) return 'category'; // Default to category if no data (fixes test)
        const isNumeric = data.every(item => {
            const v = item[dim];
            return v === undefined || v === null || typeof v === 'number' || !isNaN(Number(v));
        });
        return isNumeric ? 'value' : 'category';
    });

    dims.forEach((dim, index) => {
        const type = dimTypes[index];
        const axis: any = {
            dim: index,
            name: dim,
            type: type
        };

        if (type === 'category') {
            const categories = R.pipe(
                data,
                R.map(item => String(item[dim] || '')),
                R.unique()
            );
            axis.data = categories;
        }

        parallelAxis.push(axis);
    });

    if (seriesProp) {
        const groups = R.pipe(
            data,
            R.groupBy(item => safeToString(getNestedValue(item, seriesProp)))
        );

        for (const [name, groupData] of Object.entries(groups)) {
             const seriesData = groupData!.map(item => {
                return dims.map(dim => item[dim] as number | string);
            });

            seriesList.push({
                type: 'parallel',
                name: name,
                data: seriesData,
                lineStyle: { width: 2 }
            });
        }
    } else {
        const seriesData = data.map(item => {
            return dims.map(dim => item[dim] as number | string);
        });

        seriesList.push({
            type: 'parallel',
            data: seriesData
        });
    }

    return {
        parallelAxis,
        series: seriesList,
        parallel: {
            left: '5%',
            right: '13%',
            bottom: '10%',
            top: '20%',
            parallelAxisDefault: {
                type: 'value',
                nameLocation: 'end',
                nameGap: 20
            }
        },
        legend: getLegendOption(options?.legend, options?.legendPosition, options?.legendOrient)
    };
}
