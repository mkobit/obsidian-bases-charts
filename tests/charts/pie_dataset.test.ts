
import { describe, it, expect } from 'vitest';
import { createPieChartOption } from '../../src/charts/transformers/pie';
import type { DatasetComponentOption, SeriesOption } from 'echarts';

describe('Pie Chart Transformer (Dataset Architecture)', () => {
    const data = [
        { name: 'Item A', value: 10 },
        { name: 'Item B', value: 20 },
    ];

    it('should create a pie chart using dataset', () => {
        const option = createPieChartOption(data, 'name', 'value');

        expect(option.dataset).toBeDefined();
        // Check source dataset
        const datasets = (Array.isArray(option.dataset) ? option.dataset : [option.dataset]) as DatasetComponentOption[];
        expect(datasets[0]).toHaveProperty('source');
        expect(datasets[0].source).toHaveLength(2);

        // Check series
        const series = (Array.isArray(option.series) ? option.series[0] : option.series) as SeriesOption;
        expect(series).toBeDefined();
        expect(series.type).toBe('pie');
        expect(series.datasetIndex).toBe(0);
        expect(series.encode).toEqual({ itemName: 'name', value: 'value' });
    });
});
