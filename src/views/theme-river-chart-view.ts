import type { QueryController, ViewOption } from 'obsidian';
import type BarePlugin from '../main';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type { EChartsOption } from 'echarts';

export class ThemeRiverChartView extends BaseChartView {
    type = 'theme-river-chart';

    constructor(controller: QueryController, containerEl: HTMLElement, plugin: BarePlugin) {
        super(controller, containerEl, plugin);
    }

    getViewType(): string { return 'theme-river-chart'; }
    getDisplayText(): string { return 'ThemeRiver'; }
    getIcon(): string { return 'waves'; }

    static getViewOptions(): ViewOption[] {
        return [
            {
                displayName: 'Date Property',
                type: 'property',
                key: BaseChartView.X_AXIS_PROP_KEY,
                placeholder: 'Select date property',
            },
            {
                displayName: 'Value Property',
                type: 'property',
                key: BaseChartView.VALUE_PROP_KEY,
                placeholder: 'Select value property',
            },
            {
                displayName: 'Theme/Category Property',
                type: 'property',
                key: BaseChartView.SERIES_PROP_KEY,
                placeholder: 'Select category property',
            },
            {
                displayName: 'Show Legend',
                type: 'toggle',
                key: BaseChartView.LEGEND_KEY,
            }
        ];
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const dateProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string;
        const valueProp = this.config.get(BaseChartView.VALUE_PROP_KEY) as string;
        const themeProp = this.config.get(BaseChartView.SERIES_PROP_KEY) as string;
        const showLegend = this.config.get(BaseChartView.LEGEND_KEY) as boolean;

        if (!dateProp || !valueProp || !themeProp) return null;

        return transformDataToChartOption(data, dateProp, '', 'themeRiver' as any, {
            valueProp: valueProp,
            themeProp: themeProp, // Ensure this property is added to ChartTransformerOptions
            legend: showLegend
        });
    }
}
