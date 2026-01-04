import type { EChartsOption, ThemeRiverSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';
import * as R from 'remeda';

export interface ThemeRiverTransformerOptions extends BaseTransformerOptions {
    valueProp?: string;
    themeProp?: string;
}

export function createThemeRiverChartOption(
    data: Record<string, unknown>[],
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

            if (!dateVal) return null;

            const valNum = valueProp ? Number(getNestedValue(item, valueProp)) : NaN;
            const val = !isNaN(valNum) ? valNum : 0;

            const tRaw = themeProp ? getNestedValue(item, themeProp) : undefined;
            const theme = (tRaw !== undefined && tRaw !== null) ? safeToString(tRaw) : 'Series 1';

            return [dateVal, val, theme] as (string | number)[];
        }),
        R.filter((x): x is (string | number)[] => x !== null),
        R.sortBy(x => x[0] as string)
    );

    const seriesItem: ThemeRiverSeriesOption = {
        type: 'themeRiver',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
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
        ...(options?.legend ? { legend: {} } : {})
    };
}
