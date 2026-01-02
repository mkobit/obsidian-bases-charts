import type { EChartsOption, ThemeRiverSeriesOption } from 'echarts';
import type { ThemeRiverTransformerOptions } from './types';
import { safeToString, getNestedValue } from './utils';

export function createThemeRiverChartOption(
    data: Record<string, unknown>[],
    dateProp: string,
    options?: ThemeRiverTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;
    const themeProp = options?.themeProp;

    // Data format: [date, value, themeName]
    const riverData: (string | number)[][] = [];

    data.forEach(item => {
        const dateRaw = getNestedValue(item, dateProp);
        const dateVal = safeToString(dateRaw);

        if (!dateVal) return;

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

        riverData.push([dateVal, val, theme]);
    });

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
