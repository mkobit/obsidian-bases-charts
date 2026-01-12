import type { ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import type { ChartType, BasesData } from '../charts/transformers/base';
import type { PictorialBarTransformerOptions } from '../charts/transformers/pictorial-bar';
import { transformDataToChartOption } from '../charts/transformer';

export class PictorialBarChartView extends BaseChartView {
	type: ChartType = 'pictorialBar';

	getChartOption(data: BasesData) {
		const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string;
		const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY) as string;

		const options: PictorialBarTransformerOptions = {
			...this.getCommonTransformerOptions(),
			seriesProp: this.config.get(BaseChartView.SERIES_PROP_KEY) as string,
			symbol: this.config.get('symbol') as string,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
			symbolRepeat: this.config.get('symbolRepeat') as any,
			symbolClip: this.config.get('symbolClip') as boolean,
			symbolSize: this.config.get('symbolSize') as string | number,
		};

		return transformDataToChartOption(
			data,
			xProp,
			yProp,
			'pictorialBar',
			options,
		);
	}

	static getViewOptions(): ViewOption[] {
		return [
			...BaseChartView.getCommonViewOptions(),
			...BaseChartView.getAxisViewOptions(),
			{
				key: 'symbol',
				displayName: 'Symbol',
				type: 'dropdown',
				// description removed as it is not supported
				options: {
					circle: 'Circle',
					rect: 'Rectangle',
					roundRect: 'Rounded Rectangle',
					triangle: 'Triangle',
					diamond: 'Diamond',
					pin: 'Pin',
					arrow: 'Arrow',
					none: 'None',
				},
			} as ViewOption,
			{
				key: 'symbolRepeat',
				displayName: 'Symbol Repeat',
				type: 'dropdown',
				options: {
					'false': 'No Repeat',
					'true': 'Repeat to Fit',
					'fixed': 'Fixed Repeat',
				},
			} as ViewOption,
			{
				key: 'symbolClip',
				displayName: 'Symbol Clip',
				type: 'toggle',
			},
			{
				key: 'symbolSize',
				displayName: 'Symbol Size',
				type: 'text',
				placeholder: 'Size of the symbol (number or percentage)',
			},
		];
	}
}
