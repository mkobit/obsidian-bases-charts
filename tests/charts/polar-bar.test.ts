import { describe, it, expect } from 'vitest';
import { createPolarBarChartOption } from '../../src/charts/transformers/polar-bar';
import type { BarSeriesOption } from 'echarts';

// Define a minimal interface for the angle axis to avoid 'any'
interface AngleAxisOption {
    readonly type?: string;
    readonly data?: string[];
}

describe('Polar Bar Chart Transformer', () => {
    const data = [
        { angle: 'A', value: 10, group: 'G1' },
        { angle: 'B', value: 20, group: 'G1' },
        { angle: 'A', value: 15, group: 'G2' },
        { angle: 'B', value: 25, group: 'G2' },
    ];

    it('should generate a basic polar bar chart', () => {
        const option = createPolarBarChartOption(data, 'angle', 'value');

        expect(option.polar).toBeDefined();
        expect(option.angleAxis).toBeDefined();
        expect(option.radiusAxis).toBeDefined();

        // Assert angle axis type and data
        const angleAxis = option.angleAxis as AngleAxisOption;
        expect(angleAxis.type).toBe('category');
        expect(angleAxis.data).toEqual(['A', 'B']);

        // Assert series
        expect(option.series).toHaveLength(1);
        // option.series is implicitly Typed, so we can access it safely after checking length
        const series = Array.isArray(option.series) ? option.series[0] : option.series;

        // Use type guard or simple object check instead of assertion if possible, but assertion is fine here if it narrows 'SeriesOption | SeriesOption[]'
        // The issue was ! assertion being unnecessary if Typescript already knew it wasn't null due to previous checks or types.
        // Or it might be that option.series[0] is already inferred correctly enough or not.
        // Let's keep it simple.

        const barSeries = series as BarSeriesOption;

        expect(barSeries.type).toBe('bar');
        expect(barSeries.coordinateSystem).toBe('polar');
        expect(barSeries.encode).toEqual({ angle: 'x', radius: 'y' });
    });

    it('should support series grouping', () => {
        const option = createPolarBarChartOption(data, 'angle', 'value', { seriesProp: 'group' });

        expect(option.series).toHaveLength(2);

        const series = option.series as BarSeriesOption[];
        const s1 = series[0];
        const s2 = series[1];

        // Ensure elements exist
        expect(s1).toBeDefined();
        expect(s2).toBeDefined();

        if (s1 && s2) {
            expect(s1.name).toBe('G1');
            expect(s2.name).toBe('G2');

            expect(s1.coordinateSystem).toBe('polar');
            expect(s2.coordinateSystem).toBe('polar');
        }
    });

    it('should support stacking', () => {
        const option = createPolarBarChartOption(data, 'angle', 'value', { stack: true });

        const series = option.series as BarSeriesOption[];
        expect(series).toBeDefined();

        const s1 = series[0];
        expect(s1).toBeDefined();
        if (s1) {
            expect(s1.stack).toBe('total');
        }
    });

    it('should support stacking with grouping', () => {
        const option = createPolarBarChartOption(data, 'angle', 'value', { seriesProp: 'group', stack: true });

        expect(option.series).toHaveLength(2);

        const series = option.series as BarSeriesOption[];
        const s1 = series[0];
        const s2 = series[1];

        expect(s1).toBeDefined();
        expect(s2).toBeDefined();

        if (s1 && s2) {
            expect(s1.stack).toBe('total');
            expect(s2.stack).toBe('total');
        }
    });
});
