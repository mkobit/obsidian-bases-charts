import type { EChartsOption, FunnelSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';
import * as R from 'remeda';

export function createFunnelChartOption(
    data: Record<string, unknown>[],
    nameProp: string,
    valueProp: string,
    options?: BaseTransformerOptions
): EChartsOption {
    const seriesData = R.pipe(
        data,
        R.map(item => {
            const valRaw = getNestedValue(item, nameProp);
            const name = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);

            const val = Number(getNestedValue(item, valueProp));
            return {
                name: name,
                value: Number.isNaN(val) ? 0 : val
            };
        }),
        R.sortBy([x => x.value, 'desc'])
    );

    const seriesItem: FunnelSeriesOption = {
        type: 'funnel',
        data: seriesData,
        label: {
            show: true,
            position: 'inside'
        }
    };

    const opt: EChartsOption = {
        series: [seriesItem],
        tooltip: {
            trigger: 'item',
            formatter: '{b} : {c}%'
        },
        ...(options?.legend ? {
            legend: {
                orient: 'vertical',
                left: 'left'
            }
        } : {})
    };

    return opt;
}
