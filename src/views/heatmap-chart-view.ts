import { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';

export class HeatmapChartView extends BaseChartView {
    type = 'heatmap-chart';

    constructor(controller: QueryController, scrollEl: HTMLElement, plugin: BarePlugin) {
        super(controller, scrollEl, plugin);
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
        const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);
        // Heatmap uses "valueProp" for the 3rd dimension (color)
        const valueProp = this.config.get(BaseChartView.VALUE_PROP_KEY);

        // Axis Config
        const xAxisLabel = this.config.get(BaseChartView.X_AXIS_LABEL_KEY) as string;
        const yAxisLabel = this.config.get(BaseChartView.Y_AXIS_LABEL_KEY) as string;
        const xAxisLabelRotate = Number(this.config.get(BaseChartView.X_AXIS_LABEL_ROTATE_KEY));
        const flipAxis = this.config.get(BaseChartView.FLIP_AXIS_KEY) as boolean;

        if (typeof xProp !== 'string' || typeof yProp !== 'string') {
            return null;
        }

        return transformDataToChartOption(data, xProp, yProp, 'heatmap', {
            valueProp: typeof valueProp === 'string' ? valueProp : undefined,
            axis: {
                xAxisLabel,
                yAxisLabel,
                xAxisLabelRotate: isNaN(xAxisLabelRotate) ? undefined : xAxisLabelRotate,
                flipAxis
            }
        });
    }

    static getViewOptions(): ViewOption[] {
        return [
            ...BaseChartView.getCommonViewOptions(),
            ...BaseChartView.getAxisViewOptions(),
            {
                displayName: 'Value Property',
                type: 'property',
                key: BaseChartView.VALUE_PROP_KEY,
                placeholder: 'Select value property (color)'
            }
        ];
    }
}
