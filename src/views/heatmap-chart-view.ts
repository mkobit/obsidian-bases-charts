import type { QueryController, ViewOption } from 'obsidian';
import type BarePlugin from '../main';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type { EChartsOption } from 'echarts';

export class HeatmapChartView extends BaseChartView {
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
            }
        ];
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const xProp = this.config[BaseChartView.X_AXIS_PROP_KEY] as string;
        const yProp = this.config[BaseChartView.Y_AXIS_PROP_KEY] as string;
        const valueProp = this.config[BaseChartView.VALUE_PROP_KEY] as string;

        if (!xProp || !yProp || !valueProp) {
            return null;
        }

        return transformDataToChartOption(data, xProp, yProp, 'heatmap', {
            valueProp: valueProp
        });
    }
}
