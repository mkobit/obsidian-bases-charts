import type { EChartsOption, SankeySeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface SankeyTransformerOptions extends BaseTransformerOptions {
    valueProp?: string;
}

export function createSankeyChartOption(
    data: Record<string, unknown>[],
    sourceProp: string,
    targetProp: string,
    options?: SankeyTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;

    const { links, nodes } = data.reduce<{
        links: { source: string; target: string; value: number }[];
        nodes: Set<string>;
    }>((acc, item) => {
        const sourceRaw = getNestedValue(item, sourceProp);
        const targetRaw = getNestedValue(item, targetProp);

        if (sourceRaw == null || targetRaw == null) return acc;

        const source = safeToString(sourceRaw);
        const target = safeToString(targetRaw);

        acc.nodes.add(source);
        acc.nodes.add(target);

        let value = 1; // Default count
        if (valueProp) {
            const valRaw = getNestedValue(item, valueProp);
            const val = Number(valRaw);
            if (!isNaN(val)) value = val;
        }

        acc.links.push({ source, target, value });
        return acc;
    }, { links: [], nodes: new Set<string>() });

    const dataNodes = Array.from(nodes).map(name => ({ name }));

    const seriesItem: SankeySeriesOption = {
        type: 'sankey',
        data: dataNodes,
        links: links,
        emphasis: {
            focus: 'adjacency'
        },
        label: {
            show: true
        }
    };

    return {
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove'
        },
        series: [seriesItem]
    };
}
