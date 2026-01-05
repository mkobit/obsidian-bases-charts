import type { EChartsOption, CalendarComponentOption, HeatmapSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';
import * as R from 'remeda';

export interface CalendarTransformerOptions extends BaseTransformerOptions {
    valueProp?: string;
}

export function createCalendarChartOption(
    data: Record<string, unknown>[],
    dateProp: string,
    options?: CalendarTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;

    const calendarData = R.pipe(
        data,
        R.map(item => {
            const dateRaw = getNestedValue(item, dateProp);
            const dateVal = safeToString(dateRaw);
            if (!dateVal) return null;

            const val = valueProp ? Number(getNestedValue(item, valueProp)) : NaN;
            const finalVal = !isNaN(val) ? val : 0;

            return { date: dateVal, value: finalVal };
        }),
        R.filter((d): d is { date: string; value: number } => d !== null)
    );

    if (calendarData.length === 0) {
        // Return default empty state
        const now = new Date();
        const minDate = now.toISOString().substring(0, 10);
        return {
             calendar: { range: [minDate, minDate] },
             series: []
        };
    }

    const dates = R.map(calendarData, d => d.date);
    const values = R.map(calendarData, d => d.value);

    // Calculate Min/Max without mutation
    const sortedDates = R.sortBy(dates, x => x);
    const minDate = R.first(sortedDates) ?? dates[0]!;
    const maxDate = R.last(sortedDates) ?? dates[0]!;

    const minVal = values.length > 0 ? Math.min(...values) : 0;
    const maxVal = values.length > 0 ? Math.max(...values) : 10;

    // ECharts expects [date, value] array
    const seriesData = R.map(calendarData, d => [d.date, d.value]);

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
