import type { QueryController, ViewOption } from 'obsidian';
import type BarePlugin from '../main';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type { EChartsOption } from 'echarts';

export class TreeChartView extends BaseChartView {
    type = 'tree-chart';

    constructor(controller: QueryController, containerEl: HTMLElement, plugin: BarePlugin) {
        super(controller, containerEl, plugin);
    }

    getViewType(): string { return 'tree-chart'; }
    getDisplayText(): string { return 'Tree'; }
    getIcon(): string { return 'network'; }

    static getViewOptions(): ViewOption[] {
        return [
            {
                displayName: 'Path property (e.g. "Folder/Subfolder")',
                type: 'property',
                key: BaseChartView.X_AXIS_PROP_KEY,
                placeholder: 'Select path property',
            }
        ];
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const pathProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string;
        if (!pathProp) {return null;}

        return transformDataToChartOption(data, pathProp, '', 'tree', {});
    }
}
