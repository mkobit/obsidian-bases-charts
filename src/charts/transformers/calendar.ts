import type { EChartsOption, CalendarComponentOption, HeatmapSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface CalendarTransformerOptions extends BaseTransformerOptions {
    valueProp?: string;
}

export function createCalendarChartOption(
    data: Record<string, unknown>[],
    dateProp: string,
    options?: CalendarTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;

    const calendarData = data
        .map(item => {
            const dateRaw = getNestedValue(item, dateProp);
            const dateVal = safeToString(dateRaw);
            if (!dateVal) return null;

            let val = 0;
            if (valueProp) {
                const v = Number(getNestedValue(item, valueProp));
                if (!isNaN(v)) val = v;
            }
            return { date: dateVal, value: val };
        })
        .filter((d): d is { date: string; value: number } => d !== null);

    if (calendarData.length === 0) {
        // Return default empty state
        const now = new Date();
        const minDate = now.toISOString().substring(0, 10);
        return {
             calendar: { range: [minDate, minDate] },
             series: []
        };
    }

    const dates = calendarData.map(d => d.date);
    const values = calendarData.map(d => d.value);

    // Calculate Min/Max without mutation
    const minDate = dates.reduce((a, b) => (a < b ? a : b), dates[0]!);
    const maxDate = dates.reduce((a, b) => (a > b ? a : b), dates[0]!);

    const minVal = values.length > 0 ? Math.min(...values) : 0;
    const maxVal = values.length > 0 ? Math.max(...values) : 10;

    // ECharts expects [date, value] array
    const seriesData = calendarData.map(d => [d.date, d.value]);

    const calendarItem: CalendarComponentOption = {
        top: 120,
        left: 30,
        right: 30,
        cellSize: ['auto', 13],
        range: [minDate, maxDate],
        itemStyle: {
            borderWidth: 0.5
        },
        yearLabel: { show: false }
    };

    const seriesItem: HeatmapSeriesOption = {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        data: seriesData as any
    };

    return {
        tooltip: {
            position: 'top',
            formatter: (params: unknown) => {
                 const p = params as { value: (number | string)[] };
                 if (!p || !Array.isArray(p.value)) return '';
                 return `${p.value[0]} : ${p.value[1]}`;
            }
        },
        visualMap: {
            min: minVal,
            max: maxVal,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            top: 65
        },
        calendar: calendarItem,
        series: [seriesItem]
    };
}
