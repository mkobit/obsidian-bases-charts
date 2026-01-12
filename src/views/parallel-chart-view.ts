import type { ViewOption } from 'obsidian';
import { t } from '../lang/i18n';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type { ParallelTransformerOptions } from '../charts/transformer';
import type { EChartsOption } from 'echarts';
import type { BasesData } from '../charts/transformers/base';

export class ParallelChartView extends BaseChartView {
	readonly type = 'parallel';

	static getViewOptions(_?: unknown): ViewOption[] {
		return [
			{
				displayName: t('view_options.specific.dimensions'),
				key: 'xProp', // repurpose xProp for dimensions list
				type: 'text',
				placeholder: t('view_options.specific.dimensions_placeholder'),
			},
			{
				displayName: t('view_options.specific.series'),
				key: 'seriesProp',
				type: 'property',
				placeholder: t('view_options.specific.series_group_placeholder'),
			},
			...BaseChartView.getCommonViewOptions(),
		];
	}

	getChartOption(data: BasesData): EChartsOption {
		const xProp = this.config.get('xProp') as string;
		const seriesProp = this.config.get('seriesProp') as string;

		const options: ParallelTransformerOptions = {
			...this.getCommonTransformerOptions(),
			seriesProp,
		};

		return transformDataToChartOption(
			data,
			xProp,
			'',
			'parallel',
			options,
		);
	}
}
