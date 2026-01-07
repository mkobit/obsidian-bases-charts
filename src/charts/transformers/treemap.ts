import type { EChartsOption, TreemapSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export type TreemapTransformerOptions = BaseTransformerOptions;

export function createTreemapChartOption(
    data: readonly Record<string, unknown>[],
    nameProp: string,
    valueProp: string,
    options?: TreemapTransformerOptions
): EChartsOption {
    const seriesData = data.map(item => {
        const valRaw = getNestedValue(item, nameProp);
        const name = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);

        const val = Number(getNestedValue(item, valueProp));
        return {
            name: name,
            value: Number.isNaN(val) ? 0 : val
        };
    });

    // Treemaps often benefit from sorting, but ECharts handles layout.
    // We filter out zero or negative values as treemap area must be positive usually,
    // though 0 might just be invisible.
    const validData = seriesData.filter(d => d.value > 0);

    const seriesItem: TreemapSeriesOption = {
        type: 'treemap',
        data: validData,
        roam: false, // Zoom/pan
        label: {
            show: true,
            formatter: '{b}'
        },
        itemStyle: {
            borderColor: '#fff'
        }
    };

    const opt: EChartsOption = {
        series: [seriesItem],
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}'
        }
    };

    // Use side-effect free logic for legend check (though modifying opt implicitly)
    // Actually we can just spread it.
    return options?.legend
        ? { ...opt } // Placeholder if we implemented legend logic
        : opt;
}
