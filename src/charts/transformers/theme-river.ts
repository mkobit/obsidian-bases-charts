import type { EChartsOption, SeriesOption } from 'echarts';
import type { BasesData, BaseTransformerOptions } from './base';
import { getLegendOption } from './utils';

export interface ThemeRiverTransformerOptions extends BaseTransformerOptions {
    readonly seriesProp?: string; // Theme/Category
    readonly valueProp?: string;
    readonly themeProp?: string; // Alias for seriesProp in view
}

export function createThemeRiverChartOption(
    data: BasesData,
    dateProp: string, // X-Axis (Date)
    options?: ThemeRiverTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp || 'value';
    const seriesProp = options?.themeProp || options?.seriesProp; // Theme

    const riverData: [string, number, string][] = data.map(item => [
        String(item[dateProp]),
        Number(item[valueProp] || 1),
        String(seriesProp ? item[seriesProp] : 'Default')
    ]);

    const series: SeriesOption = {
        type: 'themeRiver',
        data: riverData
    };

    return {
        series: [series],
        legend: getLegendOption(options?.legend, options?.legendPosition, options?.legendOrient),
        tooltip: { trigger: 'axis' },
        singleAxis: {
            type: 'time',
            bottom: '10%'
        }
    };
}
