import type { EChartsOption, ThemeRiverSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue, getLegendOption } from './utils';
import * as R from 'remeda';

export interface ThemeRiverTransformerOptions extends BaseTransformerOptions {
    readonly valueProp?: string;
    readonly themeProp?: string;
}

// Define the tuple type explicitly to match usage
// ECharts ThemeRiver expects [date, value, id]
type ThemeRiverItem = readonly [string, number, string];

export function createThemeRiverChartOption(
    data: readonly Record<string, unknown>[],
    dateProp: string,
    options?: ThemeRiverTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;
    const themeProp = options?.themeProp;

    // Data format: [date, value, themeName]
    const riverData = R.pipe(
        data,
        R.map(item => {
            const dateRaw = getNestedValue(item, dateProp);
            const dateVal = safeToString(dateRaw);

            return !dateVal
                ? null
                : (() => {
                    const valNum = valueProp ? Number(getNestedValue(item, valueProp)) : Number.NaN;
                    const val = Number.isNaN(valNum) ? 0 : valNum;

                    const tRaw = themeProp ? getNestedValue(item, themeProp) : undefined;
                    const theme = (tRaw !== undefined && tRaw !== null) ? safeToString(tRaw) : 'Series 1';

                    // Explicitly type the tuple
                    const res: ThemeRiverItem = [dateVal, val, theme];
                    return res;
                })();
        }),
        R.filter((x): x is ThemeRiverItem => x !== null),
        R.sortBy(x => x[0])
    );

    const seriesItem: ThemeRiverSeriesOption = {
        type: 'themeRiver',
        // Pass the properly typed data
        // Cast to `any` required: internal types are `ReadonlyDeep` (per lint rule) but ECharts types require mutable arrays.
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
        data: riverData as any,
        emphasis: {
            itemStyle: {
                shadowBlur: 20,
                shadowColor: 'rgba(0, 0, 0, 0.8)'
            }
        }
    };

    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: 'rgba(0,0,0,0.2)',
                    width: 1,
                    type: 'solid'
                }
            }
        },
        singleAxis: {
            type: 'time',
            boundaryGap: [0, 0]
        },
        series: [seriesItem],
        ...(getLegendOption(options) ? { legend: getLegendOption(options) } : {})
    };
}
