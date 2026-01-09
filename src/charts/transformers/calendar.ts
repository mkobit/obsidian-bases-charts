import type { EChartsOption, SeriesOption } from 'echarts';
import type { BasesData, BaseTransformerOptions } from './base';

export interface CalendarTransformerOptions extends BaseTransformerOptions {
    readonly valueProp?: string;
}

export function createCalendarChartOption(
    data: BasesData,
    dateProp: string,
    options?: CalendarTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;

    // Calendar: [date, value]
    // Use [string, number] tuple
    const calendarData: [string, number][] = data.map(item => [
        String(item[dateProp]).substring(0, 10),
        valueProp ? Number(item[valueProp]) : 1
    ]);

    // Determine year range
    const years = Array.from(new Set(calendarData.map(d => String(d[0]).substring(0, 4)))).sort();

    let range: string | string[] = new Date().getFullYear().toString();
    if (years.length > 0) {
        if (years.length === 1) {
            range = years[0]!;
        } else {
            range = [years[0]!, years[years.length-1]!];
        }
    }

    const series: SeriesOption = {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: calendarData
    };

    return {
        series: [series],
        calendar: {
            range: range,
            cellSize: ['auto', 20],
            yearLabel: { show: true }
        },
        visualMap: {
            min: options?.visualMapMin ?? 0,
            max: options?.visualMapMax ?? 10,
            type: 'continuous',
            orient: 'horizontal',
            left: 'center',
            bottom: 20
        },
        tooltip: { trigger: 'item' }
    };
}
