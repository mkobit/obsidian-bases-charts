import type { EChartsOption, FunnelSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './types';
import { safeToString, getNestedValue } from './utils';

export function createFunnelChartOption(
    data: Record<string, unknown>[],
    nameProp: string,
    valueProp: string,
    options?: BaseTransformerOptions
): EChartsOption {
    const seriesData = data.map(item => {
        const valRaw = getNestedValue(item, nameProp);
        const name = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);

        const val = Number(getNestedValue(item, valueProp));
        return {
            name: name,
            value: isNaN(val) ? 0 : val
        };
    });

    // Sort data for funnel (usually expected to be sorted, but ECharts can handle it)
    seriesData.sort((a, b) => b.value - a.value);

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
            formatter: '{b} : {c}%' // Assuming value is percentage or just raw count
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
