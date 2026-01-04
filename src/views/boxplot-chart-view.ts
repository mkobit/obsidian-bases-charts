import {
    QueryController,
    ViewOption
} from 'obsidian';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';

export class BoxplotChartView extends BaseChartView {
    constructor(controller: QueryController, containerEl: HTMLElement, plugin: BarePlugin) {
        super(controller, containerEl, plugin);
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string;
        const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY) as string;
        const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY) as string;
        const showLegend = this.config.get(BaseChartView.LEGEND_KEY) as boolean;

        // Axis Config
        const xAxisLabel = this.config.get(BaseChartView.X_AXIS_LABEL_KEY) as string;
        const yAxisLabel = this.config.get(BaseChartView.Y_AXIS_LABEL_KEY) as string;
        const xAxisLabelRotate = Number(this.config.get(BaseChartView.X_AXIS_LABEL_ROTATE_KEY));
        const flipAxis = this.config.get(BaseChartView.FLIP_AXIS_KEY) as boolean;

        if (!xProp || !yProp) {
            return null;
        }

        return transformDataToChartOption(data, xProp, yProp, 'boxplot', {
            seriesProp: seriesProp,
            legend: showLegend,
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
            {
                displayName: 'X-Axis Property (Category)',
                type: 'property',
                key: BaseChartView.X_AXIS_PROP_KEY,
                placeholder: 'Select category property',
            },
            {
                displayName: 'Y-Axis Property (Values)',
                type: 'property',
                key: BaseChartView.Y_AXIS_PROP_KEY,
                placeholder: 'Select value property',
            },
            {
                displayName: 'Series Property (Optional)',
                type: 'property',
                key: BaseChartView.SERIES_PROP_KEY,
                placeholder: 'Select grouping property',
            },
            {
                displayName: 'Show Legend',
                type: 'toggle',
                key: BaseChartView.LEGEND_KEY,
            },
            {
                displayName: 'Height',
                type: 'text',
                key: BaseChartView.HEIGHT_KEY,
                placeholder: 'e.g., 500px'
            },
            ...BaseChartView.getAxisViewOptions()
        ];
    }

    public type = 'boxplot-chart';
}
