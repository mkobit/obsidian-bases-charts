import type { QueryController, ViewOption } from 'obsidian';
import type BarePlugin from '../main';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type { EChartsOption } from 'echarts';

export class HeatmapChartView extends BaseChartView {
    type = 'heatmap-chart';

    constructor(controller: QueryController, containerEl: HTMLElement, plugin: BarePlugin) {
        super(controller, containerEl, plugin);
    }

    static getViewOptions(): ViewOption[] {
        return [
            {
                displayName: 'X-Axis Property',
                type: 'property',
                key: BaseChartView.X_AXIS_PROP_KEY,
                placeholder: 'Select category (columns)',
            },
            {
                displayName: 'Y-Axis Property',
                type: 'property',
                key: BaseChartView.Y_AXIS_PROP_KEY,
                placeholder: 'Select category (rows)',
            },
            {
                displayName: 'Value Property',
                type: 'property',
                key: BaseChartView.VALUE_PROP_KEY,
                placeholder: 'Select value property (color)',
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            ...BaseChartView.getAxisViewOptions().filter(opt => (opt as any).key !== BaseChartView.FLIP_AXIS_KEY)
        ];
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
        const xAxisLabel = this.config.get(BaseChartView.X_AXIS_LABEL_KEY) as string;
        const yAxisLabel = this.config.get(BaseChartView.Y_AXIS_LABEL_KEY) as string;
        const xAxisLabelRotate = Number(this.config.get(BaseChartView.X_AXIS_LABEL_ROTATE_KEY));
        const flipAxis = this.config.get(BaseChartView.FLIP_AXIS_KEY) as boolean;

        const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);
        const valueProp = this.config.get(BaseChartView.VALUE_PROP_KEY);

        if (typeof xProp !== 'string' || typeof yProp !== 'string' || typeof valueProp !== 'string') {
            return null;
        }

        return transformDataToChartOption(data, xProp, yProp, 'heatmap', {
            xAxisLabel,
            yAxisLabel,
            xAxisLabelRotate,
            flipAxis,
            valueProp: valueProp
        });
    }
}
