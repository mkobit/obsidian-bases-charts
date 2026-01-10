import type { QueryController, ViewOption } from 'obsidian';
import type BarePlugin from '../main';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type { EChartsOption } from 'echarts';
import { BasesData } from '../charts/transformers/base';

export class ThemeRiverChartView extends BaseChartView {
    readonly type = 'theme-river-chart';

    constructor(controller: Readonly<QueryController>, containerEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
        super(controller, containerEl, plugin);
    }


    getViewType(): string { return 'theme-river-chart'; }

    getDisplayText(): string { return 'Theme river'; }

    getIcon(): string { return 'waves'; }

    static getViewOptions(_?: unknown): ViewOption[] {
        return [
            {
                displayName: 'Date property',
                type: 'property',
                key: BaseChartView.X_AXIS_PROP_KEY,
                placeholder: 'Select date property',
            },
            {
                displayName: 'Value property',
                type: 'property',
                key: BaseChartView.VALUE_PROP_KEY,
                placeholder: 'Select value property',
            },
            {
                displayName: 'Theme/category property',
                type: 'property',
                key: BaseChartView.SERIES_PROP_KEY,
                placeholder: 'Select category property',
            },
            {
                displayName: 'Show legend',
                type: 'toggle',
                key: BaseChartView.LEGEND_KEY,
            }
        ];
    }

    protected getChartOption(data: BasesData): EChartsOption | null {
        const dateProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string;
        const valueProp = this.config.get(BaseChartView.VALUE_PROP_KEY) as string;
        const themeProp = this.config.get(BaseChartView.SERIES_PROP_KEY) as string;

        if (!dateProp || !valueProp || !themeProp) {return null;}

        return transformDataToChartOption(data, dateProp, '', 'themeRiver', {
            ...this.getCommonTransformerOptions(),
            valueProp: valueProp,
            themeProp: themeProp, // Ensure this property is added to ChartTransformerOptions
        });
    }
}
