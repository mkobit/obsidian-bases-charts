import type { EChartsOption, CalendarComponentOption, HeatmapSeriesOption } from 'echarts';
import type { CalendarTransformerOptions } from './types';
import { safeToString, getNestedValue } from './utils';

export function createCalendarChartOption(
    data: Record<string, unknown>[],
    dateProp: string,
    options?: CalendarTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;

    // Data format: [date, value]
    const calendarData: (string | number)[][] = [];
    let minDate = '9999-12-31';
    let maxDate = '0000-01-01';

    let minVal = Infinity;
    let maxVal = -Infinity;

    data.forEach(item => {
        const dateRaw = getNestedValue(item, dateProp);
        const dateVal = safeToString(dateRaw);
        if (!dateVal) return;

        // Force string type assurance for TS
        const dStr = dateVal;

        if (dStr < minDate) minDate = dStr;
        if (dStr > maxDate) maxDate = dStr;

        let val = 0;
        if (valueProp) {
            const v = Number(getNestedValue(item, valueProp));
            if (!isNaN(v)) val = v;
        }

        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;

        calendarData.push([dateVal, val]);
    });

    if (minDate > maxDate) {
        // No data, defaults
        const now = new Date();
        minDate = now.toISOString().substring(0, 10);
        maxDate = minDate;
    }

    // Ensure range spans at least the data
    // ECharts calendar range can be a year or specific range.
    // If specific range, we assume one calendar component.

    if (minVal === Infinity) minVal = 0;
    if (maxVal === -Infinity) maxVal = 10;

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
        data: calendarData as unknown[]
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
