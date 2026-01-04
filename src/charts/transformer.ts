import type { EChartsOption } from 'echarts';

import {
    createPieChartOption,
    PieTransformerOptions
} from './transformers/pie';
import {
    createFunnelChartOption
} from './transformers/funnel';
import {
    createRadarChartOption,
    RadarTransformerOptions
} from './transformers/radar';
import {
    createGaugeChartOption,
    GaugeTransformerOptions
} from './transformers/gauge';
import {
    createScatterChartOption,
    ScatterTransformerOptions
} from './transformers/scatter';
import {
    createHeatmapChartOption,
    HeatmapTransformerOptions
} from './transformers/heatmap';
import {
    createCandlestickChartOption,
    CandlestickTransformerOptions
} from './transformers/candlestick';
import {
    createTreemapChartOption,
    TreemapTransformerOptions
} from './transformers/treemap';
import {
    createBoxplotChartOption,
    BoxplotTransformerOptions
} from './transformers/boxplot';
import {
    createSankeyChartOption,
    SankeyTransformerOptions
} from './transformers/sankey';
import {
    createGraphChartOption,
    GraphTransformerOptions
} from './transformers/graph';
import {
    createSunburstChartOption,
    createTreeChartOption,
    SunburstTransformerOptions,
    TreeTransformerOptions
} from './transformers/hierarchy';
import {
    createThemeRiverChartOption,
    ThemeRiverTransformerOptions
} from './transformers/theme-river';
import {
    createCalendarChartOption,
    CalendarTransformerOptions
} from './transformers/calendar';
import {
    createParallelChartOption,
    ParallelTransformerOptions
} from './transformers/parallel';
import {
    createCartesianChartOption,
    CartesianTransformerOptions
} from './transformers/cartesian';
import { BaseTransformerOptions, ChartType } from './transformers/base';

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
    | CalendarTransformerOptions
    | ParallelTransformerOptions;

// Re-export specific types for consumers who need them
export type {
    ChartType,
    BaseTransformerOptions,
    CartesianTransformerOptions,
    PieTransformerOptions,
    ScatterTransformerOptions,
    RadarTransformerOptions,
    GaugeTransformerOptions,
    HeatmapTransformerOptions,
    CandlestickTransformerOptions,
    TreemapTransformerOptions,
    BoxplotTransformerOptions,
    SankeyTransformerOptions,
    GraphTransformerOptions,
    SunburstTransformerOptions,
    TreeTransformerOptions,
    ThemeRiverTransformerOptions,
    CalendarTransformerOptions,
    ParallelTransformerOptions
};

/**
 * Transforms Bases data into an ECharts option object.
 */
export function transformDataToChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    chartType: ChartType = 'bar',
    options?: ChartTransformerOptions
): EChartsOption {
    switch (chartType) {
        case 'pie':
            return createPieChartOption(data, xProp, yProp, options as PieTransformerOptions);
        case 'rose':
            return createPieChartOption(data, xProp, yProp, {
                ...(options as PieTransformerOptions),
                roseType: 'area'
            });
        case 'funnel':
            return createFunnelChartOption(data, xProp, yProp, options as BaseTransformerOptions);
        case 'radar':
            return createRadarChartOption(data, xProp, yProp, options as RadarTransformerOptions);
        case 'gauge':
            return createGaugeChartOption(data, yProp, options as GaugeTransformerOptions);
        case 'bubble':
            return createScatterChartOption(data, xProp, yProp, options as ScatterTransformerOptions);
        case 'scatter':
            return createScatterChartOption(data, xProp, yProp, options as ScatterTransformerOptions);
        case 'heatmap':
            return createHeatmapChartOption(data, xProp, yProp, options as HeatmapTransformerOptions);
        case 'candlestick':
            return createCandlestickChartOption(data, xProp, options as CandlestickTransformerOptions);
        case 'treemap':
            return createTreemapChartOption(data, xProp, yProp, options as TreemapTransformerOptions);
        case 'boxplot':
            return createBoxplotChartOption(data, xProp, yProp, options as BoxplotTransformerOptions);
        case 'sankey':
            return createSankeyChartOption(data, xProp, yProp, options as SankeyTransformerOptions);
        case 'graph':
            return createGraphChartOption(data, xProp, yProp, options as GraphTransformerOptions);
        case 'sunburst':
            return createSunburstChartOption(data, xProp, options as SunburstTransformerOptions);
        case 'tree':
            return createTreeChartOption(data, xProp, options as TreeTransformerOptions);
        case 'themeRiver':
            return createThemeRiverChartOption(data, xProp, options as ThemeRiverTransformerOptions);
        case 'calendar':
            return createCalendarChartOption(data, xProp, options as CalendarTransformerOptions);
        case 'parallel':
            return createParallelChartOption(data, xProp, options as ParallelTransformerOptions);
        case 'bar':
        case 'line':
        default:
            return createCartesianChartOption(data, xProp, yProp, chartType, options as CartesianTransformerOptions);
    }
}
