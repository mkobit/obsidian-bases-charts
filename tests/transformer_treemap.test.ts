import { describe, it, expect } from 'vitest';
import { transformDataToChartOption } from '../src/charts/transformer';
import type { TreemapSeriesOption } from 'echarts';

describe('Treemap Transformer', () => {
    it('should transform data correctly for treemap', () => {
        const data = [
            { name: 'A', val: 10 },
            { name: 'B', val: 20 },
            { name: 'C', val: -5 } // Should be ignored
        ];

        const option = transformDataToChartOption(data, 'name', 'val', 'treemap', {});

        expect(option).toBeDefined();
        const series = option.series as TreemapSeriesOption[];
        expect(series).toBeDefined();
        if (!series) return; // Guard for TS

        expect(series.length).toBe(1);
        expect(series[0]!.type).toBe('treemap');

        const seriesData = series[0]!.data as {name: string, value: number}[];
        expect(seriesData.length).toBe(2);

        const itemA = seriesData.find(d => d.name === 'A');
        expect(itemA).toBeDefined();
        expect(itemA?.value).toBe(10);

        const itemB = seriesData.find(d => d.name === 'B');
        expect(itemB).toBeDefined();
        expect(itemB?.value).toBe(20);

        const itemC = seriesData.find(d => d.name === 'C');
        expect(itemC).toBeUndefined();
    });

    it('should handle missing values gracefully', () => {
        const data = [
            { name: 'A', val: null },
            { name: 'B' } // missing val
        ];

        const option = transformDataToChartOption(data, 'name', 'val', 'treemap', {});
        const series = option.series as TreemapSeriesOption[];

        // Safety check before access
        if (series && series[0]) {
             const seriesData = series[0].data as any[];
             expect(seriesData.length).toBe(0);
        } else {
             // If series is missing, that might be valid or invalid depending on impl,
             // but here we expect empty data array in series
             // The transformer returns a series even if empty.
             expect(series).toBeDefined();
             expect(series.length).toBeGreaterThan(0);
        }
    });
});
