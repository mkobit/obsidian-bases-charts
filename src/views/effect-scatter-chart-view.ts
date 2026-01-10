import { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';
import { BasesData } from '../charts/transformers/base';

export class EffectScatterChartView extends BaseChartView {
    readonly type = 'effect-scatter-chart';

    constructor(controller: Readonly<QueryController>, scrollEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
        super(controller, scrollEl, plugin);
    }

    protected getChartOption(data: BasesData): EChartsOption | null {
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
        const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);
        const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY);
        const sizeProp = this.config.get(BaseChartView.SIZE_PROP_KEY);

        if (typeof xProp !== 'string' || typeof yProp !== 'string') {
            return null;
        }

        return transformDataToChartOption(data, xProp, yProp, 'effectScatter', {
            ...this.getCommonTransformerOptions(),
            seriesProp: typeof seriesProp === 'string' ? seriesProp : undefined,
            sizeProp: typeof sizeProp === 'string' ? sizeProp : undefined
        });
    }

    static getViewOptions(): ViewOption[] {
        return [
            ...BaseChartView.getCommonViewOptions(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            ...BaseChartView.getAxisViewOptions().filter(opt => (opt as any).key !== BaseChartView.FLIP_AXIS_KEY),
            {
                key: BaseChartView.SIZE_PROP_KEY,
                type: 'property',
                displayName: 'Size property',
                placeholder: 'Select property for bubble size'
            }
        ];
    }
}
