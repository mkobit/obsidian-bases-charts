
import { ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption, ChartType } from '../charts/transformer';

export class GraphChartView extends BaseChartView {
    readonly type: ChartType = 'graph';

    // eslint-disable-next-line functional/prefer-readonly-type
    static getViewOptions(): ViewOption[] {
        return [
            ...BaseChartView.getCommonViewOptions(),
            {
                key: 'sourceProp',
                displayName: 'Source Property',
                type: 'property',
                placeholder: 'Property for the source node name'
            },
            {
                key: 'targetProp',
                displayName: 'Target Property',
                type: 'property',
                placeholder: 'Property for the target node name'
            },
            {
                key: 'valueProp',
                displayName: 'Value Property (Optional)',
                type: 'property',
                placeholder: 'Optional property for link weight/value'
            },
            {
                key: 'categoryProp',
                displayName: 'Category Property (Optional)',
                type: 'property',
                placeholder: 'Optional property for node grouping/color'
            }
        ];
    }

    getChartOption(data: readonly Record<string, unknown>[]) {
        const sourceProp = this.config.get('sourceProp') as string;
        const targetProp = this.config.get('targetProp') as string;
        const valueProp = this.config.get('valueProp') as string;
        const categoryProp = this.config.get('categoryProp') as string;

        if (!sourceProp || !targetProp) {
            return {};
        }

        return transformDataToChartOption(data, sourceProp, targetProp, 'graph', {
            ...this.getCommonTransformerOptions(),
            valueProp,
            categoryProp
        });
    }
}
