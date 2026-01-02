import type { EChartsOption, GaugeSeriesOption } from 'echarts';
import type { GaugeTransformerOptions } from './types';
import { getNestedValue } from './utils';

export function createGaugeChartOption(
    data: Record<string, unknown>[],
    valueProp: string,
    options?: GaugeTransformerOptions
): EChartsOption {
    // Sum all values
    let total = 0;
    data.forEach(item => {
        const val = Number(getNestedValue(item, valueProp));
        if (!isNaN(val)) {
            total += val;
        }
    });

    const min = options?.min ?? 0;
    const max = options?.max ?? 100;

    const seriesItem: GaugeSeriesOption = {
        type: 'gauge',
        min: min,
        max: max,
        progress: {
            show: true
        },
        detail: {
            valueAnimation: true,
            formatter: '{value}'
        },
        data: [
            {
                value: total,
                name: valueProp
            }
        ]
    };

    return {
        series: [seriesItem],
        tooltip: {
            formatter: '{a} <br/>{b} : {c}'
        }
    };
}
