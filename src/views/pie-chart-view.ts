import { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';
import { BasesData } from '../charts/transformers/base';

export class PieChartView extends BaseChartView {
    readonly type = 'pie-chart';

    constructor(controller: Readonly<QueryController>, scrollEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
        super(controller, scrollEl, plugin);
    }

    protected getChartOption(data: BasesData): EChartsOption | null {
        // For Pie chart, X-Axis prop serves as "Name" (Category) and Y-Axis prop as "Value"
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
        const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);

        if (typeof xProp !== 'string' || typeof yProp !== 'string') {
            return null;
        }

        return transformDataToChartOption(data, xProp, yProp, 'pie', {
            ...this.getCommonTransformerOptions()
        });
    }

    static getViewOptions(): ViewOption[] {
        // Pie charts don't necessarily need 'Series Property' in the same way stacked bars do,
        // but we can reuse common options.
        // Actually, usually Pie chart is Name vs Value.
        return BaseChartView.getCommonViewOptions();
    }
}
