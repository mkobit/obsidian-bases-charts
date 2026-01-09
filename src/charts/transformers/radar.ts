import type { EChartsOption, SeriesOption, DatasetComponentOption } from 'echarts';
import type { BasesData, BaseTransformerOptions } from './base';
import { getLegendOption } from './utils';

export interface RadarTransformerOptions extends BaseTransformerOptions {
    readonly indicatorProp?: string; // Defines the indicators (axes)
    // If not provided, we might infer?
    // Usually radar needs: indicator: [{ name, max }]
    // And series data: [{ value: [v1, v2, ...], name: 'Series 1' }]
}

export function createRadarChartOption(
    data: BasesData,
    xProp: string, // Category (Indicator)
    yProp: string, // Value
    options?: RadarTransformerOptions
): EChartsOption {
    // For Radar, we typically want to compare multiple entities across fixed dimensions (indicators).
    // Or one entity across multiple dimensions.

    // Simplest assumption based on typical Obsidian use:
    // xProp is the "Feature" (Indicator)
    // yProp is the "Value"
    // We assume single series if not grouped? Or multiple rows = 1 polygon?

    // Usually:
    // Row 1: { Feature: 'Speed', Value: 10 }
    // Row 2: { Feature: 'Power', Value: 8 }
    // ...
    // This forms ONE polygon.

    // If we have grouping, we have multiple polygons.

    // Let's implement single polygon for now, or multiple if we group?
    // ECharts Radar expects `indicator` config in `radar` component.

    const indicators = data.map(item => ({ name: String(item[xProp]) }));
    const values = data.map(item => Number(item[yProp]));

    // Deduplicate indicators if we are grouping?
    // If simple table:
    // Speed, 10
    // Power, 20
    // This is one series.

    const radar = {
        indicator: indicators
    };

    const series: SeriesOption = {
        type: 'radar',
        data: [
            {
                value: values,
                name: 'Data'
            }
        ]
    };

    return {
        radar,
        series: [series],
        legend: getLegendOption(options?.legend, options?.legendPosition, options?.legendOrient),
        tooltip: { trigger: 'item' }
    };
}
