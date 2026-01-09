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
    createEffectScatterChartOption,
    EffectScatterTransformerOptions
} from './transformers/effect-scatter';
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
import {
    createLinesChartOption,
    LinesTransformerOptions
} from './transformers/lines';
import { ChartType, BasesData } from './transformers/base';

export type ChartTransformerOptions =
    | CartesianTransformerOptions
    | LinesTransformerOptions
    | PieTransformerOptions
    | ScatterTransformerOptions
    | EffectScatterTransformerOptions
    | RadarTransformerOptions
    | GaugeTransformerOptions
    | HeatmapTransformerOptions
    | CandlestickTransformerOptions
    | TreemapTransformerOptions
    | BoxplotTransformerOptions
    | SankeyTransformerOptions
    | GraphTransformerOptions
    | SunburstTransformerOptions
    | ThemeRiverTransformerOptions
    | CalendarTransformerOptions
    | ParallelTransformerOptions;

// Helper to cast options
function asOptions<T>(options: unknown): T {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return options as any;
}

// Map of chart types to their transformer functions
const transformerMap: Record<
    string,
    (data: BasesData, xProp: string, yProp: string, options: unknown) => EChartsOption
> = {
    bar: (data, xProp, yProp, options) => createCartesianChartOption(data, xProp, yProp, 'bar', asOptions(options)),
    line: (data, xProp, yProp, options) => createCartesianChartOption(data, xProp, yProp, 'line', asOptions(options)),
    lines: (data, xProp, yProp, options) => createLinesChartOption(data, xProp, yProp, asOptions(options)),
    pie: (data, xProp, yProp, options) => createPieChartOption(data, xProp, yProp, asOptions(options)),
    rose: (data, xProp, yProp, options) => createPieChartOption(data, xProp, yProp, { ...(asOptions<PieTransformerOptions>(options)), roseType: 'area' }),
    funnel: (data, xProp, yProp, options) => createFunnelChartOption(data, xProp, yProp, asOptions(options)),
    radar: (data, xProp, yProp, options) => createRadarChartOption(data, xProp, yProp, asOptions(options)),
    gauge: (data, _, yProp, options) => createGaugeChartOption(data, yProp, asOptions(options)),
    bubble: (data, xProp, yProp, options) => createScatterChartOption(data, xProp, yProp, asOptions(options)),
    scatter: (data, xProp, yProp, options) => createScatterChartOption(data, xProp, yProp, asOptions(options)),
    effectScatter: (data, xProp, yProp, options) => createEffectScatterChartOption(data, xProp, yProp, asOptions(options)),
    heatmap: (data, xProp, yProp, options) => createHeatmapChartOption(data, xProp, yProp, asOptions(options)),
    candlestick: (data, xProp, _, options) => createCandlestickChartOption(data, xProp, asOptions(options)),
    treemap: (data, xProp, yProp, options) => createTreemapChartOption(data, xProp, yProp, asOptions(options)),
    boxplot: (data, xProp, yProp, options) => createBoxplotChartOption(data, xProp, yProp, asOptions(options)),
    sankey: (data, xProp, yProp, options) => createSankeyChartOption(data, xProp, yProp, asOptions(options)),
    graph: (data, xProp, yProp, options) => createGraphChartOption(data, xProp, yProp, asOptions(options)),
    sunburst: (data, xProp, _, options) => createSunburstChartOption(data, xProp, asOptions(options)),
    tree: (data, xProp, _, options) => createTreeChartOption(data, xProp, asOptions(options)),
    themeRiver: (data, xProp, _, options) => createThemeRiverChartOption(data, xProp, asOptions(options)),
    calendar: (data, xProp, _, options) => createCalendarChartOption(data, xProp, asOptions(options)),
    parallel: (data, xProp, _, options) => createParallelChartOption(data, xProp, asOptions(options)),
};

/**
 * Transforms Bases data into an ECharts option object.
 */
export function transformDataToChartOption(
    data: BasesData,
    xProp: string,
    yProp: string,
    chartType: ChartType = 'bar',
    options?: ChartTransformerOptions
): EChartsOption {
    const transformer = transformerMap[chartType];

    return transformer
        ? transformer(data, xProp, yProp, options)
        : createCartesianChartOption(data, xProp, yProp, 'bar', asOptions(options));
}

export {type ChartType, type BaseTransformerOptions, type BasesData} from './transformers/base';
export {type CartesianTransformerOptions} from './transformers/cartesian';
export {type LinesTransformerOptions} from './transformers/lines';
export {type PieTransformerOptions} from './transformers/pie';
export {type ScatterTransformerOptions} from './transformers/scatter';
export {type EffectScatterTransformerOptions} from './transformers/effect-scatter';
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
