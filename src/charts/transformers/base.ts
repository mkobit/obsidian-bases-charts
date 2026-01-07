export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'bubble' | 'radar' | 'funnel' | 'gauge' | 'heatmap' | 'candlestick' | 'treemap' | 'boxplot' | 'sankey' | 'graph' | 'sunburst' | 'tree' | 'themeRiver' | 'calendar' | 'parallel' | 'rose';

export interface BaseTransformerOptions {
    legend?: boolean;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';
    legendOrient?: 'horizontal' | 'vertical';
    xAxisLabel?: string;
    yAxisLabel?: string;
    xAxisLabelRotate?: number;
    flipAxis?: boolean;
}
