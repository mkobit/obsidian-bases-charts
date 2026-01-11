import { ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { ChartType } from '../charts/transformers/base';
import { PictorialBarTransformerOptions } from '../charts/transformers/pictorial-bar';

export class PictorialBarChartView extends BaseChartView<PictorialBarTransformerOptions> {
    type: ChartType = 'pictorialBar';

    getChartOption(data: any) {
        // Access config via this.config.get()
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string;
        const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY) as string;

        return this.transformData(data, xProp, yProp);
    }

    static getViewOptions(): ViewOption[] {
        return [
            ...BaseChartView.getCommonViewOptions(),
            ...BaseChartView.getAxisViewOptions(),
            {
                key: 'symbol',
                displayName: 'Symbol',
                type: 'dropdown',
                description: 'The shape of the bar.',
                options: {
                    circle: 'Circle',
                    rect: 'Rectangle',
                    roundRect: 'Rounded Rectangle',
                    triangle: 'Triangle',
                    diamond: 'Diamond',
                    pin: 'Pin',
                    arrow: 'Arrow',
                    none: 'None'
                }
            },
            {
                key: 'symbolRepeat',
                displayName: 'Symbol Repeat',
                type: 'dropdown',
                description: 'Whether to repeat the symbol.',
                options: {
                    'false': 'No Repeat',
                    'true': 'Repeat to Fit',
                    'fixed': 'Fixed Repeat'
                }
            },
            {
                key: 'symbolClip',
                displayName: 'Symbol Clip',
                type: 'toggle',
                description: 'Whether to clip the symbol.'
            },
            {
                key: 'symbolSize',
                displayName: 'Symbol Size',
                type: 'text',
                description: 'Size of the symbol (number or percentage).'
            }
        ];
    }
}
