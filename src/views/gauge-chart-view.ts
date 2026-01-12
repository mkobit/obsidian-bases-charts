import type { QueryController, ViewOption } from 'obsidian';
import { t } from '../lang/i18n';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';
import type { BasesData } from '../charts/transformers/base';

export class GaugeChartView extends BaseChartView {
	readonly type = 'gauge-chart';

	constructor(controller: Readonly<QueryController>, scrollEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
		super(
			controller,
			scrollEl,
			plugin,
		);
	}

	protected getChartOption(data: BasesData): EChartsOption | null {
		const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);
		// Cast BaseChartView to any to access new props
		const minVal = Number(this.config.get(BaseChartView.MIN_VALUE_KEY));
		const maxVal = Number(this.config.get(BaseChartView.MAX_VALUE_KEY));

		if (typeof yProp !== 'string') {
			return null;
		}

		return transformDataToChartOption(
			data,
			'',
			yProp,
			'gauge',
			{
				min: isNaN(minVal) ? 0 : minVal,
				max: isNaN(maxVal) ? 100 : maxVal,
			},
		);
	}

	static getViewOptions(_?: unknown): ViewOption[] {
		return [
			{
				displayName: t('view_options.specific.value'),
				type: 'property',
				key: BaseChartView.Y_AXIS_PROP_KEY,
				placeholder: t('view_options.common.y_axis_placeholder'),
			},
			{
				displayName: t('view_options.specific.min'),
				type: 'text',
				key: BaseChartView.MIN_VALUE_KEY,
				placeholder: t('view_options.specific.min_placeholder'),
			},
			{
				displayName: t('view_options.specific.max'),
				type: 'text',
				key: BaseChartView.MAX_VALUE_KEY,
				placeholder: t('view_options.specific.max_placeholder'),
			},
		];
	}
}
