
import type { ViewOption } from 'obsidian';
import { t } from '../lang/helpers';
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
				displayName: t('Source Property'),
				type: 'property',
				placeholder: t('Property for the source node name'),
			},
			{
				key: 'targetProp',
				displayName: t('Target Property'),
				type: 'property',
				placeholder: t('Property for the target node name'),
			},
			{
				key: 'valueProp',
				displayName: t('Value Property (Optional)'),
				type: 'property',
				placeholder: t('Optional property for link weight/value'),
			},
			{
				key: 'categoryProp',
				displayName: t('Category Property (Optional)'),
				type: 'property',
				placeholder: t('Optional property for node grouping/color'),
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
