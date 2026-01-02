import type { QueryController, ViewOption } from 'obsidian';
import type BarePlugin from '../main';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type { EChartsOption } from 'echarts';

export class CalendarChartView extends BaseChartView {
    type = 'calendar-chart';

    constructor(controller: QueryController, containerEl: HTMLElement, plugin: BarePlugin) {
        super(controller, containerEl, plugin);
    }

    getViewType(): string { return 'calendar-chart'; }
    getDisplayText(): string { return 'Calendar'; }
    getIcon(): string { return 'calendar'; }

    static getViewOptions(): ViewOption[] {
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
            }
        ];
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const dateProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string;
        const valueProp = this.config.get(BaseChartView.VALUE_PROP_KEY) as string;

        if (!dateProp) return null;

        return transformDataToChartOption(data, dateProp, '', 'calendar', {
            valueProp: valueProp
        });
    }
}
