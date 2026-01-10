import type {
    QueryController,
    ViewOption
} from 'obsidian';
import type BarePlugin from '../main';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type { EChartsOption } from 'echarts';
import { BasesData } from '../charts/transformers/base';

export class TreemapChartView extends BaseChartView {
    readonly type = 'treemap-chart';

    constructor(controller: Readonly<QueryController>, containerEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
        super(controller, containerEl, plugin);
    }

    // eslint-disable-next-line functional/functional-parameters
    getViewType(): string {
        return 'treemap-chart';
    }

    // eslint-disable-next-line functional/functional-parameters
    getDisplayText(): string {
        return 'Treemap';
    }

    // eslint-disable-next-line functional/functional-parameters
    getIcon(): string {
        return 'layout-grid'; // Use an icon that looks like a treemap
    }

    static getViewOptions(_?: unknown): ViewOption[] {
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

    protected getChartOption(data: BasesData): EChartsOption | null {
        const nameProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string;
        const valueProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY) as string;

        if (!nameProp || !valueProp) {
            return null;
        }

        return transformDataToChartOption(data, nameProp, valueProp, 'treemap', {});
    }
}
