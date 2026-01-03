import { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';

export class ParallelChartView extends BaseChartView {
    type = 'parallel-chart';

    constructor(controller: QueryController, scrollEl: HTMLElement, plugin: BarePlugin) {
        super(controller, scrollEl, plugin);
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        // For Parallel, X-Axis prop serves as "Dimensions" (comma-separated list of properties)
        const dimensionsStr = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
        const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY);
        const showLegend = this.config.get(BaseChartView.LEGEND_KEY) as boolean;

        if (typeof dimensionsStr !== 'string' || !dimensionsStr.trim()) {
            return null;
        }

        return transformDataToChartOption(data, dimensionsStr, '', 'parallel', {
            seriesProp: typeof seriesProp === 'string' ? seriesProp : undefined,
            legend: showLegend
        });
    }

    static getViewOptions(): ViewOption[] {
        return [
            {
                displayName: 'Dimensions (comma-separated)',
                type: 'text',
                key: BaseChartView.X_AXIS_PROP_KEY,
                placeholder: 'e.g. Height, Weight, Age',
            },
            {
                displayName: 'Group By Property (Optional)',
                type: 'property',
                key: BaseChartView.SERIES_PROP_KEY,
                placeholder: 'Select property to group lines',
            },
            {
                displayName: 'Show Legend',
                type: 'toggle',
                key: BaseChartView.LEGEND_KEY,
            }
        ];
    }
}
