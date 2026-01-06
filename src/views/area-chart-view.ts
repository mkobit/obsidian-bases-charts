import { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';

export class AreaChartView extends BaseChartView {
    type = 'area-chart';

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

        // Options specific to Area chart logic (inherited from line options logic usually)
        const smooth = this.getBooleanOption('smooth');
        const showSymbol = this.getBooleanOption('showSymbol');
        // We force areaStyle to true, or allow toggle if we want user control, but for "Area Chart" view it implies true.
        // We can check if user explicitly turned it off if we add a toggle, but let's default to true.
        const areaStyle = true;

        if (typeof xProp !== 'string' || typeof yProp !== 'string') {
            return null;
        }

        return transformDataToChartOption(data, xProp, yProp, 'line', {
            xAxisLabel,
            yAxisLabel,
            xAxisLabelRotate,
            flipAxis,
            smooth,
            showSymbol,
            areaStyle,
            seriesProp: typeof seriesProp === 'string' ? seriesProp : undefined,
            legend: showLegend
        });
    }

    private getBooleanOption(key: string): boolean | undefined {
        const val = this.config.get(key);
        return typeof val === 'boolean' ? val : undefined;
    }

    static getViewOptions(): ViewOption[] {
        return [
            ...BaseChartView.getCommonViewOptions(), ...BaseChartView.getAxisViewOptions(),
            {
                displayName: 'Smooth Line',
                type: 'toggle',
                key: 'smooth',
            },
            {
                displayName: 'Show Symbol',
                type: 'toggle',
                key: 'showSymbol',
            }
        ];
    }
}
