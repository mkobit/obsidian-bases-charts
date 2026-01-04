import { describe, it, expect } from 'vitest';
import { transformDataToChartOption } from '../../src/charts/transformer';
import type { PieSeriesOption, EChartsOption } from 'echarts';

describe('Rose Chart Transformer', () => {
    it('should create a rose chart with roseType: area', () => {
        const data = [
            { category: 'A', value: 10 },
            { category: 'B', value: 20 }
        ];

        const option = transformDataToChartOption(data, 'category', 'value', 'rose') as EChartsOption;

        expect(option.series).toBeDefined();
        const series = (Array.isArray(option.series) ? option.series[0] : option.series) as PieSeriesOption;

        expect(series).toBeDefined();
        expect(series.type).toBe('pie');
        expect(series.roseType).toBe('area');
        expect(series.radius).toEqual([20, '75%']);
    });

    it('should map data correctly using dataset', () => {
        const data = [
            { category: 'A', value: 10 },
            { category: 'B', value: 20 }
        ];

        const option = transformDataToChartOption(data, 'category', 'value', 'rose') as EChartsOption;

        // Check dataset instead of series.data
        expect(option.dataset).toBeDefined();
        const source = (option.dataset as any).source;

        expect(source).toHaveLength(2);
        expect(source[0]).toHaveProperty('name', 'A');
        expect(source[0]).toHaveProperty('value', 10);
        expect(source[1]).toHaveProperty('name', 'B');
        expect(source[1]).toHaveProperty('value', 20);

        const series = (Array.isArray(option.series) ? option.series[0] : option.series) as PieSeriesOption;
        expect(series.encode).toEqual({
            itemName: 'name',
            value: 'value'
        });
    });
});
