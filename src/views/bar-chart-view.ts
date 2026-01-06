import { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';

export class BarChartView extends BaseChartView {
    type = 'bar-chart';

    constructor(controller: QueryController, scrollEl: HTMLElement, plugin: BarePlugin) {
        super(controller, scrollEl, plugin);
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
        const xAxisLabel = this.config.get(BaseChartView.X_AXIS_LABEL_KEY) as string;
        const yAxisLabel = this.config.get(BaseChartView.Y_AXIS_LABEL_KEY) as string;
        const xAxisLabelRotate = Number(this.config.get(BaseChartView.X_AXIS_LABEL_ROTATE_KEY));
        const flipAxis = this.config.get(BaseChartView.FLIP_AXIS_KEY) as boolean;

        const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);
        const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY);
        const showLegend = this.config.get(BaseChartView.LEGEND_KEY) as boolean;

        if (typeof xProp !== 'string' || typeof yProp !== 'string') {
            return null;
        }

        return transformDataToChartOption(data, xProp, yProp, 'bar', {
            xAxisLabel,
            yAxisLabel,
            xAxisLabelRotate,
            flipAxis,
            legend: showLegend,
            seriesProp: typeof seriesProp === 'string' ? seriesProp : undefined
        });
    }

    static getViewOptions(): ViewOption[] {
        return [...BaseChartView.getCommonViewOptions(), ...BaseChartView.getAxisViewOptions()];
    }
}
