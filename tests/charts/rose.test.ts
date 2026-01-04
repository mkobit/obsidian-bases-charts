import { describe, it, expect } from 'vitest';
import { transformDataToChartOption } from '../../src/charts/transformer';
import type { PieSeriesOption } from 'echarts';

interface TestOption {
    series: PieSeriesOption[];
}

describe('Rose Chart Transformer', () => {
    it('should create a rose chart with roseType: area', () => {
        const data = [
            { category: 'A', value: 10 },
            { category: 'B', value: 20 }
        ];

        const option = transformDataToChartOption(data, 'category', 'value', 'rose') as unknown as TestOption;

        expect(option.series).toBeDefined();
        expect(option.series).toHaveLength(1);

        const [series] = option.series;
        expect(series).toBeDefined();
        expect(series.type).toBe('pie');
        expect(series.roseType).toBe('area');
        expect(series.radius).toEqual([20, '75%']);
    });

    it('should map data correctly', () => {
        const data = [
            { category: 'A', value: 10 },
            { category: 'B', value: 20 }
        ];

        const option = transformDataToChartOption(data, 'category', 'value', 'rose') as unknown as TestOption;
        const [series] = option.series;
        const seriesData = series.data as { name: string; value: number }[];

        expect(seriesData).toHaveLength(2);
        expect(seriesData[0]).toEqual({ name: 'A', value: 10 });
        expect(seriesData[1]).toEqual({ name: 'B', value: 20 });
    });
});
