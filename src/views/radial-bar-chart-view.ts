import type { QueryController, ViewOption } from 'obsidian';
import type BarePlugin from '../main';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type { EChartsOption } from 'echarts';
import type { BasesData } from '../charts/transformers/base';

export class RadialBarChartView extends BaseChartView {
	readonly type = 'radial-bar-chart';

	constructor(controller: Readonly<QueryController>, containerEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
		super(
			controller,
			containerEl,
			plugin,
		);
	}

	static getViewOptions(_?: unknown): ViewOption[] {
		return [
			{
				displayName: 'X-Axis Property',
				type: 'property',
				key: BaseChartView.X_AXIS_PROP_KEY,
				placeholder: 'Select category',
			},
			{
				displayName: 'Y-Axis Property',
				type: 'property',
				key: BaseChartView.Y_AXIS_PROP_KEY,
				placeholder: 'Select value',
			},
			{
				displayName: 'Series Property',
				type: 'property',
				key: BaseChartView.SERIES_PROP_KEY,
				placeholder: 'Select group',
			},
			{
				displayName: 'Stack',
				type: 'toggle',
				key: 'stack',
			},
			...BaseChartView.getCommonViewOptions().filter(opt =>
			// Filter out options that are not applicable to Radial Bar or are already added
			// We keep Legend and Height
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
				(opt as any).key === BaseChartView.LEGEND_KEY ||
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                (opt as any).key === BaseChartView.HEIGHT_KEY ||
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                (opt as any).key === BaseChartView.LEGEND_POSITION_KEY ||
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                (opt as any).key === BaseChartView.LEGEND_ORIENT_KEY),
		];
	}

	protected getChartOption(data: BasesData): EChartsOption | null {
		const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
		const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);
		const seriesProp = this.config.get(BaseChartView.SERIES_PROP_KEY);
		const isStacked = this.config.get('stack') === 'true';

		if (typeof xProp !== 'string' || typeof yProp !== 'string') {
			return null;
		}

		return transformDataToChartOption(
			data,
			xProp,
			yProp,
			'radialBar',
			{
				...this.getCommonTransformerOptions(),
				seriesProp: typeof seriesProp === 'string' ? seriesProp : undefined,
				stack: isStacked,
			},
		);
	}
}
