import type { QueryController, ViewOption } from 'obsidian';
import type BarePlugin from '../main';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type { EChartsOption } from 'echarts';
import { BasesData } from '../charts/transformers/base';

export class TreeChartView extends BaseChartView {
    readonly type = 'tree-chart';

    constructor(controller: Readonly<QueryController>, containerEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
        super(controller, containerEl, plugin);
    }

    // eslint-disable-next-line functional/functional-parameters
    getViewType(): string { return 'tree-chart'; }
    // eslint-disable-next-line functional/functional-parameters
    getDisplayText(): string { return 'Tree'; }
    // eslint-disable-next-line functional/functional-parameters
    getIcon(): string { return 'network'; }

    static getViewOptions(_?: unknown): ViewOption[] {
        return [
            {
                displayName: 'Path property (e.g. "Folder/Subfolder")',
                type: 'property',
                key: BaseChartView.X_AXIS_PROP_KEY,
                placeholder: 'Select path property',
            }
        ];
    }

    protected getChartOption(data: BasesData): EChartsOption | null {
        const pathProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string;
        if (!pathProp) {return null;}

        return transformDataToChartOption(data, pathProp, '', 'tree', {});
    }
}
