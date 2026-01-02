
import { describe, it, expect } from 'vitest';
import { transformDataToChartOption } from '../src/charts/transformer';
import type { SunburstSeriesOption, TreeSeriesOption } from 'echarts';

describe('Transformer - Hierarchical Charts', () => {
    describe('Sunburst', () => {
        it('should build hierarchy from path property', () => {
            const data = [
                { path: 'A/B', val: 10 },
                { path: 'A/C', val: 5 },
                { path: 'D', val: 20 }
            ];

            const option = transformDataToChartOption(data, 'path', '', 'sunburst', {
                valueProp: 'val'
            });

            expect(option.series).toBeDefined();
            const series = option.series![0] as SunburstSeriesOption;
            expect(series.type).toBe('sunburst');

            const hierarchy = series.data as any[];
            expect(hierarchy).toHaveLength(2); // A and D

            const nodeA = hierarchy.find(n => n.name === 'A');
            expect(nodeA).toBeDefined();
            expect(nodeA.children).toHaveLength(2); // B and C

            const nodeB = nodeA.children.find((n: any) => n.name === 'B');
            expect(nodeB.value).toBe(10);
        });

        it('should handle missing values gracefully', () => {
            const data = [
                { path: 'A/B' } // No value
            ];
            const option = transformDataToChartOption(data, 'path', '', 'sunburst', {
                valueProp: 'val'
            });
            const series = option.series![0] as SunburstSeriesOption;
            const hierarchy = series.data as any[];
            expect(hierarchy[0].children[0].value).toBeUndefined();
        });
    });

    describe('Tree', () => {
        it('should build hierarchy and wrap in single root if multiple roots', () => {
            const data = [
                { path: 'A/B' },
                { path: 'C/D' }
            ];
            const option = transformDataToChartOption(data, 'path', '', 'tree', {});
            const series = option.series![0] as TreeSeriesOption;

            const dataRoot = series.data as any[];
            // Should be wrapped in "Root" because there are two top-level nodes (A and C)
            expect(dataRoot).toHaveLength(1);
            expect(dataRoot[0].name).toBe('Root');
            expect(dataRoot[0].children).toHaveLength(2);
        });

        it('should use single root directly if only one top-level node', () => {
             const data = [
                { path: 'A/B' },
                { path: 'A/C' }
            ];
            const option = transformDataToChartOption(data, 'path', '', 'tree', {});
            const series = option.series![0] as TreeSeriesOption;

            const dataRoot = series.data as any[];
            // Should be just A, no wrapper
            expect(dataRoot).toHaveLength(1);
            expect(dataRoot[0].name).toBe('A');
        });
    });
});
