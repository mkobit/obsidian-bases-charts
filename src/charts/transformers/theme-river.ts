import type { EChartsOption, ThemeRiverSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

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
    const riverData = data.reduce<(string | number)[][]>((acc, item) => {
        const dateRaw = getNestedValue(item, dateProp);
        const dateVal = safeToString(dateRaw);

        if (!dateVal) return acc;

        let val = 0;
        if (valueProp) {
            const v = Number(getNestedValue(item, valueProp));
            if (!isNaN(v)) val = v;
        }

        let theme = 'Series 1';
        if (themeProp) {
            const tRaw = getNestedValue(item, themeProp);
            if (tRaw !== undefined && tRaw !== null) theme = safeToString(tRaw);
        }

        acc.push([dateVal, val, theme]);
        return acc;
    }, []);

    // ThemeRiver requires data to be sorted by date? ECharts usually handles it,
    // but best to sort.
    // Simple string sort for ISO dates works.
    riverData.sort((a, b) => {
        const da = a[0] as string;
        const db = b[0] as string;
        return da.localeCompare(db);
    });

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
        legend: options?.legend ? {} : undefined
    };
}
