import { describe, it, expect } from 'vitest';
import { transformDataToChartOption } from '../src/charts/transformer';
import type { HeatmapSeriesOption, DatasetComponentOption } from 'echarts';

interface HeatmapSourceItem {
    x: string;
    y: string;
    value: number;
}

describe('Heatmap Transformer', () => {
    it('should create a valid heatmap option', () => {
        const data = [
            { x: 'Mon', y: 'Morning', val: 5 },
            { x: 'Mon', y: 'Evening', val: 10 },
            { x: 'Tue', y: 'Morning', val: 2 },
            { x: 'Tue', y: 'Evening', val: 20 },
        ];

        const option = transformDataToChartOption(data, 'x', 'y', 'heatmap', { valueProp: 'val' });

        expect(option).toBeDefined();
        // Check X Axis
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        const xAxis = option.xAxis as any;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(xAxis.type).toBe('category');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(xAxis.data).toContain('Mon');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(xAxis.data).toContain('Tue');

        // Check Y Axis
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        const yAxis = option.yAxis as any;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(yAxis.type).toBe('category');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(yAxis.data).toContain('Morning');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(yAxis.data).toContain('Evening');

        // Check Series
        const series = option.series as HeatmapSeriesOption[];
        expect(series).toHaveLength(1);
        expect(series[0]?.type).toBe('heatmap');

        // Check Data Mapping
        expect(series[0].datasetIndex).toBe(0);
        const dataset = option.dataset as DatasetComponentOption[];
        expect(dataset).toBeDefined();
        const source = dataset[0].source as HeatmapSourceItem[];
        expect(source).toHaveLength(4);
        expect(source[0]).toEqual({ x: 'Mon', y: 'Morning', value: 5 });
    });

    it('should handle missing values gracefully', () => {
        const data = [
            { x: 'Mon', y: 'Morning', val: 5 },
            { x: 'Mon', y: 'Evening' }, // Missing val
        ];

        const option = transformDataToChartOption(data, 'x', 'y', 'heatmap', { valueProp: 'val' });
        const dataset = option.dataset as DatasetComponentOption[];
        const source = dataset[0].source as HeatmapSourceItem[];

        // Should produce 0 for missing value based on current logic
        const missingPoint = source.find(d => d.value === 0);
        expect(missingPoint).toBeDefined();
    });

    it('should calculate visualMap min/max correctly', () => {
        const data = [
            { x: 'A', y: '1', val: 10 },
            { x: 'B', y: '2', val: 100 },
        ];

        const option = transformDataToChartOption(data, 'x', 'y', 'heatmap', { valueProp: 'val' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        const visualMap = option.visualMap as any;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(visualMap.min).toBe(10);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(visualMap.max).toBe(100);
    });
});
