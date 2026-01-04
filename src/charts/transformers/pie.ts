import type { EChartsOption, PieSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface PieTransformerOptions extends BaseTransformerOptions {
    roseType?: 'radius' | 'area';
}

export function createPieChartOption(
    data: Record<string, unknown>[],
    nameProp: string,
    valueProp: string,
    options?: PieTransformerOptions
): EChartsOption {
    // Transform complex object array to simple array for dataset
    const datasetSource = data.map(item => {
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
        // Use encode to map dimensions
        encode: {
            itemName: 'name',
            value: 'value'
        },
        radius: options?.roseType ? [20, '75%'] : '50%',
        roseType: options?.roseType,
        emphasis: {
            itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        }
    };

    const opt: EChartsOption = {
        dataset: {
            source: datasetSource
        },
        series: [seriesItem],
        tooltip: {
            trigger: 'item'
        }
    };

    if (options?.legend) {
        opt.legend = {
            orient: 'vertical',
            left: 'left'
        };
    }

    return opt;
}
