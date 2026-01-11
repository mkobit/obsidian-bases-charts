import type { EChartsOption } from 'echarts';
import type { BaseTransformerOptions, BasesData } from './base';
import { safeToString, getNestedValue, getLegendOption } from './utils';
import * as R from 'remeda';

export type ParetoTransformerOptions = BaseTransformerOptions;

export function createParetoChartOption(
    data: BasesData,
    xProp: string,
    yProp: string,
    options?: ParetoTransformerOptions
): EChartsOption {
    const xAxisLabel = options?.xAxisLabel ?? xProp;
    const yAxisLabel = options?.yAxisLabel ?? yProp;
    const xAxisRotate = options?.xAxisLabelRotate ?? 0;

    // 1. Normalize and Sort Data
    const normalizedData = R.pipe(
        data,
        R.map((item) => ({
            name: safeToString(getNestedValue(item, xProp)),
            value: Number(getNestedValue(item, yProp))
        })),
        // Filter out invalid values
        R.filter(item => !Number.isNaN(item.value)),
        // Sort descending by value
        R.sortBy([(item) => item.value, 'desc'])
    );

    // 2. Calculate Total for Cumulative Percentage
    const totalValue = R.sumBy(normalizedData, item => item.value);

    // 3. Calculate Cumulative Percentage
    // Using reduce to build the final dataset with cumulative values
    const finalData = R.pipe(
        normalizedData,
        R.reduce((acc, item) => {
            const currentSum = acc.sum + item.value;
            const cumulativePercentage = totalValue === 0 ? 0 : (currentSum / totalValue) * 100;
            return {
                sum: currentSum,
                result: [...acc.result, {
                    name: item.name,
                    value: item.value,
                    cumulative: cumulativePercentage
                }]
            };
        }, { sum: 0, result: [] as Array<{ name: string, value: number, cumulative: number }> }),
        x => x.result
    );

    // 4. Construct ECharts Option
    const chartOption: EChartsOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        grid: {
            containLabel: true
        },
        xAxis: {
            type: 'category',
            name: xAxisLabel,
            axisLabel: {
                interval: 0,
                rotate: xAxisRotate
            }
        },
        yAxis: [
            {
                type: 'value',
                name: yAxisLabel,
                position: 'left',
                alignTicks: true,
                axisLine: {
                    show: true,
                },
                axisLabel: {
                    formatter: '{value}'
                }
            },
            {
                type: 'value',
                name: 'Cumulative %',
                min: 0,
                max: 100,
                position: 'right',
                alignTicks: true,
                axisLine: {
                    show: true,
                },
                axisLabel: {
                    formatter: '{value} %'
                }
            }
        ],
        dataset: {
            source: finalData
        },
        series: [
            {
                name: yAxisLabel,
                type: 'bar',
                yAxisIndex: 0, // Left Axis
                encode: { x: 'name', y: 'value' }
            },
            {
                name: 'Cumulative %',
                type: 'line',
                yAxisIndex: 1, // Right Axis
                symbol: 'circle',
                symbolSize: 6,
                encode: { x: 'name', y: 'cumulative' },
                tooltip: {
                    valueFormatter: (value: number | string) => Number(value).toFixed(1) + ' %'
                }
            }
        ],
        ...(getLegendOption(options) ? { legend: getLegendOption(options) } : {})
    };

    return chartOption;
}
