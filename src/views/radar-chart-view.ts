import { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';

export class RadarChartView extends BaseChartView {
    readonly type = 'radar-chart';

    constructor(controller: QueryController, scrollEl: HTMLElement, plugin: BarePlugin) {
        super(controller, scrollEl, plugin);
    }

    protected getChartOption(data: readonly Record<string, unknown>[]): EChartsOption | null {
        // For Radar:
        // X-Axis Prop -> Indicator (Category)
        // Y-Axis Prop -> Value
        // Series Prop -> Series Name
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
        const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);
        const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY);

        if (typeof xProp !== 'string' || typeof yProp !== 'string') {
            return null;
        }

        return transformDataToChartOption(data, xProp, yProp, 'radar', {
            ...this.getCommonTransformerOptions(),
            seriesProp: typeof seriesProp === 'string' ? seriesProp : undefined
        });
    }

    static getViewOptions(): ViewOption[] {
        // Clone options to avoid side effects on other charts
        const commonOpts = BaseChartView.getCommonViewOptions().map(opt => ({...opt}));

        const xOpt = commonOpts.find(o => 'key' in o && o.key === BaseChartView.X_AXIS_PROP_KEY);
        if (xOpt && 'displayName' in xOpt && 'placeholder' in xOpt) {
            xOpt.displayName = 'Indicator Property';
            xOpt.placeholder = 'Select indicator/category property';
        }

        return commonOpts;
    }
}
