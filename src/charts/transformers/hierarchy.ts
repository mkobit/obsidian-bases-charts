import type { EChartsOption, SunburstSeriesOption, TreeSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { getNestedValue } from './utils';
import * as R from 'remeda';

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

interface PathItem {
    parts: string[];
    value: number | undefined;
}

/**
 * Helper to build a tree structure from slash-separated paths.
 * Refactored to be functional using recursion instead of mutation loops.
 */
function buildHierarchy(
    data: Record<string, unknown>[],
    pathProp: string,
    valueProp?: string
): HierarchyNode[] {
    // 1. Transform data into paths and values
    const paths = R.pipe(
        data,
        R.map(item => {
            const pathRaw = getNestedValue(item, pathProp);
            if (typeof pathRaw !== 'string' || !pathRaw) return null;

            const parts = pathRaw.split('/').filter(p => p.length > 0);
            if (parts.length === 0) return null;

            const valNum = valueProp ? Number(getNestedValue(item, valueProp)) : NaN;
            // Explicitly use undefined if NaN, so it matches optional type better?
            // Actually, type { value?: number } allows undefined.
            const value = !isNaN(valNum) ? valNum : undefined;

            return { parts, value };
        }),
        R.filter((x): x is PathItem => x !== null)
    );

    // 2. Recursive builder
    const buildLevel = (items: PathItem[]): HierarchyNode[] => {
        return R.pipe(
            items,
            R.groupBy(item => item.parts[0]!), // Group by current level name
            R.entries(),
            R.map(([name, group]) => {
                // Check if any item in this group is a leaf at this level (length 1)
                const leafItems = group.filter(item => item.parts.length === 1);
                const leafValue = leafItems.length > 0
                    ? R.sumBy(leafItems, item => item.value ?? 0)
                    : undefined;

                // Get children items (length > 1), slicing off the first part
                const childrenItems = group
                    .filter(item => item.parts.length > 1)
                    .map(item => ({ parts: item.parts.slice(1), value: item.value }));

                const children = childrenItems.length > 0 ? buildLevel(childrenItems) : undefined;

                // Construct node without mutation
                const node: HierarchyNode = { name };

                const nodeWithValue = (leafValue !== undefined && leafValue > 0)
                    ? { ...node, value: leafValue }
                    : node;

                const nodeWithChildren = children
                    ? { ...nodeWithValue, children }
                    : nodeWithValue;

                return nodeWithChildren;
            })
        );
    };

    return buildLevel(paths);
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
    const hierarchyDataRaw = buildHierarchy(data, pathProp);

    const hierarchyData = hierarchyDataRaw.length > 1
        ? [{ name: 'Root', children: hierarchyDataRaw }]
        : hierarchyDataRaw;

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
