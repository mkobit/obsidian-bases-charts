import { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';

export class LineChartView extends BaseChartView {
    readonly type = 'line-chart';

    constructor(controller: QueryController, scrollEl: HTMLElement, plugin: BarePlugin) {
        super(controller, scrollEl, plugin);
    }

    protected getChartOption(data: readonly Record<string, unknown>[]): EChartsOption | null {
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
        const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);
        const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY);

        // Get line specific options safely
        const smooth = this.getBooleanOption('smooth');
        const showSymbol = this.getBooleanOption('showSymbol');
        const areaStyle = this.getBooleanOption('areaStyle');

        if (typeof xProp !== 'string' || typeof yProp !== 'string') {
            return null;
        }

        return transformDataToChartOption(data, xProp, yProp, 'line', {
            ...this.getCommonTransformerOptions(),
            smooth,
            showSymbol,
            areaStyle,
            seriesProp: typeof seriesProp === 'string' ? seriesProp : undefined
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
            },
            {
                displayName: 'Area Style',
                type: 'toggle',
                key: 'areaStyle',
            }
        ];
    }
}
