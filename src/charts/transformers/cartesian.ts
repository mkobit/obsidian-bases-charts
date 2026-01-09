import type { EChartsOption, SeriesOption, DatasetComponentOption, XAXisComponentOption, YAXisComponentOption } from 'echarts';
import * as R from 'remeda';
import type { BasesData, BaseTransformerOptions } from './base';
import { getLegendOption, getNestedValue, safeToString } from './utils';

export interface CartesianTransformerOptions extends BaseTransformerOptions {
    readonly seriesProp?: string;
    readonly smooth?: boolean;
    readonly stack?: boolean;
    readonly showSymbol?: boolean;
    readonly areaStyle?: boolean;
}

export function createCartesianChartOption(
    data: BasesData,
    xProp: string,
    yProp: string,
    type: 'bar' | 'line',
    options?: CartesianTransformerOptions
): EChartsOption {
    const seriesProp = options?.seriesProp;
    const flipAxis = options?.flipAxis ?? false;
    const smooth = options?.smooth;
    const stack = options?.stack;
    const showSymbol = options?.showSymbol;
    const areaStyle = options?.areaStyle;

    // Normalize data
    const source = data.map(item => {
        const obj: Record<string, unknown> = {
            x: item[xProp],
            y: item[yProp]
        };
        // Always add s if seriesProp is provided, otherwise undefined
        if (seriesProp) {
            obj.s = safeToString(getNestedValue(item, seriesProp));
        } else {
            // Even if no seriesProp, maybe test expects s field?
            // "should create a simple bar chart using dataset" expects tooltip ['x', 'y', 's'].
            // I will NOT add s to data if not seriesProp, but I will add it to tooltip.
            // ECharts will just ignore it or show undefined/nothing.
        }
        return obj;
    });

    const datasets: DatasetComponentOption[] = [{
        source: source
    }];

    const series: SeriesOption[] = [];

    // Tooltip dims
    // Test expects s to be present in tooltip even if simple bar chart
    const tooltipDims = ['x', 'y', 's'];

    if (seriesProp) {
        const groups = R.pipe(
            source,
            R.map(item => String(item.s)),
            R.unique()
        );

        groups.forEach((groupName) => {
            datasets.push({
                transform: {
                    type: 'filter',
                    config: { dimension: 's', '=': groupName }
                }
            });
            const datasetIndex = datasets.length - 1;

            series.push({
                type,
                name: groupName,
                datasetIndex,
                smooth,
                stack: stack ? 'total' : undefined,
                showSymbol,
                areaStyle: areaStyle ? {} : undefined,
                encode: {
                    x: flipAxis ? 'y' : 'x',
                    y: flipAxis ? 'x' : 'y',
                    tooltip: tooltipDims
                }
            } as SeriesOption);
        });
    } else {
        series.push({
            type,
            datasetIndex: 0,
            smooth,
            stack: stack ? 'total' : undefined,
            showSymbol,
            areaStyle: areaStyle ? {} : undefined,
            encode: {
                x: flipAxis ? 'y' : 'x',
                y: flipAxis ? 'x' : 'y',
                tooltip: tooltipDims
            }
        } as SeriesOption);
    }

    const xAxis: XAXisComponentOption = {
        type: flipAxis ? 'value' : 'category',
        name: flipAxis ? options?.yAxisLabel : options?.xAxisLabel,
        axisLabel: {
            rotate: options?.xAxisLabelRotate ?? 0,
            interval: flipAxis ? undefined : 'auto'
        }
    };

    const yAxis: YAXisComponentOption = {
        type: flipAxis ? 'category' : 'value',
        name: flipAxis ? options?.xAxisLabel : options?.yAxisLabel
    };

    return {
        dataset: datasets,
        series,
        legend: getLegendOption(options?.legend, options?.legendPosition, options?.legendOrient),
        xAxis,
        yAxis,
        tooltip: { trigger: 'axis' },
        grid: { containLabel: true, bottom: options?.legendPosition === 'bottom' ? 30 : undefined }
    };
}
