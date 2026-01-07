import type { QueryController, ViewOption } from 'obsidian';
import type BarePlugin from '../main';
import { BaseChartView } from './base-chart-view';
import { transformDataToChartOption } from '../charts/transformer';
import type { EChartsOption } from 'echarts';

export class HeatmapChartView extends BaseChartView {
    type = 'heatmap-chart';

    constructor(controller: QueryController, containerEl: HTMLElement, plugin: BarePlugin) {
        super(controller, containerEl, plugin);
    }

    static getViewOptions(): ViewOption[] {
        return [
            {
                displayName: 'X-Axis Property',
                type: 'property',
                key: BaseChartView.X_AXIS_PROP_KEY,
                placeholder: 'Select category (columns)',
            },
            {
                displayName: 'Y-Axis Property',
                type: 'property',
                key: BaseChartView.Y_AXIS_PROP_KEY,
                placeholder: 'Select category (rows)',
            },
            {
                displayName: 'Value Property',
                type: 'property',
                key: BaseChartView.VALUE_PROP_KEY,
                placeholder: 'Select value property (color)',
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            ...BaseChartView.getAxisViewOptions().filter(opt => (opt as any).key !== BaseChartView.FLIP_AXIS_KEY),
            ...BaseChartView.getVisualMapViewOptions()
        ];
    }

    protected getChartOption(data: Record<string, unknown>[]): EChartsOption | null {
        const xProp = this.config.get(BaseChartView.X_AXIS_PROP_KEY);
        const yProp = this.config.get(BaseChartView.Y_AXIS_PROP_KEY);
        const valueProp = this.config.get(BaseChartView.VALUE_PROP_KEY);

        if (typeof xProp !== 'string' || typeof yProp !== 'string' || typeof valueProp !== 'string') {
            return null;
        }

        const visualMapMin = this.config.get(BaseChartView.VISUAL_MAP_MIN_KEY) ? Number(this.config.get(BaseChartView.VISUAL_MAP_MIN_KEY)) : undefined;
        const visualMapMax = this.config.get(BaseChartView.VISUAL_MAP_MAX_KEY) ? Number(this.config.get(BaseChartView.VISUAL_MAP_MAX_KEY)) : undefined;
        const visualMapColor = (this.config.get(BaseChartView.VISUAL_MAP_COLOR_KEY) as string)?.split(',').map(s => s.trim()).filter(Boolean);
        const visualMapOrient = this.config.get(BaseChartView.VISUAL_MAP_ORIENT_KEY) as 'horizontal' | 'vertical' | undefined;
        const visualMapType = this.config.get(BaseChartView.VISUAL_MAP_TYPE_KEY) as 'continuous' | 'piecewise' | undefined;

        return transformDataToChartOption(data, xProp, yProp, 'heatmap', {
            ...this.getCommonTransformerOptions(),
            valueProp: valueProp,
            visualMapMin: !Number.isNaN(visualMapMin) ? visualMapMin : undefined,
            visualMapMax: !Number.isNaN(visualMapMax) ? visualMapMax : undefined,
            visualMapColor: visualMapColor && visualMapColor.length > 0 ? visualMapColor : undefined,
            visualMapOrient,
            visualMapType
        });
    }
}
