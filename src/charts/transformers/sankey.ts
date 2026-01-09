import type { EChartsOption, SeriesOption } from 'echarts';
import type { BasesData, BaseTransformerOptions } from './base';

export interface SankeyTransformerOptions extends BaseTransformerOptions {
    readonly valueProp?: string;
}

export function createSankeyChartOption(
    data: BasesData,
    xProp: string, // Source
    yProp: string, // Target
    options?: SankeyTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;

    // Transform data to { source, target, value }
    const links: {source: string, target: string, value: number}[] = [];

    data.forEach(item => {
        const source = String(item[xProp]);
        const target = String(item[yProp]);

        // Skip invalid items (where source or target is missing or null or empty string)
        if (!item[xProp] || !item[yProp]) return;

        links.push({
            source,
            target,
            value: valueProp ? Number(item[valueProp]) || 1 : 1
        });
    });

    // Deduplicate nodes
    const nodeNames = new Set<string>();
    links.forEach(l => {
        nodeNames.add(l.source);
        nodeNames.add(l.target);
    });

    const nodes = Array.from(nodeNames).map(name => ({ name }));

    const series: SeriesOption = {
        type: 'sankey',
        data: nodes,
        links: links,
        emphasis: { focus: 'adjacency' },
        lineStyle: { color: 'source', curveness: 0.5 }
    };

    return {
        series: [series],
        tooltip: { trigger: 'item' }
    };
}
