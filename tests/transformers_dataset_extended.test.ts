import { describe, it, expect } from 'vitest';
import { createScatterChartOption } from '../src/charts/transformers/scatter';
import { createCandlestickChartOption } from '../src/charts/transformers/candlestick';
import type { DatasetComponentOption, ScatterSeriesOption, CandlestickSeriesOption, VisualMapComponentOption } from 'echarts';

interface ScatterDatasetSource {
    readonly x: string;
    readonly y: number;
    readonly s: string;
    readonly size?: number;
}

interface CandlestickDatasetSource {
    readonly x: string;
    readonly open: number;
    readonly close: number;
    readonly low: number;
    readonly high: number;
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

            const datasets = option.dataset as readonly DatasetComponentOption[];
            const sourceDataset = datasets[0] as { readonly source: readonly ScatterDatasetSource[] };
            expect(sourceDataset.source).toHaveLength(3);

            // Check normalization
            expect(sourceDataset.source[0]).toEqual({ x: 'A', y: 10, s: 'G1', size: 5 });

            // Expect G1 and G2 series
            expect(option.series).toHaveLength(2);
            const series = option.series as readonly ScatterSeriesOption[];

            expect(series[0]?.datasetIndex).toBe(1);
            expect(series[0]?.encode).toEqual({ x: 'x', y: 'y', tooltip: ['x', 'y', 'size', 's'] });

            // Symbol size check - now handled via visualMap if sizeProp is present
            if (option.visualMap) {
                // Cast to specific type to avoid unsafe member access
                const visualMap = option.visualMap as VisualMapComponentOption;
                // ECharts VisualMap type definition usually has dimension as number, but we used string.
                // We access it as unknown or check existence to satisfy lint.
                // Or define a local interface if needed.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                expect((visualMap as any).dimension).toBe('size');
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
            const datasets = option.dataset as readonly DatasetComponentOption[];
            const sourceDataset = datasets[0] as { readonly source: readonly CandlestickDatasetSource[] };

            expect(sourceDataset.source).toEqual([{ x: '2023-01-01', open: 10, close: 20, low: 5, high: 25 }]);

            const series = option.series as readonly CandlestickSeriesOption[];
            expect(series[0]?.encode).toEqual({ x: 'x', y: ['open', 'close', 'low', 'high'] });
        });
    });
});
