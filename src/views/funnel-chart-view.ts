import { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';

export class FunnelChartView extends BaseChartView {
    type = 'funnel-chart';

    constructor(controller: QueryController, scrollEl: HTMLElement, plugin: BarePlugin) {
        super(controller, scrollEl, plugin);
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
        const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);
        const showLegend = this.config.get(BaseChartView.LEGEND_KEY) as boolean;

        if (typeof xProp !== 'string' || typeof yProp !== 'string') {
            return null;
        }

        return transformDataToChartOption(data, xProp, yProp, 'funnel', {
            legend: showLegend
        });
    }

    static getViewOptions(): ViewOption[] {
        // Funnel doesn't really use "Series Prop" in the same way (usually single series),
        // but we can keep common options or strip Series Prop.
        // Let's strip Series Prop to avoid confusion as our transformer doesn't support multi-funnel yet.
        return BaseChartView.getCommonViewOptions().filter(o => (o as any).key !== BaseChartView.SERIES_PROP_KEY);
    }
}
