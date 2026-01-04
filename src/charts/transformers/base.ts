export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'bubble' | 'radar' | 'funnel' | 'gauge' | 'heatmap' | 'candlestick' | 'treemap' | 'boxplot' | 'sankey' | 'graph' | 'sunburst' | 'tree' | 'themeRiver' | 'calendar' | 'parallel' | 'rose';

export interface BaseTransformerOptions {
    legend?: boolean;
}

export interface AxisOptions {
    xAxisLabel?: string;
    yAxisLabel?: string;
    /**
     * Rotation of the X-axis label in degrees.
     * e.g. 45 for 45-degree rotation.
     */
    xAxisLabelRotate?: number;
    flipAxis?: boolean;
}
