import type { EChartsOption, SunburstSeriesOption, TreeSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { getNestedValue } from './utils';

export interface SunburstTransformerOptions extends BaseTransformerOptions {
    valueProp?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TreeTransformerOptions extends BaseTransformerOptions {
    // Tree specific options if any
}

interface HierarchyNode {
    name: string;
    value?: number;
    children?: HierarchyNode[];
}

/**
 * Helper to build a tree structure from slash-separated paths.
 * E.g. "A/B" -> {name: 'A', children: [{name: 'B'}]}
 */
function buildHierarchy(
    data: Record<string, unknown>[],
    pathProp: string,
    valueProp?: string
): HierarchyNode[] {
    const rootChildren: HierarchyNode[] = [];

    // Helper to find existing child node
    const findChild = (nodes: HierarchyNode[], name: string): HierarchyNode | undefined => {
        return nodes.find(n => n.name === name);
    };

    // Using traditional loop here because we are building a mutable tree structure incrementally
    // which is awkward with reduce and cleaner with sequential processing.
    for (const item of data) {
        const pathRaw = getNestedValue(item, pathProp);
        if (typeof pathRaw !== 'string' || !pathRaw) continue;

        const parts = pathRaw.split('/').filter(p => p.length > 0);
        if (parts.length === 0) continue;

        let currentLevel = rootChildren;
        let value: number | undefined = undefined;

        if (valueProp) {
            const v = Number(getNestedValue(item, valueProp));
            if (!isNaN(v)) value = v;
        }

        parts.forEach((part, index) => {
            let node = findChild(currentLevel, part);
            if (!node) {
                node = { name: part };
                // Initialize children array if not leaf
                // ECharts Tree/Sunburst: nodes need children array to be parents, or value to be leaves.
                // We'll add children array on demand.
                currentLevel.push(node);
            }

            // If it's the leaf node, assign value
            if (index === parts.length - 1) {
                if (value !== undefined) {
                    node.value = (node.value || 0) + value;
                }
            } else {
                if (!node.children) node.children = [];
                currentLevel = node.children;
            }
        });
    }

    return rootChildren;
}

export function createSunburstChartOption(
    data: Record<string, unknown>[],
    pathProp: string,
    options?: SunburstTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;
    const hierarchyData = buildHierarchy(data, pathProp, valueProp);

    const seriesItem: SunburstSeriesOption = {
        type: 'sunburst',
        data: hierarchyData,
        radius: [0, '90%'],
        label: {
            rotate: 'radial'
        }
    };

    return {
        series: [seriesItem],
        tooltip: {
            trigger: 'item'
        }
    };
}

export function createTreeChartOption(
    data: Record<string, unknown>[],
    pathProp: string,
    options?: TreeTransformerOptions
): EChartsOption {
    // Tree chart expects a single root usually.
    // If we have multiple roots, we might need to wrap them or ECharts might only show one.
    // Let's wrap in a virtual root if multiple.
    let hierarchyData = buildHierarchy(data, pathProp);

    if (hierarchyData.length > 1) {
        hierarchyData = [{
            name: 'Root',
            children: hierarchyData
        }];
    }

    const seriesItem: TreeSeriesOption = {
        type: 'tree',
        data: hierarchyData,
        top: '10%',
        bottom: '10%',
        layout: 'orthogonal',
        symbol: 'emptyCircle',
        symbolSize: 7,
        initialTreeDepth: 3,
        animationDurationUpdate: 750,
        label: {
            position: 'left',
            verticalAlign: 'middle',
            align: 'right',
            fontSize: 9
        },
        leaves: {
            label: {
                position: 'right',
                verticalAlign: 'middle',
                align: 'left'
            }
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationEasing: 'cubicOut'
    };

    return {
        series: [seriesItem],
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove'
        }
    };
}
