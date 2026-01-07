import { describe, it, expect } from 'vitest';
import { createScatterChartOption } from '../src/charts/transformers/scatter';
import { createCandlestickChartOption } from '../src/charts/transformers/candlestick';
import type { DatasetComponentOption, ScatterSeriesOption, CandlestickSeriesOption } from 'echarts';

interface ScatterDatasetSource {
    x: string;
    y: number;
    s: string;
    size?: number;
}

interface CandlestickDatasetSource {
    x: string;
    open: number;
    close: number;
    low: number;
    high: number;
}

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

            const datasets = option.dataset as DatasetComponentOption[];
            const sourceDataset = datasets[0] as { source: ScatterDatasetSource[] };
            expect(sourceDataset.source).toHaveLength(3);

            // Check normalization
            expect(sourceDataset.source[0]).toEqual({ x: 'A', y: 10, s: 'G1', size: 5 });

            // Expect G1 and G2 series
            expect(option.series).toHaveLength(2);
            const series = option.series as ScatterSeriesOption[];

            expect(series[0]?.datasetIndex).toBe(1);
            expect(series[0]?.encode).toEqual({ x: 'x', y: 'y', tooltip: ['x', 'y', 'size', 's'] });

            // Symbol size check - now handled via visualMap if sizeProp is present
            if (option.visualMap) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                expect((option.visualMap as any).dimension).toBe('size');
            } else {
                 const sizeFn = series[0]?.symbolSize;
                 if (typeof sizeFn === 'function') {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
                    expect(sizeFn({ size: 20 }, {} as any)).toBe(20);
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
                    expect(sizeFn({ size: -5 }, {} as any)).toBe(0); // Should be max(0, val)
                } else {
                    throw new Error('symbolSize should be a function or visualMap should be defined');
                }
            }
        });
    });

    describe('Candlestick Transformer', () => {
        it('should create options using dataset', () => {
            const data = [
                { date: '2023-01-01', open: 10, close: 20, low: 5, high: 25 }
            ];

            const option = createCandlestickChartOption(data, 'date');

            expect(option.dataset).toBeDefined();
            const datasets = option.dataset as DatasetComponentOption[];
            const sourceDataset = datasets[0] as { source: CandlestickDatasetSource[] };

            expect(sourceDataset.source).toEqual([{ x: '2023-01-01', open: 10, close: 20, low: 5, high: 25 }]);

            const series = option.series as CandlestickSeriesOption[];
            expect(series[0]?.encode).toEqual({ x: 'x', y: ['open', 'close', 'low', 'high'] });
        });
    });
});
