import type {
    QueryController,
    ViewOption
} from 'obsidian';
import type BarePlugin from '../main';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type { EChartsOption } from 'echarts';

export class TreemapChartView extends BaseChartView {
    type = 'treemap-chart';

    constructor(controller: QueryController, containerEl: HTMLElement, plugin: BarePlugin) {
        super(controller, containerEl, plugin);
    }

    getViewType(): string {
        return 'treemap-chart';
    }

    getDisplayText(): string {
        return 'Treemap';
    }

    getIcon(): string {
        return 'layout-grid'; // Use an icon that looks like a treemap
    }

    static getViewOptions(): ViewOption[] {
        return [
            {
                displayName: 'Name Property',
                type: 'property',
                key: BaseChartView.X_AXIS_PROP_KEY, // Map to Name
                placeholder: 'Select name property',
            },
            {
                displayName: 'Value Property',
                type: 'property',
                key: BaseChartView.Y_AXIS_PROP_KEY, // Map to Value
                placeholder: 'Select value property',
            }
        ];
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const nameProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string;
        const valueProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY) as string;

        if (!nameProp || !valueProp) {
            return null;
        }

        return transformDataToChartOption(data, nameProp, valueProp, 'treemap', {});
    }
}
