import type { EChartsOption } from 'echarts';
import type {
    ChartType,
    ChartTransformerOptions,
    CartesianTransformerOptions,
    RadarTransformerOptions,
    GaugeTransformerOptions,
    ScatterTransformerOptions,
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
    PieTransformerOptions
} from './transformers/types';

import { createPieChartOption } from './transformers/pie';
import { createFunnelChartOption } from './transformers/funnel';
import { createRadarChartOption } from './transformers/radar';
import { createGaugeChartOption } from './transformers/gauge';
import { createScatterChartOption } from './transformers/scatter';
import { createHeatmapChartOption } from './transformers/heatmap';
import { createCandlestickChartOption } from './transformers/candlestick';
import { createTreemapChartOption } from './transformers/treemap';
import { createBoxplotChartOption } from './transformers/boxplot';
import { createSankeyChartOption } from './transformers/sankey';
import { createGraphChartOption } from './transformers/graph';
import { createSunburstChartOption, createTreeChartOption } from './transformers/hierarchy';
import { createThemeRiverChartOption } from './transformers/theme-river';
import { createCalendarChartOption } from './transformers/calendar';
import { createCartesianChartOption } from './transformers/cartesian';

export * from './transformers/types'; // Export all types for consumers

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
        case 'funnel':
            return createFunnelChartOption(data, xProp, yProp, options);
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
        case 'bar':
        case 'line':
        default:
            return createCartesianChartOption(data, xProp, yProp, chartType, options as CartesianTransformerOptions);
    }
}
