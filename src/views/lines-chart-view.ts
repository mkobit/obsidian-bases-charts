import { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';

export class LinesChartView extends BaseChartView {
    readonly type = 'lines-chart';

    static readonly END_X_PROP_KEY = 'end_x_prop';
    static readonly END_Y_PROP_KEY = 'end_y_prop';

    constructor(controller: QueryController, scrollEl: HTMLElement, plugin: BarePlugin) {
        super(controller, scrollEl, plugin);
    }

    protected getChartOption(data: readonly Record<string, unknown>[]): EChartsOption | null {
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
        const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);
        const x2Prop = this.config.get(LinesChartView.END_X_PROP_KEY);
        const y2Prop = this.config.get(LinesChartView.END_Y_PROP_KEY);
        const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY);

        if (typeof xProp !== 'string' || typeof yProp !== 'string' || typeof x2Prop !== 'string' || typeof y2Prop !== 'string') {
            return null;
        }

        return transformDataToChartOption(data, xProp, yProp, 'lines', {
            ...this.getCommonTransformerOptions(),
            x2Prop,
            y2Prop,
            seriesProp: typeof seriesProp === 'string' ? seriesProp : undefined
        });
    }

    static getViewOptions(): ViewOption[] {
        return [
            {
                key: BaseChartView.X_AXIS_PROP_KEY,
                type: 'property',
                displayName: 'Start X property',
                placeholder: 'Select property for Start X'
            },
            {
                key: BaseChartView.Y_AXIS_PROP_KEY,
                type: 'property',
                displayName: 'Start Y property',
                placeholder: 'Select property for Start Y'
            },
            {
                key: LinesChartView.END_X_PROP_KEY,
                type: 'property',
                displayName: 'End X property',
                placeholder: 'Select property for End X'
            },
            {
                key: LinesChartView.END_Y_PROP_KEY,
                type: 'property',
                displayName: 'End Y property',
                placeholder: 'Select property for End Y'
            },
            {
                key: BaseChartView.SERIES_PROP_KEY,
                type: 'property',
                displayName: 'Series property',
                placeholder: 'Select property for grouping'
            },
            ...BaseChartView.getCommonViewOptions().filter(opt => {
                if ('key' in opt && typeof opt.key === 'string') {
                    return opt.key !== BaseChartView.X_AXIS_PROP_KEY &&
                           opt.key !== BaseChartView.Y_AXIS_PROP_KEY &&
                           opt.key !== BaseChartView.SERIES_PROP_KEY;
                }
                return true;
            }),
        ];
    }
}
