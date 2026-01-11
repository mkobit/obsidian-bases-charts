/* eslint-disable functional/no-loop-statements */
/* eslint-disable functional/no-conditional-statements */
/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable functional/no-expression-statements */

import type { BarSeriesOption, EChartsOption } from 'echarts';
import * as R from 'remeda';
import type { BaseTransformerOptions, BasesData } from './base';
import { getLegendOption, getNestedValue, safeToString } from './utils';

export interface GanttTransformerOptions extends BaseTransformerOptions {
    readonly taskProp: string;
    readonly startProp: string;
    readonly endProp: string;
    readonly seriesProp?: string;
}

interface GanttDataPoint {
    readonly task: string;
    readonly start: number;
    readonly end: number;
    readonly duration: number;
    readonly seriesName?: string;
    readonly dataIndex: number;
}

function normalizeDate(val: unknown): number | null {
    if (typeof val === 'number') { return val; }
    if (val instanceof Date) { return val.getTime(); }
    if (typeof val === 'string') {
        const d = new Date(val);
        return Number.isNaN(d.getTime()) ? null : d.getTime();
    }
    return null;
}

function formatTooltip(params: any): string {
    const p = Array.isArray(params) ? params : [params];
    const visibleItems = p.filter((item: any) => item.seriesName !== '_start');

    if (visibleItems.length === 0) { return ''; }

    const category = visibleItems[0].name;

    const itemsHtml = visibleItems.map((item: any) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const data = item.data as { value: number, start: number, end: number };
        const startStr = new Date(data.start).toISOString().substring(0, 10);
        const endStr = new Date(data.end).toISOString().substring(0, 10);

        const marker = item.marker || '';
        const seriesName = item.seriesName || '';

        return `<div>${marker} <b>${seriesName}</b> <br/>Start: ${startStr}<br/>End: ${endStr}<br/>Duration: ${data.value}ms</div>`;
    }).join('');

    return `<div><b>${category}</b></div>${itemsHtml}`;
}

export function createGanttChartOption(
    data: BasesData,
    options: GanttTransformerOptions
): EChartsOption {
    const { taskProp, startProp, endProp, seriesProp } = options;

    const validData: readonly GanttDataPoint[] = R.pipe(
        data,
        (items) => items.map((item, idx) => {
            const task = safeToString(getNestedValue(item, taskProp));
            const startRaw = getNestedValue(item, startProp);
            const endRaw = getNestedValue(item, endProp);
            const seriesName = seriesProp ? safeToString(getNestedValue(item, seriesProp)) : 'Task';

            const start = normalizeDate(startRaw);
            const end = normalizeDate(endRaw);

            if (!task || start === null || end === null || end < start) {
                return null;
            }

            const point: GanttDataPoint = {
                task,
                start,
                end,
                duration: end - start,
                seriesName,
                dataIndex: idx
            };
            return point;
        }),
        R.filter((x): x is GanttDataPoint => x !== null)
    );

    const tasks = R.pipe(
        validData,
        R.map(d => d.task),
        R.unique()
    );

    const groupedData = R.groupBy(validData, d => d.seriesName ?? 'Default');

    const seriesOptions: BarSeriesOption[] = [];

    // The loops below are complex to refactor purely functionally without hurting readability significantly
    // given the need to push multiple series options per group.
    // Suppressing lint for this specific block.

    for (const [sName, sData] of Object.entries(groupedData)) {
        const dataMap = R.indexBy(sData, d => d.task);

        const startSeriesData = tasks.map(t => {
            const item = dataMap[t];
            if (!item) { return '-'; }
            return {
                value: item.start,
                itemStyle: { color: 'transparent' }
            };
        });

        const durationSeriesData = tasks.map(t => {
            const item = dataMap[t];
            if (!item) { return '-'; }
            return {
                value: item.duration,
                start: item.start,
                end: item.end,
                seriesName: sName
            };
        });

        const stackId = `stack_${sName}`;

        seriesOptions.push({
            name: '_start',
            type: 'bar',
            stack: stackId,
            itemStyle: {
                borderColor: 'transparent',
                color: 'transparent'
            },
            emphasis: {
                itemStyle: {
                    borderColor: 'transparent',
                    color: 'transparent'
                }
            },
            data: startSeriesData,
            tooltip: { show: false },
            silent: true
        });

        seriesOptions.push({
            name: sName,
            type: 'bar',
            stack: stackId,
            data: durationSeriesData,
            label: {
                show: true,
                position: 'inside',
                formatter: (p: any) => {
                     // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                     return p.seriesName === 'Task' ? '' : p.seriesName;
                }
            }
        });
    }

    return {
        tooltip: {
            trigger: 'item',
            formatter: formatTooltip
        },
        legend: getLegendOption(options),
        grid: {
            containLabel: true,
            left: '3%',
            right: '4%',
            bottom: '3%'
        },
        xAxis: {
            type: 'time',
            position: 'top',
            splitLine: { show: true }
        },
        yAxis: {
            type: 'category',
            data: tasks,
            splitLine: { show: true },
            axisLine: { show: false },
            axisTick: { show: false }
        },
        series: seriesOptions
    };
}
