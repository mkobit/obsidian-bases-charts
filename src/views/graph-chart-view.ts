
import type { ViewOption } from 'obsidian';
import { t } from '../lang/i18n';
import { BaseChartView } from './base-chart-view';
import type { ChartType } from '../charts/transformer';
import { transformDataToChartOption } from '../charts/transformer';
import type { BasesData } from '../charts/transformers/base';

export class GraphChartView extends BaseChartView {
	readonly type: ChartType = 'graph';

	static getViewOptions(_?: unknown): ViewOption[] {
		return [
			...BaseChartView.getCommonViewOptions(),
			{
				key: 'sourceProp',
				displayName: t('view_options.specific.source'),
				type: 'property',
				placeholder: t('view_options.specific.source_placeholder'),
			},
			{
				key: 'targetProp',
				displayName: t('view_options.specific.target'),
				type: 'property',
				placeholder: t('view_options.specific.target_placeholder'),
			},
			{
				key: 'valueProp',
				displayName: t('view_options.specific.value_optional'),
				type: 'property',
				placeholder: t('view_options.specific.value_weight_placeholder'),
			},
			{
				key: 'categoryProp',
				displayName: t('view_options.specific.category_optional'),
				type: 'property',
				placeholder: t('view_options.specific.category_group_placeholder'),
			},
		];
	}

	getChartOption(data: BasesData) {
		const sourceProp = this.config.get('sourceProp') as string;
		const targetProp = this.config.get('targetProp') as string;
		const valueProp = this.config.get('valueProp') as string;
		const categoryProp = this.config.get('categoryProp') as string;

		if (!sourceProp || !targetProp) {
			return {};
		}

		return transformDataToChartOption(
			data,
			sourceProp,
			targetProp,
			'graph',
			{
				...this.getCommonTransformerOptions(),
				valueProp,
				categoryProp,
			},
		);
	}
}
