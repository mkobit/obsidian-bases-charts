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

// Map of chart types to their transformer functions
const transformerMap: Record<
    string,
    (data: Record<string, unknown>[], xProp: string, yProp: string, options: unknown) => EChartsOption
> = {
    pie: (data, xProp, yProp, options) => createPieChartOption(data, xProp, yProp, options as PieTransformerOptions),
    rose: (data, xProp, yProp, options) => createPieChartOption(data, xProp, yProp, { ...(options as PieTransformerOptions), roseType: 'area' }),
    funnel: (data, xProp, yProp, options) => createFunnelChartOption(data, xProp, yProp, options as BaseTransformerOptions),
    radar: (data, xProp, yProp, options) => createRadarChartOption(data, xProp, yProp, options as RadarTransformerOptions),
    gauge: (data, _, yProp, options) => createGaugeChartOption(data, yProp, options as GaugeTransformerOptions),
    bubble: (data, xProp, yProp, options) => createScatterChartOption(data, xProp, yProp, options as ScatterTransformerOptions),
    scatter: (data, xProp, yProp, options) => createScatterChartOption(data, xProp, yProp, options as ScatterTransformerOptions),
    heatmap: (data, xProp, yProp, options) => createHeatmapChartOption(data, xProp, yProp, options as HeatmapTransformerOptions),
    candlestick: (data, xProp, _, options) => createCandlestickChartOption(data, xProp, options as CandlestickTransformerOptions),
    treemap: (data, xProp, yProp, options) => createTreemapChartOption(data, xProp, yProp, options as TreemapTransformerOptions),
    boxplot: (data, xProp, yProp, options) => createBoxplotChartOption(data, xProp, yProp, options as BoxplotTransformerOptions),
    sankey: (data, xProp, yProp, options) => createSankeyChartOption(data, xProp, yProp, options as SankeyTransformerOptions),
    graph: (data, xProp, yProp, options) => createGraphChartOption(data, xProp, yProp, options as GraphTransformerOptions),
    sunburst: (data, xProp, _, options) => createSunburstChartOption(data, xProp, options as SunburstTransformerOptions),
    tree: (data, xProp, _, options) => createTreeChartOption(data, xProp, options as TreeTransformerOptions),
    themeRiver: (data, xProp, _, options) => createThemeRiverChartOption(data, xProp, options as ThemeRiverTransformerOptions),
    calendar: (data, xProp, _, options) => createCalendarChartOption(data, xProp, options as CalendarTransformerOptions),
    parallel: (data, xProp, _, options) => createParallelChartOption(data, xProp, options as ParallelTransformerOptions),
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
    const transformer = transformerMap[chartType];

    return transformer
        ? transformer(data, xProp, yProp, options)
        : createCartesianChartOption(data, xProp, yProp, chartType, options as CartesianTransformerOptions);
}

export {type ChartType, type BaseTransformerOptions} from './transformers/base';
export {type CartesianTransformerOptions} from './transformers/cartesian';
export {type PieTransformerOptions} from './transformers/pie';
export {type ScatterTransformerOptions} from './transformers/scatter';
export {type RadarTransformerOptions} from './transformers/radar';
export {type GaugeTransformerOptions} from './transformers/gauge';
export {type HeatmapTransformerOptions} from './transformers/heatmap';
export {type CandlestickTransformerOptions} from './transformers/candlestick';
export {type TreemapTransformerOptions} from './transformers/treemap';
export {type BoxplotTransformerOptions} from './transformers/boxplot';
export {type SankeyTransformerOptions} from './transformers/sankey';
export {type GraphTransformerOptions} from './transformers/graph';
export {type SunburstTransformerOptions, type TreeTransformerOptions} from './transformers/hierarchy';
export {type ThemeRiverTransformerOptions} from './transformers/theme-river';
export {type CalendarTransformerOptions} from './transformers/calendar';
export {type ParallelTransformerOptions} from './transformers/parallel';
