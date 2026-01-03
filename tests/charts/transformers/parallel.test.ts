import { describe, it, expect } from 'vitest';
import { createParallelChartOption } from '../../../src/charts/transformers/parallel';
import type { ParallelSeriesOption } from 'echarts';

interface ParallelAxisOption {
    dim: number;
    name: string;
    type?: 'value' | 'category' | 'time' | 'log';
    data?: (string | number)[];
}

describe('createParallelChartOption', () => {
    it('should create a basic parallel chart with numeric dimensions', () => {
        const data = [
            { a: 10, b: 20 },
            { a: 15, b: 25 },
        ];
        const dimensions = 'a, b';
        const option = createParallelChartOption(data, dimensions, '');

        expect(option.parallel).toBeDefined();
        // Use type assertion to avoid any
        const axes = option.parallelAxis as ParallelAxisOption[];
        expect(axes).toHaveLength(2);

        // Check axes
        expect(axes[0]!.name).toBe('a');
        expect(axes[0]!.type).toBe('value');
        expect(axes[1]!.name).toBe('b');
        expect(axes[1]!.type).toBe('value');

        // Check series
        const series = option.series as ParallelSeriesOption[];
        expect(series).toHaveLength(1);
        expect(series[0]!.type).toBe('parallel');
        expect(series[0]!.data).toHaveLength(2);
        expect(series[0]!.data![0]).toEqual([10, 20]);
        expect(series[0]!.data![1]).toEqual([15, 25]);
    });

    it('should handle categorical dimensions', () => {
        const data = [
            { cat: 'A', val: 1 },
            { cat: 'B', val: 2 },
        ];
        const dimensions = 'cat, val';
        const option = createParallelChartOption(data, dimensions, '');

        const axes = option.parallelAxis as ParallelAxisOption[];
        expect(axes[0]!.name).toBe('cat');
        expect(axes[0]!.type).toBe('category');
        expect(axes[0]!.data).toContain('A');
        expect(axes[0]!.data).toContain('B');

        expect(axes[1]!.name).toBe('val');
        expect(axes[1]!.type).toBe('value');

        const series = option.series as ParallelSeriesOption[];
        expect(series[0]!.data![0]).toEqual(['A', 1]);
        expect(series[0]!.data![1]).toEqual(['B', 2]);
    });

    it('should handle grouping via seriesProp', () => {
        const data = [
            { group: 'G1', a: 1 },
            { group: 'G1', a: 2 },
            { group: 'G2', a: 3 },
        ];
        const dimensions = 'a';
        const option = createParallelChartOption(data, dimensions, '', { seriesProp: 'group', legend: true });

        const series = option.series as ParallelSeriesOption[];
        expect(series).toHaveLength(2);

        const g1 = series.find(s => s.name === 'G1');
        const g2 = series.find(s => s.name === 'G2');

        expect(g1).toBeDefined();
        expect(g1!.data).toHaveLength(2);
        expect(g1!.data![0]).toEqual([1]);

        expect(g2).toBeDefined();
        expect(g2!.data).toHaveLength(1);
        expect(g2!.data![0]).toEqual([3]);

        expect(option.legend).toBeDefined();
    });

    it('should return empty object if no dimensions', () => {
        const data = [{ a: 1 }];
        const option = createParallelChartOption(data, '', '');
        expect(option).toEqual({});
    });
});
