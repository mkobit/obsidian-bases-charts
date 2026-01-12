import type { QueryController, ViewOption } from 'obsidian';
import { Notice } from 'obsidian';
import { BaseChartView } from './base-chart-view';
import * as echarts from 'echarts';
import { transformDataToChartOption } from '../charts/transformer';
import type BarePlugin from '../main';
import type { EChartsOption } from 'echarts';
import type { BasesData } from '../charts/transformers/base';

export class MapChartView extends BaseChartView {
	readonly type = 'map-chart';
	private registeredMapName: string | null = null;

	public static readonly MAP_FILE_KEY = 'mapFile';
	public static readonly REGION_PROP_KEY = 'regionProp';

	constructor(controller: Readonly<QueryController>, scrollEl: Readonly<HTMLElement>, plugin: Readonly<BarePlugin>) {
		super(
			controller,
			scrollEl,
			plugin,
		);
	}

	protected renderChart(_?: unknown): void {
		const mapFile = this.config.get(MapChartView.MAP_FILE_KEY) as string;

		if (!mapFile) {
			// No map file selected, clear or show empty
			this.executeRender();
			return;
		}

		if (this.registeredMapName === mapFile) {
			// Map already registered
			this.executeRender();
			return;
		}

		// Load map asynchronously
		void (async () => {
			try {
				const adapter = this.plugin.app.vault.adapter;
				if (!(await adapter.exists(mapFile))) {
					new Notice(`Map file not found: ${mapFile}`);
					return;
				}

				const content = await adapter.read(mapFile);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const geoJson = JSON.parse(content);

				echarts.registerMap(
					mapFile,
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					geoJson,
				);
				this.registeredMapName = mapFile;
				this.executeRender();
			} catch (e) {
				console.error(
					'Failed to load map file',
					e,
				);
				new Notice(`Failed to load map file: ${mapFile}`);
			}
		})();
	}

	protected getChartOption(data: BasesData): EChartsOption | null {
		const mapFile = this.config.get(MapChartView.MAP_FILE_KEY) as string;
		const regionProp = this.config.get(MapChartView.REGION_PROP_KEY) as string;
		const valueProp = this.config.get(BaseChartView.VALUE_PROP_KEY) as string;

		if (!mapFile || this.registeredMapName !== mapFile) {
			// If map isn't ready or doesn't match config, return null (wait for renderChart to load it)
			return null;
		}

		const visualMapMin = this.config.get(BaseChartView.VISUAL_MAP_MIN_KEY) ? Number(this.config.get(BaseChartView.VISUAL_MAP_MIN_KEY)) : undefined;
		const visualMapMax = this.config.get(BaseChartView.VISUAL_MAP_MAX_KEY) ? Number(this.config.get(BaseChartView.VISUAL_MAP_MAX_KEY)) : undefined;
		const visualMapColor = (this.config.get(BaseChartView.VISUAL_MAP_COLOR_KEY) as string)?.split(',').map(s => s.trim()).filter(Boolean);
		const visualMapOrient = this.config.get(BaseChartView.VISUAL_MAP_ORIENT_KEY) as 'horizontal' | 'vertical' | undefined;
		const visualMapType = this.config.get(BaseChartView.VISUAL_MAP_TYPE_KEY) as 'continuous' | 'piecewise' | undefined;

		return transformDataToChartOption(
			data,
			'Map Chart', // Dummy xProp for title if needed, or we can adjust transformer signature
			valueProp,
			'map',
			{
				...this.getCommonTransformerOptions(),
				mapName: mapFile,
				regionProp: regionProp,
				valueProp: valueProp,
				visualMapMin: !Number.isNaN(visualMapMin) ? visualMapMin : undefined,
				visualMapMax: !Number.isNaN(visualMapMax) ? visualMapMax : undefined,
				visualMapColor: visualMapColor && visualMapColor.length > 0 ? visualMapColor : undefined,
				visualMapOrient,
				visualMapType,
			},
		);
	}

	static getViewOptions(_?: unknown): ViewOption[] {
		return [
			{
				displayName: 'Map File Path',
				type: 'text',
				key: MapChartView.MAP_FILE_KEY,
				placeholder: 'Path to GeoJSON (e.g. Maps/USA.json)',
			},
			{
				displayName: 'Region Property',
				type: 'property',
				key: MapChartView.REGION_PROP_KEY,
				placeholder: 'Property matching map regions',
			},
			{
				displayName: 'Value Property',
				type: 'property',
				key: BaseChartView.VALUE_PROP_KEY,
				placeholder: 'Metric (e.g. Population)',
			},
			...BaseChartView.getCommonViewOptions().filter(o => {
				const key = (o as { key?: string }).key;
				return key !== BaseChartView.X_AXIS_PROP_KEY && key !== BaseChartView.Y_AXIS_PROP_KEY && key !== BaseChartView.SERIES_PROP_KEY;
			}),
			{
				displayName: 'Chart Title',
				type: 'text',
				key: BaseChartView.X_AXIS_LABEL_KEY, // Reusing X-Axis Label as Title for Maps
				placeholder: 'Optional chart title',
			},
			...BaseChartView.getVisualMapViewOptions(),
		];
	}
}
