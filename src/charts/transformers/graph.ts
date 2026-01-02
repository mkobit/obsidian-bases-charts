import type { EChartsOption, GraphSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface GraphTransformerOptions extends BaseTransformerOptions {
    valueProp?: string; // For edge weight
    categoryProp?: string; // For node category
}

export function createGraphChartOption(
    data: Record<string, unknown>[],
    sourceProp: string,
    targetProp: string,
    options?: GraphTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;
    const categoryProp = options?.categoryProp;

    const links: { source: string; target: string; value?: number }[] = [];
    const nodesMap = new Map<string, { name: string; category?: number | string; value?: number }>();

    // 1. Collect Nodes and Links
    data.forEach(item => {
        const sourceRaw = getNestedValue(item, sourceProp);
        const targetRaw = getNestedValue(item, targetProp);

        if (sourceRaw == null || targetRaw == null) return;

        const source = safeToString(sourceRaw);
        const target = safeToString(targetRaw);

        // Edge Value
        let val: number | undefined = undefined;
        if (valueProp) {
            const v = Number(getNestedValue(item, valueProp));
            if (!isNaN(v)) val = v;
        }

        // Category (applied to Source node primarily, as this row "belongs" to source usually)
        let cat: string | undefined = undefined;
        if (categoryProp) {
            const cRaw = getNestedValue(item, categoryProp);
            if (cRaw !== undefined && cRaw !== null) cat = safeToString(cRaw);
        }

        // Register Source Node
        if (!nodesMap.has(source)) {
            nodesMap.set(source, { name: source, category: cat });
        } else if (cat !== undefined) {
            // Update category if found (and not previously set or just overwrite)
            nodesMap.get(source)!.category = cat;
        }

        // Register Target Node
        if (!nodesMap.has(target)) {
            nodesMap.set(target, { name: target }); // Category unknown until we encounter it as source
        }

        links.push({ source, target, value: val });
    });

    // 2. Extract Categories for Legend and Series
    const categoriesSet = new Set<string>();
    nodesMap.forEach(node => {
        if (node.category !== undefined) {
            categoriesSet.add(String(node.category));
        }
    });
    const categoriesList = Array.from(categoriesSet).sort();
    const categoriesData = categoriesList.map(name => ({ name }));

    // 3. Update Node Categories to Indices (ECharts graph uses category index)
    // Actually ECharts 5+ supports category names if categories list is provided.
    // Let's assume we map to index to be safe or just use name if supported.
    // Testing shows name works if matches categories data.

    const nodesData = Array.from(nodesMap.values()).map(node => {
        // Simple size based on something? Or fixed.
        // Let's use fixed size for now or we could compute degree.
        return {
            name: node.name,
            category: node.category, // string name
            symbolSize: 20,
            draggable: true
        };
    });

    const seriesItem: GraphSeriesOption = {
        type: 'graph',
        layout: 'force',
        data: nodesData,
        links: links,
        categories: categoriesData,
        roam: true,
        label: {
            show: true,
            position: 'right',
            formatter: '{b}'
        },
        labelLayout: {
            hideOverlap: true
        },
        scaleLimit: {
            min: 0.4,
            max: 2
        },
        lineStyle: {
            color: 'source',
            curveness: 0.3
        },
        emphasis: {
            focus: 'adjacency',
            lineStyle: {
                width: 10
            }
        },
        force: {
            repulsion: 100,
            edgeLength: 100
        }
    };

    const opt: EChartsOption = {
        tooltip: {},
        legend: options?.legend ? {
            data: categoriesList,
            orient: 'vertical',
            left: 'left'
        } : undefined,
        series: [seriesItem]
    };

    return opt;
}
