import type { EChartsOption, PieSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';
import * as R from 'remeda';

export interface PieTransformerOptions extends BaseTransformerOptions {
    roseType?: 'radius' | 'area';
}

export function createPieChartOption(
    data: Record<string, unknown>[],
    nameProp: string,
    valueProp: string,
    options?: PieTransformerOptions
): EChartsOption {
    const seriesData = R.map(data, item => {
        const valRaw = getNestedValue(item, nameProp);
        const name = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);

        const val = Number(getNestedValue(item, valueProp));
        return {
            name: name,
            value: isNaN(val) ? 0 : val
        };
    });

    const seriesItem: PieSeriesOption = {
        type: 'pie',
        data: seriesData,
        radius: options?.roseType ? [20, '75%'] : '50%',
        ...(options?.roseType ? { roseType: options.roseType } : {}),
        emphasis: {
            itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        }
    };

    const opt: EChartsOption = {
        series: [seriesItem],
        tooltip: {
            trigger: 'item'
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
