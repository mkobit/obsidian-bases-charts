import type {
	QueryController,
	ViewOption,
} from 'obsidian';
import type { EChartsOption } from 'echarts';
import { t } from '../lang/i18n';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { BasesData } from '../charts/transformers/base';

export class CandlestickChartView extends BaseChartView {
	// Unique keys for Candlestick
	public static readonly OPEN_PROP_KEY = 'openProp';
	public static readonly CLOSE_PROP_KEY = 'closeProp';
	public static readonly LOW_PROP_KEY = 'lowProp';
	public static readonly HIGH_PROP_KEY = 'highProp';

	readonly type = 'candlestick-chart';

	constructor(controller: Readonly<QueryController>, containerEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
		super(
			controller,
			containerEl,
			plugin,
		);
	}

	protected getChartOption(data: BasesData): EChartsOption | null {
		const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY) as string;
		const xAxisLabel = this.config.get(BaseChartView.X_AXIS_LABEL_KEY) as string;
		const yAxisLabel = this.config.get(BaseChartView.Y_AXIS_LABEL_KEY) as string;
		const xAxisLabelRotate = Number(this.config.get(BaseChartView.X_AXIS_LABEL_ROTATE_KEY));
		const flipAxis = this.config.get(BaseChartView.FLIP_AXIS_KEY) as boolean;

		const openProp = this.config.get(CandlestickChartView.OPEN_PROP_KEY) as string;
		const closeProp = this.config.get(CandlestickChartView.CLOSE_PROP_KEY) as string;
		const lowProp = this.config.get(CandlestickChartView.LOW_PROP_KEY) as string;
		const highProp = this.config.get(CandlestickChartView.HIGH_PROP_KEY) as string;

		if (!xProp || !openProp || !closeProp || !lowProp || !highProp) {
			return null;
		}

		return transformDataToChartOption(
			data,
			xProp,
			'',
			'candlestick',
			{
				xAxisLabel,
				yAxisLabel,
				xAxisLabelRotate,
				flipAxis,
				openProp,
				closeProp,
				lowProp,
				highProp,
			},
		);
	}

	static getViewOptions(_?: unknown): ViewOption[] {
		return [
			{
				displayName: t('view_options.specific.x_date'),
				type: 'property',
				key: BaseChartView.X_AXIS_PROP_KEY,
				placeholder: t('view_options.specific.x_date_placeholder'),
			},
			{
				displayName: t('view_options.specific.open'),
				type: 'property',
				key: CandlestickChartView.OPEN_PROP_KEY,
				placeholder: t('view_options.specific.open_placeholder'),
			},
			{
				displayName: t('view_options.specific.close'),
				type: 'property',
				key: CandlestickChartView.CLOSE_PROP_KEY,
				placeholder: t('view_options.specific.close_placeholder'),
			},
			{
				displayName: t('view_options.specific.low'),
				type: 'property',
				key: CandlestickChartView.LOW_PROP_KEY,
				placeholder: t('view_options.specific.low_placeholder'),
			},
			{
				displayName: t('view_options.specific.high'),
				type: 'property',
				key: CandlestickChartView.HIGH_PROP_KEY,
				placeholder: t('view_options.specific.high_placeholder'),
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
			...BaseChartView.getAxisViewOptions().filter(opt => (opt as any).key !== BaseChartView.FLIP_AXIS_KEY),
		];
	}
}
