import { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';
import { BasesData } from '../charts/transformers/base';

export class GanttChartView extends BaseChartView {
    readonly type = 'gantt-chart';

    static readonly TASK_PROP_KEY = 'taskProp';
    static readonly START_PROP_KEY = 'startProp';
    static readonly END_PROP_KEY = 'endProp';

    constructor(controller: Readonly<QueryController>, scrollEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
        super(controller, scrollEl, plugin);
    }

    protected getChartOption(data: BasesData): EChartsOption | null {
        const taskProp = this.config.get(GanttChartView.TASK_PROP_KEY);
        const startProp = this.config.get(GanttChartView.START_PROP_KEY);
        const endProp = this.config.get(GanttChartView.END_PROP_KEY);
        const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY); // Optional grouping

        const showLegend = this.config.get(BaseChartView.LEGEND_KEY) as boolean;

        if (typeof taskProp !== 'string' || typeof startProp !== 'string' || typeof endProp !== 'string') {
            return null;
        }

        return transformDataToChartOption(data, taskProp, '', 'gantt', {
            taskProp,
            startProp,
            endProp,
            seriesProp: typeof seriesProp === 'string' ? seriesProp : undefined,
            legend: showLegend
        });
    }

    static getViewOptions(plugin?: unknown): ViewOption[] {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
        const p = plugin as any;

        return [
            {
                key: GanttChartView.TASK_PROP_KEY,
                displayName: 'Task property',
                type: 'dropdown',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                options: p?.getProperties?.() ?? {},
                placeholder: 'Property containing task names'
            },
            {
                key: GanttChartView.START_PROP_KEY,
                displayName: 'Start time property',
                type: 'dropdown',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                options: p?.getProperties?.() ?? {},
                placeholder: 'Property containing start timestamps'
            },
            {
                key: GanttChartView.END_PROP_KEY,
                displayName: 'End time property',
                type: 'dropdown',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                options: p?.getProperties?.() ?? {},
                placeholder: 'Property containing end timestamps'
            },
            {
                key: BaseChartView.SERIES_PROP_KEY,
                displayName: 'Group by property',
                type: 'dropdown',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                options: p?.getProperties?.() ?? {},
                placeholder: 'Property to group tasks by'
            },
            ...BaseChartView.getCommonViewOptions().filter(o =>
                o.key !== BaseChartView.X_AXIS_PROP_KEY &&
                o.key !== BaseChartView.Y_AXIS_PROP_KEY &&
                o.key !== BaseChartView.SERIES_PROP_KEY
            )
        ];
    }
}
