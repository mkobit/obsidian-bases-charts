import { ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { EChartsOption } from 'echarts';
import { transformDataToChartOption } from '../charts/transformer';
import { BasesData } from '../charts/transformers/base';

export class PolarLineChartView extends BaseChartView {
    type = 'polar_line';

    getIcon(): string {
        return 'activity';
    }

    getDisplayName(): string {
        return 'Polar Line Chart';
    }

    getChartOption(data: BasesData): EChartsOption {
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string;
        const yProp = this.config.get(BaseChartView.VALUE_PROP_KEY) as string;
        const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY) as string;
        const isSmooth = this.config.get('smooth') === 'true';
        const hasAreaStyle = this.config.get('areaStyle') === 'true';
        const isStacked = this.config.get('stack') === 'true';

        return transformDataToChartOption(data, xProp, yProp, 'polarLine', {
            ...this.getCommonTransformerOptions(),
            seriesProp,
            smooth: isSmooth,
            areaStyle: hasAreaStyle,
            stack: isStacked,
        });
    }

    static getViewOptions(): ViewOption[] {
        return [
            {
                key: BaseChartView.X_AXIS_PROP_KEY,
                displayName: 'Angle Property',
                type: 'property',
            },
            {
                key: BaseChartView.VALUE_PROP_KEY,
                displayName: 'Radius Property',
                type: 'property',
            },
            {
                key: BaseChartView.SERIES_PROP_KEY,
                displayName: 'Series Property',
                type: 'property',
            },
            {
                key: 'smooth',
                displayName: 'Smooth',
                type: 'toggle',
            },
            {
                key: 'areaStyle',
                displayName: 'Area Style',
                type: 'toggle',
            },
            {
                key: 'stack',
                displayName: 'Stack',
                type: 'toggle',
            },
            ...BaseChartView.getCommonViewOptions(),
        ];
    }
}
