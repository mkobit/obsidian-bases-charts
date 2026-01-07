import type { EChartsOption, CalendarComponentOption, HeatmapSeriesOption, VisualMapComponentOption } from 'echarts';
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

            return !dateVal
                ? null
                : (() => {
                    const val = valueProp ? Number(getNestedValue(item, valueProp)) : Number.NaN;
                    const finalVal = Number.isNaN(val) ? 0 : val;
                    return { date: dateVal, value: finalVal };
                })();
        }),
        R.filter((d): d is { date: string; value: number } => d !== null)
    );

    return calendarData.length === 0
        ? (() => {
            // Return default empty state
            const now = new Date();
            const minDate = now.toISOString().slice(0, 10);
            return {
                 calendar: { range: [minDate, minDate] },
                 series: []
            };
        })()
        : (() => {
            // Sort data by date for range calculation and predictable order
            const sortedData = R.sortBy(calendarData, d => d.date);
            const minDate = sortedData[0]!.date;
            const maxDate = sortedData[sortedData.length - 1]!.date;

            // Calculate min/max values in one pass using reduce
            const range = sortedData.reduce((acc, d) => ({
                min: Math.min(acc.min, d.value),
                max: Math.max(acc.max, d.value)
            }), { min: Infinity, max: -Infinity });

            const dataMin = range.min === Infinity ? 0 : range.min;
            const dataMax = range.max === -Infinity ? 10 : range.max;

            const minVal = options?.visualMapMin !== undefined ? options.visualMapMin : dataMin;
            const maxVal = options?.visualMapMax !== undefined ? options.visualMapMax : dataMax;

            // ECharts expects [date, value] array
            const seriesData = R.map(sortedData, d => [d.date, d.value]);

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

            const visualMapOption: VisualMapComponentOption = {
                min: minVal,
                max: maxVal,
                calculable: true,
                orient: options?.visualMapOrient ?? 'horizontal',
                left: options?.visualMapLeft ?? 'center',
                top: options?.visualMapTop ?? 65,
                type: options?.visualMapType ?? 'continuous',
                ...(options?.visualMapColor ? { inRange: { color: options.visualMapColor } } : {})
            };

            return {
                tooltip: {
                    position: 'top',
                    formatter: (params: unknown) => {
                         const p = params as { value: (number | string)[] };
                         return (!p || !Array.isArray(p.value))
                            ? ''
                            : `${p.value[0]} : ${p.value[1]}`;
                    }
                },
                visualMap: visualMapOption,
                calendar: calendarItem,
                series: [seriesItem]
            };
        })();
}
