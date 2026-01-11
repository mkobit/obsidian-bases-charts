import { describe, it, expect } from 'vitest';
import { createBulletChartOption } from '../../../src/charts/transformers/bullet';
import type { BarSeriesOption, ScatterSeriesOption, DatasetComponentOption } from 'echarts';

describe('createBulletChartOption', () => {
    const data = [
        { category: 'A', value: 10, target: 12 },
        { category: 'B', value: 20, target: 18 },
        { category: 'C', value: 15 }, // Missing target
        { category: 'D', value: null, target: 10 }
    ];

    it('should create a bullet chart with bar and scatter series', () => {
        const option = createBulletChartOption(data, 'category', 'value', { targetProp: 'target' });

        expect(option.series).toHaveLength(2);
        const [barSeries, scatterSeries] = option.series as [BarSeriesOption, ScatterSeriesOption];

        expect(barSeries.type).toBe('bar');
        expect(barSeries.encode).toEqual({ x: 'x', y: 'y' });

        expect(scatterSeries.type).toBe('scatter');
        expect(scatterSeries.encode).toEqual({ x: 'x', y: 't' });
        expect(scatterSeries.symbol).toBe('rect');
        expect(scatterSeries.symbolSize).toEqual([40, 4]); // Default vertical bar, horizontal marker
    });

    it('should handle flipped axis correctly', () => {
        const option = createBulletChartOption(data, 'category', 'value', { targetProp: 'target', flipAxis: true });

        const [barSeries, scatterSeries] = option.series as [BarSeriesOption, ScatterSeriesOption];

        expect(barSeries.encode).toEqual({ x: 'y', y: 'x' }); // x=value, y=category
        expect(scatterSeries.encode).toEqual({ x: 't', y: 'x' }); // x=target, y=category
        expect(scatterSeries.symbolSize).toEqual([4, 40]); // Horizontal bar, vertical marker
    });

    it('should handle missing target property gracefully', () => {
        const option = createBulletChartOption(data, 'category', 'value', { targetProp: undefined });

        expect(option.series).toHaveLength(1);
        const [barSeries] = option.series as [BarSeriesOption];
        expect(barSeries.type).toBe('bar');
    });

    it('should normalize data correctly', () => {
        const option = createBulletChartOption(data, 'category', 'value', { targetProp: 'target' });

        const dataset = option.dataset as DatasetComponentOption[];
        expect(dataset).toBeDefined();
        expect(dataset).toHaveLength(1);

        // Use type narrowing via casting to satisfy strict lint rules
        const source = (dataset[0] as DatasetComponentOption).source as Array<{ x: string, y: number | null, t: number | null }>;

        expect(source).toEqual([
            { x: 'A', y: 10, t: 12 },
            { x: 'B', y: 20, t: 18 },
            { x: 'C', y: 15, t: null },
            { x: 'D', y: 0, t: 10 } // value: null -> 0 (standard behavior)
        ]);
    });
});
