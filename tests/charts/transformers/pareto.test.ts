import { describe, it, expect } from 'vitest';
import { createParetoChartOption } from '../../../src/charts/transformers/pareto';

describe('createParetoChartOption', () => {
    const data = [
        { category: 'A', value: 10 },
        { category: 'B', value: 40 },
        { category: 'C', value: 30 },
        { category: 'D', value: 20 },
    ];

    it('should sort data by value descending', () => {
        const option = createParetoChartOption(data, 'category', 'value');
        const dataset = option.dataset as { source: any[] };
        const source = dataset.source;

        expect(source[0].name).toBe('B');
        expect(source[0].value).toBe(40);
        expect(source[1].name).toBe('C');
        expect(source[1].value).toBe(30);
        expect(source[2].name).toBe('D');
        expect(source[2].value).toBe(20);
        expect(source[3].name).toBe('A');
        expect(source[3].value).toBe(10);
    });

    it('should calculate cumulative percentage correctly', () => {
        const option = createParetoChartOption(data, 'category', 'value');
        const dataset = option.dataset as { source: any[] };
        const source = dataset.source;

        // Total = 100
        // B: 40 -> 40%
        // C: 30 -> 70%
        // D: 20 -> 90%
        // A: 10 -> 100%

        expect(source[0].cumulative).toBe(40);
        expect(source[1].cumulative).toBe(70);
        expect(source[2].cumulative).toBe(90);
        expect(source[3].cumulative).toBe(100);
    });

    it('should configure dual y-axes', () => {
        const option = createParetoChartOption(data, 'category', 'value');
        const yAxis = option.yAxis as any[];

        expect(yAxis).toHaveLength(2);
        expect(yAxis[0].name).toBe('value');
        expect(yAxis[1].name).toBe('Cumulative %');
        expect(yAxis[1].min).toBe(0);
        expect(yAxis[1].max).toBe(100);
    });

    it('should configure bar and line series on correct axes', () => {
        const option = createParetoChartOption(data, 'category', 'value');
        const series = option.series as any[];

        expect(series).toHaveLength(2);

        const barSeries = series[0];
        expect(barSeries.type).toBe('bar');
        expect(barSeries.yAxisIndex).toBe(0);
        expect(barSeries.encode).toEqual({ x: 'name', y: 'value' });

        const lineSeries = series[1];
        expect(lineSeries.type).toBe('line');
        expect(lineSeries.yAxisIndex).toBe(1);
        expect(lineSeries.encode).toEqual({ x: 'name', y: 'cumulative' });
    });

    it('should handle custom axis labels', () => {
        const option = createParetoChartOption(data, 'category', 'value', {
            xAxisLabel: 'Cat',
            yAxisLabel: 'Val'
        });

        const xAxis = option.xAxis as any;
        const yAxis = option.yAxis as any[];

        expect(xAxis.name).toBe('Cat');
        expect(yAxis[0].name).toBe('Val');
    });

    it('should filter out invalid values', () => {
        const dirtyData = [
            { category: 'A', value: 10 },
            { category: 'B', value: 'invalid' },
            { category: 'C', value: 20 }
        ];

        const option = createParetoChartOption(dirtyData, 'category', 'value');
        const dataset = option.dataset as { source: any[] };
        const source = dataset.source;

        expect(source).toHaveLength(2);
        expect(source[0].name).toBe('C');
        expect(source[1].name).toBe('A');

        // C: 20 (66.6%), A: 10 (100%) - Total 30
        expect(source[0].cumulative).toBeCloseTo(66.666, 2);
        expect(source[1].cumulative).toBeCloseTo(100, 2);
    });
});
