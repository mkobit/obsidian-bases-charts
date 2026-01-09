import type { QueryController, ViewOption } from 'obsidian';
import type BarePlugin from '../main';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type { EChartsOption } from 'echarts';
import { BasesData } from '../charts/transformers/base';

export class CalendarChartView extends BaseChartView {
    readonly type = 'calendar-chart';

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
            },
            ...BaseChartView.getVisualMapViewOptions()
        ];
    }

    protected getChartOption(data: BasesData): EChartsOption | null {
        const dateProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string;
        const valueProp = this.config.get(BaseChartView.VALUE_PROP_KEY) as string;

        if (!dateProp) {return null;}

        const visualMapMin = this.config.get(BaseChartView.VISUAL_MAP_MIN_KEY) ? Number(this.config.get(BaseChartView.VISUAL_MAP_MIN_KEY)) : undefined;
        const visualMapMax = this.config.get(BaseChartView.VISUAL_MAP_MAX_KEY) ? Number(this.config.get(BaseChartView.VISUAL_MAP_MAX_KEY)) : undefined;
        const visualMapColor = (this.config.get(BaseChartView.VISUAL_MAP_COLOR_KEY) as string)?.split(',').map(s => s.trim()).filter(Boolean);
        const visualMapOrient = this.config.get(BaseChartView.VISUAL_MAP_ORIENT_KEY) as 'horizontal' | 'vertical' | undefined;
        const visualMapType = this.config.get(BaseChartView.VISUAL_MAP_TYPE_KEY) as 'continuous' | 'piecewise' | undefined;

        return transformDataToChartOption(data, dateProp, '', 'calendar', {
            valueProp: valueProp,
            visualMapMin: !Number.isNaN(visualMapMin) ? visualMapMin : undefined,
            visualMapMax: !Number.isNaN(visualMapMax) ? visualMapMax : undefined,
            visualMapColor: visualMapColor && visualMapColor.length > 0 ? visualMapColor : undefined,
            visualMapOrient,
            visualMapType
        });
    }
}
