import {
    QueryController,
    ViewOption
} from 'obsidian';
import type { EChartsOption } from 'echarts';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';

export class ParallelChartView extends BaseChartView {
    // We override the default X-Axis property key to be used for dimensions (comma-separated string)
    // but we can reuse the key name 'xAxisProp' in the config, just displaying it differently.

    constructor(controller: QueryController, containerEl: HTMLElement, plugin: BarePlugin) {
        super(controller, containerEl, plugin);
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const dimensions = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string;
        const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY) as string;
        const showLegend = this.config.get(BaseChartView.LEGEND_KEY) as boolean;

        if (!dimensions) {
            return null;
        }

        return transformDataToChartOption(data, dimensions, '', 'parallel', {
            seriesProp,
            legend: showLegend
        });
    }

    static getViewOptions(): ViewOption[] {
        return [
            {
                displayName: 'Dimensions (comma-separated properties)',
                type: 'text',
                key: BaseChartView.X_AXIS_PROP_KEY,
                placeholder: 'e.g., Price, Weight, Speed',
            },
            {
                displayName: 'Series Property (Grouping)',
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
