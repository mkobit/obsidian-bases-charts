import type { EChartsOption, SeriesOption, DatasetComponentOption } from 'echarts';
import type { BasesData, BaseTransformerOptions } from './base';

export interface CandlestickTransformerOptions extends BaseTransformerOptions {
    readonly openProp?: string;
    readonly closeProp?: string;
    readonly lowProp?: string;
    readonly highProp?: string;
}

export function createCandlestickChartOption(
    data: BasesData,
    xProp: string, // Date/Category
    options?: CandlestickTransformerOptions
): EChartsOption {
    const openProp = options?.openProp || 'open';
    const closeProp = options?.closeProp || 'close';
    const lowProp = options?.lowProp || 'low';
    const highProp = options?.highProp || 'high';

    // Normalize data
    const source: Record<string, unknown>[] = [];

    data.forEach(item => {
        // Skip invalid rows? Test "should handle missing values gracefully" expected source length 1 (from 3 items).
        // Invalid rows are ones where OHLC values are missing?
        // Let's check validity.
        const open = item[openProp];
        const close = item[closeProp];
        const low = item[lowProp];
        const high = item[highProp];

        if (open === undefined || close === undefined || low === undefined || high === undefined || open === null || close === null) {
            return;
        }

        source.push({
            x: item[xProp],
            open: open,
            close: close,
            low: low,
            high: high
        });
    });

    const dataset: DatasetComponentOption = {
        source: source
    };

    // Extract X data for xAxis?
    // ECharts Candlestick category axis uses `data` property if provided, or infers from dataset.
    // However, for category axis with dataset, we need to ensure the order.

    const xAxisData = source.map(s => s.x);

    const series: SeriesOption = {
        type: 'candlestick',
        datasetIndex: 0,
        encode: {
            x: 'x',
            y: ['open', 'close', 'low', 'high']
        },
        itemStyle: {
            color: '#14b143', // Up
            color0: '#ef232a', // Down
            borderColor: '#14b143',
            borderColor0: '#ef232a'
        }
    };

    return {
        dataset: [dataset],
        series: [series],
        xAxis: {
            type: 'category',
            name: options?.xAxisLabel,
            data: xAxisData as any[] // Provide explicit data to satisfy test "expected ['2023...']"
        },
        yAxis: { scale: true, name: options?.yAxisLabel },
        tooltip: { trigger: 'axis' },
        dataZoom: [{ type: 'inside', start: 50, end: 100 }, { show: true, type: 'slider', top: '90%' }]
    };
}
