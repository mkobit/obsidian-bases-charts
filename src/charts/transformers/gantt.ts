import type { BarSeriesOption, EChartsOption, TooltipComponentOption } from 'echarts';
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
    readonly dataIndex: number; // Keep track of original index for stability
}

function normalizeDate(val: unknown): number | null {
    if (typeof val === 'number') return val;
    if (val instanceof Date) return val.getTime();
    if (typeof val === 'string') {
        const d = new Date(val);
        return Number.isNaN(d.getTime()) ? null : d.getTime();
    }
    return null;
}

function formatTooltip(params: any): string {
    // We expect params to be an array because axisPointer is type 'shadow' usually, or single item.
    // However, since we stack, we might get multiple items for the same axis.
    // But we only care about the visible bar (series index 1 usually, or named series).
    // Actually, generic tooltip formatter is better.

    // params can be an array or object.
    const p = Array.isArray(params) ? params : [params];

    // Filter out the placeholder series (which has itemStyle.color = 'transparent')
    // Or simpler: The transformer names the placeholder series '_start'.
    const visibleItems = p.filter((item: any) => item.seriesName !== '_start');

    if (visibleItems.length === 0) return '';

    // Assume all items share the same category (task)
    const category = visibleItems[0].name;

    const itemsHtml = visibleItems.map((item: any) => {
        // The value for the visible bar is the duration.
        // But we want to show Start - End.
        // We can access custom data if we encoded it.
        // In this implementation, we will try to reconstruct or look at the data.
        // Since we are using a simple transformer, we might not have easy access to the "Start" value in the "Duration" series
        // without looking at the stack.

        // A trick is to use dataset and encode, but here we are generating series data directly.
        // The data item is just the duration number.

        // However, ECharts tooltip formatter can access the raw data if provided as object.
        // Let's provide data as { value: duration, start: start, end: end }.

        const data = item.data as { value: number, start: number, end: number };
        const startStr = new Date(data.start).toISOString().substring(0, 10); // Simple YYYY-MM-DD
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

    // 1. Process Data
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

    // 2. Group by Series (if seriesProp is used)
    // If no seriesProp, we have one group.
    // However, Gantt charts typically have tasks on Y axis.
    // Multiple bars on the same Y category?
    // If we have multiple series, we can stack them?
    // Standard Gantt: One row per task.
    // If duplicate task names exist, they will be stacked or overlaid.
    // ECharts bars with same name in category axis are stacked if stack: 'something'.

    // We want unique tasks on Y-axis.
    const tasks = R.pipe(
        validData,
        R.map(d => d.task),
        R.unique()
    );

    // Group data by series name
    const groupedData = R.groupBy(validData, d => d.seriesName ?? 'Default');

    // Create Series
    // For each group (Series A, Series B...), we need TWO ECharts series:
    // 1. Invisible Start Bar (stack: 'total', stackStrategy: 'all')
    // 2. Visible Duration Bar (stack: 'total')

    // Wait, if we have multiple series (groups), simply stacking them all together might not work if they overlap in time.
    // But for simplicity in this "Gantt" view:
    // We will assume "stack" means they are stacked horizontally (time-wise) if they share the same row.
    // But usually Gantt bars don't stack value-wise, they are placed in time.
    // ECharts Bar Chart calculates stack by summing values.
    // So if Task 1 has Series A (Start 0, Dur 10) and Series B (Start 5, Dur 5).
    // Stacked:
    // - Invisible A: 0
    // - Visible A: 10
    // - Invisible B: 5 (Stacked on top of A? No)

    // The standard ECharts Gantt hack is:
    // Series "Start": Transparent.
    // Series "Task": Visible.
    // This only works well for single-series or non-overlapping tasks in the same row.
    // If we have grouping, we might run into issues with the "Start" series stacking.

    // Better approach for Multi-Series Gantt in ECharts:
    // Don't use `stack`. Use `custom` series (too complex here) OR
    // Use `stack` but be careful.
    // Actually, if we use `stack`, the second value starts where the first ended.
    // We want absolute positioning.

    // Alternative: Use `type: 'custom'` render item.
    // But let's try the simple Bar approach first.
    // If we have multiple series, maybe we just treat them as separate entries in the legend,
    // but we can't easily stack them correctly if they are independent in time.
    // E.g. Task A: [0-10] (Red), [5-15] (Blue).
    // The Blue one starts at 5.
    // If we stack, Blue Start is added to Red End? Or Red Start?
    // ECharts stacks values.

    // For this implementation, let's support SINGLE series Gantt correctly first.
    // If `seriesProp` is provided, we can try to separate them, but we cannot rely on stacking for positioning if we want independent bars.
    // However, if the user wants "Stacked Gantt" (sequential phases), then stacking works.
    // Let's assume the user might want independent bars.
    // If independent, we can't use the simple stack hack easily for multiple series on the same category.

    // Compromise:
    // If `seriesProp` is used, we create multiple pairs of (Start, Duration) series.
    // But ECharts puts bars side-by-side if not stacked.
    // If stacked, they sum up.

    // Let's go with the standard "Simple Gantt":
    // If multiple series are present, we output them as separate bar series groups.
    // If they share the same Y-axis category, ECharts will place them side-by-side (grouped bars).
    // Each "group" in the bar chart will have a "Start" (transparent) and "Duration" (visible).
    // This works!
    // Group 1: [Start, Duration] (Stacked)
    // Group 2: [Start, Duration] (Stacked)
    // ECharts handles grouped stacked bars nicely?
    // We need to define `stack: 'group1'`, `stack: 'group2'`.

    const seriesOptions: BarSeriesOption[] = [];

    // We need to map data to the tasks order.
    // For each series group, we create a data array aligned with `tasks`.

    for (const [sName, sData] of Object.entries(groupedData)) {
        // Prepare data aligned with 'tasks'
        // If a task has multiple entries for the same series?
        // ECharts Bar chart only takes one value per category per series.
        // So we take the first one found, or we might need a better approach for multiple blocks per row.
        // For now, assume unique (Task, Series) pair.
        // Or better: filter duplicates.

        const dataMap = R.indexBy(sData, d => d.task);

        const startSeriesData = tasks.map(t => {
            const item = dataMap[t];
            if (!item) return '-'; // No data for this task in this series
            return {
                value: item.start,
                itemStyle: { color: 'transparent' } // Ensure invisible
            };
        });

        const durationSeriesData = tasks.map(t => {
            const item = dataMap[t];
            if (!item) return '-';
            return {
                value: item.duration,
                // Pass extra data for tooltip
                start: item.start,
                end: item.end,
                seriesName: sName
            };
        });

        const stackId = `stack_${sName}`;

        seriesOptions.push({
            name: '_start', // Internal name
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
            silent: true // No interaction for placeholder
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
                     // Check if there is enough space?
                     return p.seriesName === 'Task' ? '' : p.seriesName;
                }
            }
        });
    }

    return {
        tooltip: {
            trigger: 'item', // 'axis' is confusing with invisible bars
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
            position: 'top', // Gantt usually has time on top
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
