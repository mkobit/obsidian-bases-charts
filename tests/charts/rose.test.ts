import { describe, it, expect } from 'vitest';
import { transformDataToChartOption } from '../../src/charts/transformer';
import type { PieSeriesOption } from 'echarts';

describe('Rose Chart Transformer', () => {
    it('should create a rose chart with roseType: area', () => {
        const data = [
            { category: 'A', value: 10 },
            { category: 'B', value: 20 }
        ];

        const option = transformDataToChartOption(data, 'category', 'value', 'rose');

        expect(option.series).toBeDefined();
        const series = (Array.isArray(option.series) ? option.series[0] : option.series) as PieSeriesOption;

        expect(series).toBeDefined();
        expect(series.type).toBe('pie');
        expect(series.roseType).toBe('area');
        expect(series.radius).toEqual([20, '75%']);
    });

    it('should map data correctly using series data', () => {
        const data = [
            { category: 'A', value: 10 },
            { category: 'B', value: 20 }
        ];

        const option = transformDataToChartOption(data, 'category', 'value', 'rose');

        // Check series.data instead of dataset
        const series = (Array.isArray(option.series) ? option.series[0] : option.series) as PieSeriesOption;
        expect(series.data).toBeDefined();

        const seriesData = series.data as { name: string; value: number }[];
        expect(seriesData).toHaveLength(2);
        expect(seriesData[0]).toHaveProperty('name', 'A');
        expect(seriesData[0]).toHaveProperty('value', 10);
        expect(seriesData[1]).toHaveProperty('name', 'B');
        expect(seriesData[1]).toHaveProperty('value', 20);
    });
});
