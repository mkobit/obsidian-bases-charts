import { describe, it, expect } from 'vitest';
import { createParallelChartOption, ParallelAxisOption } from '../../../src/charts/transformers/parallel';

describe('createParallelChartOption', () => {
    const mockData = [
        { name: 'A', price: 10, weight: 100, category: 'Tech' },
        { name: 'B', price: 20, weight: 200, category: 'Tech' },
        { name: 'C', price: 15, weight: 150, category: 'Food' },
    ];

    it('should return empty object if no dimensions provided', () => {
        const option = createParallelChartOption(mockData, '');
        expect(option).toEqual({});
    });

    it('should create parallel axis for numeric dimensions', () => {
        const option = createParallelChartOption(mockData, 'price, weight');

        expect(option.parallelAxis).toBeDefined();
        const axes = option.parallelAxis as ParallelAxisOption[];
        expect(axes.length).toBe(2);

        expect(axes[0].name).toBe('price');
        expect(axes[0].type).toBe('value');

        expect(axes[1].name).toBe('weight');
        expect(axes[1].type).toBe('value');
    });

    it('should create parallel axis for categorical dimensions', () => {
        const option = createParallelChartOption(mockData, 'category');

        expect(option.parallelAxis).toBeDefined();
        const axes = option.parallelAxis as ParallelAxisOption[];
        expect(axes.length).toBe(1);

        expect(axes[0].name).toBe('category');
        expect(axes[0].type).toBe('category');
        expect(axes[0].data).toEqual(['Food', 'Tech']); // sorted
    });

    it('should create single series if no grouping', () => {
        const option = createParallelChartOption(mockData, 'price, weight');

        expect(option.series).toBeDefined();
        const series = option.series as any[];
        expect(series.length).toBe(1);
        expect(series[0].type).toBe('parallel');
        expect(series[0].data).toEqual([
            [10, 100],
            [20, 200],
            [15, 150]
        ]);
    });

    it('should create multiple series if grouping provided', () => {
        const option = createParallelChartOption(mockData, 'price, weight', { seriesProp: 'category' });

        expect(option.series).toBeDefined();
        const series = option.series as any[];
        expect(series.length).toBe(2); // Tech, Food (order might vary based on object keys)

        const techSeries = series.find(s => s.name === 'Tech');
        expect(techSeries).toBeDefined();
        expect(techSeries.data).toEqual([
            [10, 100],
            [20, 200]
        ]);

        const foodSeries = series.find(s => s.name === 'Food');
        expect(foodSeries).toBeDefined();
        expect(foodSeries.data).toEqual([
            [15, 150]
        ]);
    });

    it('should handle mixed numeric and categorical dimensions', () => {
         const option = createParallelChartOption(mockData, 'price, category');
         const series = option.series as any[];

         // Axis 0: price (value)
         // Axis 1: category (category) -> 'Tech', 'Food'

         expect(series[0].data[0]).toEqual([10, 'Tech']);
         expect(series[0].data[1]).toEqual([20, 'Tech']);
         expect(series[0].data[2]).toEqual([15, 'Food']);
    });
});
