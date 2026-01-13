import type { ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import type { BasesData } from '../charts/transformers/base';
import type { EChartsOption } from 'echarts';
import { transformDataToChartOption } from '../charts/transformer';

export class PolarScatterChartView extends BaseChartView {
	type = 'polar-scatter-chart';

	getChartOption(data: BasesData): EChartsOption {
		return transformDataToChartOption(
			data,
			this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string,
			this.config.get(BaseChartView.Y_AXIS_PROP_KEY) as string,
			'polarScatter',
			{
				...this.getCommonTransformerOptions(),
				seriesProp: this.config.get(BaseChartView.SERIES_PROP_KEY) as string,
				sizeProp: this.config.get(BaseChartView.SIZE_PROP_KEY) as string,
				visualMapMin: this.config.get(BaseChartView.VISUAL_MAP_MIN_KEY) ? Number(this.config.get(BaseChartView.VISUAL_MAP_MIN_KEY)) : undefined,
				visualMapMax: this.config.get(BaseChartView.VISUAL_MAP_MAX_KEY) ? Number(this.config.get(BaseChartView.VISUAL_MAP_MAX_KEY)) : undefined,
				visualMapColor: this.config.get(BaseChartView.VISUAL_MAP_COLOR_KEY) ? (this.config.get(BaseChartView.VISUAL_MAP_COLOR_KEY) as string).split(',') : undefined,
				visualMapOrient: this.config.get(BaseChartView.VISUAL_MAP_ORIENT_KEY) as 'horizontal' | 'vertical',
				visualMapType: this.config.get(BaseChartView.VISUAL_MAP_TYPE_KEY) as 'continuous' | 'piecewise',
			},
		);
	}

	public static getViewOptions(): ViewOption[] {
		return [
			{
				displayName: 'Angle Property',
				key: BaseChartView.X_AXIS_PROP_KEY,
				type: 'property',
			},
			{
				displayName: 'Radius Property',
				key: BaseChartView.Y_AXIS_PROP_KEY,
				type: 'property',
			},
			{
				displayName: 'Series Property',
				key: BaseChartView.SERIES_PROP_KEY,
				type: 'property',
			},
			{
				displayName: 'Size Property',
				key: BaseChartView.SIZE_PROP_KEY,
				type: 'property',
			},
			{
				displayName: 'Show Legend',
				type: 'toggle',
				key: BaseChartView.LEGEND_KEY,
			},
			{
				displayName: 'Legend Position',
				type: 'dropdown',
				key: BaseChartView.LEGEND_POSITION_KEY,
				options: {
					'top': 'Top',
					'bottom': 'Bottom',
					'left': 'Left',
					'right': 'Right',
				},
			},
			{
				displayName: 'Legend Orientation',
				type: 'dropdown',
				key: BaseChartView.LEGEND_ORIENT_KEY,
				options: {
					'horizontal': 'Horizontal',
					'vertical': 'Vertical',
				},
			},
			{
				displayName: 'Visual Map Min',
				type: 'text',
				key: BaseChartView.VISUAL_MAP_MIN_KEY,
				placeholder: 'Min value (default: auto)',
			},
			{
				displayName: 'Visual Map Max',
				type: 'text',
				key: BaseChartView.VISUAL_MAP_MAX_KEY,
				placeholder: 'Max value (default: auto)',
			},
			{
				displayName: 'Visual Map Colors',
				type: 'text',
				key: BaseChartView.VISUAL_MAP_COLOR_KEY,
				placeholder: 'Comma-separated hex colors (e.g. #fff,#000)',
			},
			{
				displayName: 'Visual Map Orientation',
				type: 'dropdown',
				key: BaseChartView.VISUAL_MAP_ORIENT_KEY,
				options: {
					'horizontal': 'Horizontal',
					'vertical': 'Vertical',
				},
			},
			{
				displayName: 'Visual Map Type',
				type: 'dropdown',
				key: BaseChartView.VISUAL_MAP_TYPE_KEY,
				options: {
					'continuous': 'Continuous',
					'piecewise': 'Piecewise',
				},
			},
			{
				displayName: 'Height',
				type: 'text',
				key: BaseChartView.HEIGHT_KEY,
				placeholder: 'e.g., 500px, 50vh',
			},
		];
	}
}
