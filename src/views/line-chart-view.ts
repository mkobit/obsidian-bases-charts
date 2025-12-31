import { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';

export class LineChartView extends BaseChartView {
    type = 'line-chart';

    constructor(controller: QueryController, scrollEl: HTMLElement, plugin: BarePlugin) {
        super(controller, scrollEl, plugin);
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
        const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);
        const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY);
        const showLegend = this.config.get(BaseChartView.LEGEND_KEY) as boolean;

        // Get line specific options safely
        const smooth = this.getBooleanOption('smooth');
        const showSymbol = this.getBooleanOption('showSymbol');
        const areaStyle = this.getBooleanOption('areaStyle');

        if (typeof xProp !== 'string' || typeof yProp !== 'string') {
            return null;
        }

        return transformDataToChartOption(data, xProp, yProp, 'line', {
            smooth,
            showSymbol,
            areaStyle,
            legend: showLegend,
            seriesProp: typeof seriesProp === 'string' ? seriesProp : undefined
        });
    }

    private getBooleanOption(key: string): boolean | undefined {
        const val = this.config.get(key);
        return typeof val === 'boolean' ? val : undefined;
    }

    static getViewOptions(): ViewOption[] {
        return [
            ...BaseChartView.getCommonViewOptions(),
            {
                displayName: 'Smooth Line',
                type: 'toggle',
                key: 'smooth',
            },
            {
                displayName: 'Show Symbol',
                type: 'toggle',
                key: 'showSymbol',
            },
            {
                displayName: 'Area Style',
                type: 'toggle',
                key: 'areaStyle',
            }
        ];
    }
}
