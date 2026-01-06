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
        if (!series) {return;}

        expect(series.type).toBe('pie');
        expect(series.roseType).toBe('area');
        expect(series.radius).toEqual([20, '75%']);
    });

    it('should map data correctly via dataset', () => {
        const data = [
            { category: 'A', value: 10 },
            { category: 'B', value: 20 }
        ];

        const option = transformDataToChartOption(data, 'category', 'value', 'rose') as unknown as { series: PieSeriesOption[], dataset: { source: unknown[] }[] };
        const [series] = option.series;
        if (!series) {
            expect(series).toBeDefined();
            return;
        }

        expect(series.datasetIndex).toBe(0);
        expect(option.dataset).toBeDefined();
        expect(option.dataset[0].source).toHaveLength(2);
        expect(option.dataset[0].source).toEqual([
            { name: 'A', value: 10 },
            { name: 'B', value: 20 }
        ]);
    });
});
