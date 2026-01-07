export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'bubble' | 'radar' | 'funnel' | 'gauge' | 'heatmap' | 'candlestick' | 'treemap' | 'boxplot' | 'sankey' | 'graph' | 'sunburst' | 'tree' | 'themeRiver' | 'calendar' | 'parallel' | 'rose';

export interface VisualMapOptions {
    visualMapMin?: number;
    visualMapMax?: number;
    visualMapColor?: string[];
    visualMapOrient?: 'horizontal' | 'vertical';
    visualMapType?: 'continuous' | 'piecewise';
    visualMapLeft?: string | number;
    visualMapTop?: string | number;
}

export interface BaseTransformerOptions extends VisualMapOptions {
    legend?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
    xAxisLabelRotate?: number;
    flipAxis?: boolean;
}
