import type { EChartsOption, BarSeriesOption } from 'echarts';
import * as R from 'remeda';
import type { BaseTransformerOptions, BasesData } from './base';
import { getLegendOption, getNestedValue, safeToString } from './utils';

export type WaterfallTransformerOptions = BaseTransformerOptions;

interface WaterfallDataPoint {
    readonly name: string;
    readonly value: number;
}

export function createWaterfallChartOption(
    data: BasesData,
    xProp: string,
    yProp: string,
    options?: WaterfallTransformerOptions
): EChartsOption {
    const xAxisLabel = options?.xAxisLabel ?? xProp;
    const yAxisLabel = options?.yAxisLabel ?? yProp;
    const xAxisRotate = options?.xAxisLabelRotate ?? 0;

    // 1. Extract and Validate Data
    const validData: readonly WaterfallDataPoint[] = R.pipe(
        data,
        (items) => items.map((item) => {
            const xVal = getNestedValue(item, xProp);
            const yVal = getNestedValue(item, yProp);

            if (xVal === null || xVal === undefined || yVal === null || yVal === undefined || yVal === '') {
                return null;
            }

            const name = safeToString(xVal);
            const val = Number(yVal);

            if (!name || Number.isNaN(val)) {
                return null;
            }

            return { name, value: val };
        }),
        R.filter((x): x is WaterfallDataPoint => x !== null)
    );

    // 2. Calculate Waterfall Steps
    // We need to track the cumulative sum to determine the 'base' (invisible), 'rise' (positive), and 'fall' (negative) components.
    // Using a reduce to maintain state (cumulative sum) in a functional way.

    interface Accumulator {
        readonly baseData: (number | string)[];
        readonly riseData: (number | string)[];
        readonly fallData: (number | string)[];
        readonly xData: string[];
        readonly currentSum: number;
    }

    const result: Accumulator = validData.reduce<Accumulator>((acc, point) => {
        const { value, name } = point;
        const prevSum = acc.currentSum;
        const nextSum = prevSum + value;

        let baseVal: number;
        let riseVal: number | string;
        let fallVal: number | string;

        if (value >= 0) {
            // Rising
            // Bar starts at prevSum, height is value.
            // Stack: Base (prevSum) + Rise (value)
            baseVal = prevSum;
            riseVal = value;
            fallVal = '-';
        } else {
            // Falling
            // Bar starts at nextSum (which is lower), height is abs(value).
            // Stack: Base (nextSum) + Fall (abs(value))
            // The visual top of the bar is prevSum.
            baseVal = nextSum;
            riseVal = '-';
            fallVal = Math.abs(value);
        }

        return {
            baseData: [...acc.baseData, baseVal],
            riseData: [...acc.riseData, riseVal],
            fallData: [...acc.fallData, fallVal],
            xData: [...acc.xData, name],
            currentSum: nextSum
        };
    }, {
        baseData: [],
        riseData: [],
        fallData: [],
        xData: [],
        currentSum: 0
    });

    const { baseData, riseData, fallData, xData } = result;

    // 3. Construct Series
    const series: BarSeriesOption[] = [
        {
            name: '_base',
            type: 'bar',
            stack: 'total',
            itemStyle: {
                borderColor: 'transparent',
                color: 'transparent'
            },
            emphasis: {
                itemStyle: {
                    borderColor: 'transparent',
                    color: 'transparent'
                }
            },
            data: baseData,
            tooltip: { show: false },
            silent: true
        },
        {
            name: 'Increase',
            type: 'bar',
            stack: 'total',
            label: {
                show: true,
                position: 'inside'
            },
            data: riseData,
            itemStyle: {
                color: '#14b143' // Western standard Green
            }
        },
        {
            name: 'Decrease',
            type: 'bar',
            stack: 'total',
            label: {
                show: true,
                position: 'inside'
            },
            data: fallData,
            itemStyle: {
                color: '#ef232a' // Western standard Red
            }
        }
    ];

    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: (params: any) => {
                // Custom tooltip to show the actual value, not the stack components
                // params is an array of series data for the axis
                // We want to find the non-null value from Increase or Decrease
                if (!Array.isArray(params)) return '';

                const name = params[0].name;
                let value = 0;
                let type = '';

                const riseParam = params.find((p: any) => p.seriesName === 'Increase');
                const fallParam = params.find((p: any) => p.seriesName === 'Decrease');

                if (riseParam && riseParam.value !== '-') {
                    value = Number(riseParam.value);
                    type = 'Increase';
                } else if (fallParam && fallParam.value !== '-') {
                    value = -Number(fallParam.value); // Show negative value for consistency with input? Or just magnitude? Usually magnitude + direction.
                    // If we want to show the original signed value:
                    type = 'Decrease';
                }

                // Let's format it simply
                const color = type === 'Increase' ? '#14b143' : '#ef232a';
                const displayValue = type === 'Decrease' ? -Math.abs(value) : value;

                return `${name}<br/>${type}: <span style="color:${color}">${displayValue}</span>`;
            }
        },
        legend: getLegendOption(options),
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xData,
            name: xAxisLabel,
            axisLabel: {
                rotate: xAxisRotate
            },
            splitLine: { show: false }
        },
        yAxis: {
            type: 'value',
            name: yAxisLabel
        },
        series: series
    };
}
