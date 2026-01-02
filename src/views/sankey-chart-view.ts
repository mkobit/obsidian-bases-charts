import { ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { ChartType } from '../charts/transformer';

export class SankeyChartView extends BaseChartView {
    type = 'sankey';

    getChartType(): ChartType {
        return 'sankey';
    }

    static getViewOptions(): ViewOption[] {
        return [
            ...BaseChartView.getCommonViewOptions(),
            {
                name: 'Value Property',
                key: BaseChartView.VALUE_PROP_KEY,
                type: 'text',
                description: 'Property to use for link value (thickness). Default is count.',
            }
        ];
    }
}
