import { describe, it, expect } from 'vitest';
import { createPolarBarChartOption } from '../../src/charts/transformers/polar-bar';
import type { BarSeriesOption } from 'echarts';

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
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
        const angleAxis = option.angleAxis as any;
        expect(angleAxis.type).toBe('category');
        expect(angleAxis.data).toEqual(['A', 'B']);

        // Assert series
        expect(option.series).toHaveLength(1);
        const series = Array.isArray(option.series) ? option.series[0] : option.series;
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const barSeries = series as BarSeriesOption;

        expect(barSeries.type).toBe('bar');
        expect(barSeries.coordinateSystem).toBe('polar');
        expect(barSeries.encode).toEqual({ angle: 'x', radius: 'y' });
    });

    it('should support series grouping', () => {
        const option = createPolarBarChartOption(data, 'angle', 'value', { seriesProp: 'group' });

        expect(option.series).toHaveLength(2);

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const s1 = (option.series as BarSeriesOption[])[0];
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const s2 = (option.series as BarSeriesOption[])[1];

        expect(s1.name).toBe('G1');
        expect(s2.name).toBe('G2');

        expect(s1.coordinateSystem).toBe('polar');
        expect(s2.coordinateSystem).toBe('polar');
    });

    it('should support stacking', () => {
        const option = createPolarBarChartOption(data, 'angle', 'value', { stack: true });

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const series = (option.series as BarSeriesOption[])[0];
        expect(series.stack).toBe('total');
    });

    it('should support stacking with grouping', () => {
        const option = createPolarBarChartOption(data, 'angle', 'value', { seriesProp: 'group', stack: true });

        expect(option.series).toHaveLength(2);
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const s1 = (option.series as BarSeriesOption[])[0];
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const s2 = (option.series as BarSeriesOption[])[1];

        expect(s1.stack).toBe('total');
        expect(s2.stack).toBe('total');
    });
});
