import type { QueryController, ViewOption } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';
import type { BasesData } from '../charts/transformers/base';

export class BarChartView extends BaseChartView {
	readonly type = 'bar-chart';

	constructor(controller: Readonly<QueryController>, scrollEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
		super(
			controller,
			scrollEl,
			plugin,
		);
	}

	protected getChartOption(data: BasesData): EChartsOption | null {
		const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
		const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);
		const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY);

		if (typeof xProp !== 'string' || typeof yProp !== 'string') {
			return null;
		}

		return transformDataToChartOption(
			data,
			xProp,
			yProp,
			'bar',
			{
				...this.getCommonTransformerOptions(),
				seriesProp: typeof seriesProp === 'string' ? seriesProp : undefined,
			},
		);
	}

	static getViewOptions(_?: unknown): ViewOption[] {
		return [...BaseChartView.getCommonViewOptions(),
			...BaseChartView.getAxisViewOptions()];
	}
}
