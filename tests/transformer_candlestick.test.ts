import { describe, it, expect } from 'vitest';
import type { CandlestickSeriesOption } from 'echarts';
import { transformDataToChartOption } from '../src/charts/transformer';

describe('Transformer - Candlestick Chart', () => {
    const data = [
        { date: '2023-10-01', open: 100, close: 110, low: 95, high: 115 },
        { date: '2023-10-02', open: 110, close: 105, low: 100, high: 112 },
        { date: '2023-10-03', open: 105, close: 120, low: 105, high: 125 }
    ];

    it('should create candlestick chart options correctly', () => {
        const option = transformDataToChartOption(data, 'date', '', 'candlestick', {
            openProp: 'open',
            closeProp: 'close',
            lowProp: 'low',
            highProp: 'high'
        });

        // Basic Structure
        expect(option).toHaveProperty('series');

        const series = option.series as CandlestickSeriesOption[];
        expect(Array.isArray(series)).toBe(true);
        expect(series.length).toBe(1);
        expect(series[0]!.type).toBe('candlestick');

        // Data Verification
        // ECharts Candlestick data format: [open, close, low, high]
        const seriesData = series[0]!.data as number[][];
        expect(seriesData).toHaveLength(3);

        expect(seriesData[0]).toEqual([100, 110, 95, 115]);
        expect(seriesData[1]).toEqual([110, 105, 100, 112]);
        expect(seriesData[2]).toEqual([105, 120, 105, 125]);

        // Axis Verification
        expect(option.xAxis).toBeDefined();
        // @ts-ignore
        expect(option.xAxis.data).toEqual(['2023-10-01', '2023-10-02', '2023-10-03']);
    });

    it('should handle missing values gracefully', () => {
        const messyData = [
            { date: '2023-10-01', open: 100, close: 110, low: 95, high: 115 },
            { date: '2023-10-02', open: null, close: 105, low: 100, high: 112 }, // Missing Open
            { date: '2023-10-03', open: 105, close: 120, low: undefined, high: 125 } // Missing Low
        ];

        const option = transformDataToChartOption(messyData, 'date', '', 'candlestick', {
            openProp: 'open',
            closeProp: 'close',
            lowProp: 'low',
            highProp: 'high'
        });

        const series = option.series as CandlestickSeriesOption[];
        const seriesData = series[0]!.data as number[][];

        // Should ignore invalid rows (open: null and low: undefined should cause rows to be skipped)
        expect(seriesData).toHaveLength(1);
        expect(seriesData[0]).toEqual([100, 110, 95, 115]);

        // Check xAxis data sync
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        expect((option.xAxis as any).data).toEqual(['2023-10-01']);
    });

    it('should use default property names if options are missing', () => {
        // Data using default names: 'open', 'close', 'low', 'high' (which matches the test data above)
        // We pass empty options for props
        const option = transformDataToChartOption(data, 'date', '', 'candlestick');

        const series = option.series as CandlestickSeriesOption[];
        const seriesData = series[0]!.data as number[][];
        expect(seriesData).toHaveLength(3);
        expect(seriesData[0]).toEqual([100, 110, 95, 115]);
    });
});
