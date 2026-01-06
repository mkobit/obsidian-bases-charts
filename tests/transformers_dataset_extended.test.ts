import { describe, it, expect } from 'vitest';
import { createScatterChartOption } from '../src/charts/transformers/scatter';
import { createCandlestickChartOption } from '../src/charts/transformers/candlestick';
import type { EChartsOption } from 'echarts';

describe('Transformers with Dataset - Extended', () => {
    describe('Scatter Transformer', () => {
        it('should create options using dataset and transform for grouped data', () => {
            const data = [
                { x: 'A', y: 10, group: 'G1', size: 5 },
                { x: 'A', y: 20, group: 'G2', size: 10 },
                { x: 'B', y: 15, group: 'G1', size: 5 }
            ];

            const option = createScatterChartOption(data, 'x', 'y', { seriesProp: 'group', sizeProp: 'size' });

            expect(option.dataset).toBeDefined();
            expect(Array.isArray(option.dataset)).toBe(true);

            const datasets = option.dataset as any[];
            expect(datasets[0].source).toHaveLength(3);
            // Check normalization
            expect(datasets[0].source[0]).toEqual({ x: 'A', y: 10, s: 'G1', size: 5 });

            // Expect G1 and G2 series
            expect(option.series).toHaveLength(2);
            const series = option.series as any[];

            expect(series[0].datasetIndex).toBe(1);
            expect(series[0].encode).toEqual({ x: 'x', y: 'y', tooltip: ['x', 'y', 'size', 's'] });

            // Symbol size check
            const sizeFn = series[0].symbolSize;
            expect(sizeFn({ size: 20 })).toBe(20);
            expect(sizeFn({ size: -5 })).toBe(0); // Should be max(0, val)
        });
    });

    describe('Candlestick Transformer', () => {
        it('should create options using dataset', () => {
            const data = [
                { date: '2023-01-01', open: 10, close: 20, low: 5, high: 25 }
            ];

            const option = createCandlestickChartOption(data, 'date');

            expect(option.dataset).toBeDefined();
            const datasets = option.dataset as any[];
            expect(datasets[0].source).toEqual([{ x: '2023-01-01', open: 10, close: 20, low: 5, high: 25 }]);

            const series = option.series as any[];
            expect(series[0].encode).toEqual({ x: 'x', y: ['open', 'close', 'low', 'high'] });
        });
    });
});
