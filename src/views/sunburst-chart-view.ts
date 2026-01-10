import type {
    QueryController,
    ViewOption
} from 'obsidian';
import type BarePlugin from '../main';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type { EChartsOption } from 'echarts';
import { BasesData } from '../charts/transformers/base';

export class SunburstChartView extends BaseChartView {
    readonly type = 'sunburst-chart';

    constructor(controller: Readonly<QueryController>, containerEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
        super(controller, containerEl, plugin);
    }


    getViewType(): string {
        return 'sunburst-chart';
    }


    getDisplayText(): string {
        return 'Sunburst';
    }


    getIcon(): string {
        return 'disc';
    }

    static getViewOptions(_?: unknown): ViewOption[] {
        return [
            {
                displayName: 'Path Property (e.g. "Folder/Subfolder")',
                type: 'property',
                key: BaseChartView.X_AXIS_PROP_KEY,
                placeholder: 'Select path property',
            },
            {
                displayName: 'Value Property',
                type: 'property',
                key: BaseChartView.VALUE_PROP_KEY,
                placeholder: 'Select value property',
            }
        ];
    }

    protected getChartOption(data: BasesData): EChartsOption | null {
        const pathProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string;
        const valueProp = this.config.get(BaseChartView.VALUE_PROP_KEY) as string;

        if (!pathProp) {
            return null;
        }

        return transformDataToChartOption(data, pathProp, '', 'sunburst', {
            valueProp: valueProp
        });
    }
}
