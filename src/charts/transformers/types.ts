import type { EChartsOption } from 'echarts';

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'bubble' | 'radar' | 'funnel' | 'gauge' | 'heatmap' | 'candlestick' | 'treemap' | 'boxplot' | 'sankey' | 'graph' | 'sunburst' | 'tree' | 'themeRiver' | 'calendar';

export interface BaseTransformerOptions {
    legend?: boolean;
}

export interface CartesianTransformerOptions extends BaseTransformerOptions {
    smooth?: boolean;
    showSymbol?: boolean;
    areaStyle?: boolean;
    stack?: boolean;
    seriesProp?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PieTransformerOptions extends BaseTransformerOptions {
    // Pie specific options if any
}

export interface ScatterTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;
    sizeProp?: string;
}

export interface RadarTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;
}

export interface GaugeTransformerOptions extends BaseTransformerOptions {
    min?: number;
    max?: number;
}

export interface HeatmapTransformerOptions extends BaseTransformerOptions {
    valueProp?: string;
}

export interface CandlestickTransformerOptions extends BaseTransformerOptions {
    openProp?: string;
    closeProp?: string;
    lowProp?: string;
    highProp?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TreemapTransformerOptions extends BaseTransformerOptions {
    // Treemap specific options if any
}

export interface BoxplotTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;
}

export interface SankeyTransformerOptions extends BaseTransformerOptions {
    valueProp?: string;
}

export interface GraphTransformerOptions extends BaseTransformerOptions {
    valueProp?: string; // For edge weight
    categoryProp?: string; // For node category
}

export interface SunburstTransformerOptions extends BaseTransformerOptions {
    valueProp?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TreeTransformerOptions extends BaseTransformerOptions {
    // Tree specific options if any
}

export interface ThemeRiverTransformerOptions extends BaseTransformerOptions {
    valueProp?: string;
    themeProp?: string;
}

export interface CalendarTransformerOptions extends BaseTransformerOptions {
    valueProp?: string;
}

export type ChartTransformerOptions =
    | CartesianTransformerOptions
    | PieTransformerOptions
    | ScatterTransformerOptions
    | RadarTransformerOptions
    | GaugeTransformerOptions
    | HeatmapTransformerOptions
    | CandlestickTransformerOptions
    | TreemapTransformerOptions
    | BoxplotTransformerOptions
    | SankeyTransformerOptions
    | GraphTransformerOptions
    | SunburstTransformerOptions
    | TreeTransformerOptions
    | ThemeRiverTransformerOptions
    | CalendarTransformerOptions;

export type ChartTransformer = (
    data: Record<string, unknown>[],
    xProp: string,
    yProp?: string,
    options?: ChartTransformerOptions
) => EChartsOption;
