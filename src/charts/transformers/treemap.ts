import type { EChartsOption, SeriesOption, DatasetComponentOption } from 'echarts';
import type { BasesData, BaseTransformerOptions } from './base';

export interface TreemapTransformerOptions extends BaseTransformerOptions {
    // Treemap usually just needs value. Hierarchical structure is handled by data.
}

export function createTreemapChartOption(
    data: BasesData,
    xProp: string, // Name
    yProp: string, // Value
    options?: TreemapTransformerOptions
): EChartsOption {
    // Treemap expects [{name, value, children: ...}]
    // If data is flat: [{name: 'A', value: 10}, {name: 'B', value: 20}]
    // This creates a flat treemap (one level).

    // We should filter out non-positive values as per memory.

    // ECharts Dataset for Treemap is supported?
    // Docs say Treemap generally uses `data` property. Dataset support is limited or requires specific structure.
    // But let's try mapping.

    // We can map the flat data to the `data` property manually to be safe and handle filtering.

    const seriesData = data
        .map(item => ({
            name: String(item[xProp] || ''),
            value: Number(item[yProp] || 0)
        }))
        .filter(item => item.value > 0);

    const series: SeriesOption = {
        type: 'treemap',
        data: seriesData,
        visibleMin: 300,
        label: {
            show: true,
            formatter: '{b}'
        },
        itemStyle: {
            borderColor: '#fff'
        },
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false }
    };

    return {
        series: [series],
        tooltip: { formatter: '{b}: {c}' }
    };
}
