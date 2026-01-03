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
    return data.reduce<HierarchyNode[]>((rootChildren, item) => {
        const pathRaw = getNestedValue(item, pathProp);
        if (typeof pathRaw !== 'string' || !pathRaw) return rootChildren;

        const parts = pathRaw.split('/').filter(p => p.length > 0);
        if (parts.length === 0) return rootChildren;

        let value: number | undefined = undefined;
        if (valueProp) {
            const v = Number(getNestedValue(item, valueProp));
            if (!isNaN(v)) value = v;
        }

        // Traverse/Build the tree for this item
        parts.reduce<HierarchyNode[]>((currentLevel, part, index) => {
            let node = currentLevel.find(n => n.name === part);

            if (!node) {
                node = { name: part };
                // Use push since we are mutating the accumulating tree structure
                // Ideally this would be fully immutable but for deep trees performance/complexity tradeoff usually favors this hybrid reduce.
                // However, strictly following "functional" request:
                currentLevel.push(node);
            }

            // If it's the leaf node, assign value
            if (index === parts.length - 1) {
                if (value !== undefined) {
                    node.value = (node.value || 0) + value;
                }
            } else {
                if (!node.children) node.children = [];
                return node.children;
            }

            return currentLevel; // Not used for leaf, but satisfies type
        }, rootChildren);

        return rootChildren;
    }, []);
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
