import { describe, it, expect } from 'vitest';
import { transformDataToChartOption } from '../src/charts/transformer';

describe('transformDataToChartOption', () => {
    it('should transform simple flat data', () => {
        const data = [
            { category: 'A', value: 10 },
            { category: 'B', value: 20 },
        ];
        const option = transformDataToChartOption(data, 'category', 'value');

        // Check xAxis
        expect(option.xAxis).toEqual(expect.objectContaining({
            type: 'category',
            data: ['A', 'B'],
            name: 'category'
        }));

        // Check yAxis
        expect(option.yAxis).toEqual(expect.objectContaining({
            type: 'value',
            name: 'value'
        }));

        // Check series
        const series = Array.isArray(option.series) ? option.series[0] : option.series;
        expect(series).toBeDefined();
        if (series) {
            expect(series).toEqual(expect.objectContaining({
                type: 'bar',
                data: [10, 20],
                name: 'value'
            }));
        }
    });

    it('should handle numeric values as strings', () => {
        const data = [
            { category: 'A', value: "10" },
            { category: 'B', value: "20.5" },
        ];
        const option = transformDataToChartOption(data, 'category', 'value');

        const series = Array.isArray(option.series) ? option.series[0] : option.series;
        expect(series).toBeDefined();
        if (series) {
            expect(series.data).toEqual([10, 20.5]);
        }
    });

    it('should skip non-numeric values', () => {
        const data = [
            { category: 'A', value: 10 },
            { category: 'B', value: "invalid" },
            { category: 'C', value: 30 },
        ];
        const option = transformDataToChartOption(data, 'category', 'value');

        // Expect B to be skipped or handled?
        // Current implementation skips
        expect(option.xAxis).toEqual(expect.objectContaining({
            data: ['A', 'C']
        }));

        const series = Array.isArray(option.series) ? option.series[0] : option.series;
        expect(series).toBeDefined();
        if (series) {
            expect(series.data).toEqual([10, 30]);
        }
    });

    it('should handle nested properties', () => {
        const data = [
            { meta: { name: 'A' }, stats: { count: 100 } },
            { meta: { name: 'B' }, stats: { count: 200 } },
        ];
        const option = transformDataToChartOption(data, 'meta.name', 'stats.count');

        expect(option.xAxis).toEqual(expect.objectContaining({
            data: ['A', 'B']
        }));

        const series = Array.isArray(option.series) ? option.series[0] : option.series;
        expect(series).toBeDefined();
        if (series) {
            expect(series.data).toEqual([100, 200]);
        }
    });

    it('should handle undefined values gracefully', () => {
         const data = [
            { category: 'A', value: 10 },
            { value: 20 }, // Missing category
        ];
        const option = transformDataToChartOption(data, 'category', 'value');

        expect(option.xAxis).toEqual(expect.objectContaining({
            data: ['A', 'Unknown']
        }));

         const series = Array.isArray(option.series) ? option.series[0] : option.series;
        expect(series).toBeDefined();
        if (series) {
            expect(series.data).toEqual([10, 20]);
        }
    });

    it('should create a line chart when specified', () => {
        const data = [
            { category: 'A', value: 10 },
            { category: 'B', value: 20 },
        ];
        const option = transformDataToChartOption(data, 'category', 'value', 'line');

        const series = Array.isArray(option.series) ? option.series[0] : option.series;
        expect(series).toBeDefined();
        if (series) {
            expect(series).toEqual(expect.objectContaining({
                type: 'line',
                data: [10, 20],
                name: 'value'
            }));
        }
    });

    it('should apply line chart options', () => {
        const data = [{ category: 'A', value: 10 }];
        const option = transformDataToChartOption(data, 'category', 'value', 'line', {
            smooth: true,
            showSymbol: false,
            areaStyle: true
        });

        const series = Array.isArray(option.series) ? option.series[0] : option.series;
        expect(series).toBeDefined();
        if (series) {
            // Because echarts types are loose here in test context (or we used any in implementation temporarily for seriesItem),
            // we check if properties are present.
            expect(series).toHaveProperty('smooth', true);
            expect(series).toHaveProperty('showSymbol', false);
            expect(series).toHaveProperty('areaStyle');
        }
    });
});
