import type { EChartsOption, SunburstSeriesOption, TreeSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { getNestedValue } from './utils';
import * as R from 'remeda';

export interface SunburstTransformerOptions extends BaseTransformerOptions {
    readonly valueProp?: string;
}

export type TreeTransformerOptions = BaseTransformerOptions;

interface HierarchyNode {
    readonly name: string;
    readonly value?: number;
    readonly children?: readonly HierarchyNode[];
}

interface PathItem {
    // eslint-disable-next-line functional/prefer-readonly-type
    parts: string[];
    // eslint-disable-next-line functional/prefer-readonly-type
    value: number | undefined;
}

/**
 * Helper to build a tree structure from slash-separated paths.
 * Refactored to be functional using recursion instead of mutation loops.
 */
function buildHierarchy(
    data: readonly Record<string, unknown>[],
    pathProp: string,
    valueProp?: string
): readonly HierarchyNode[] {
    // 1. Transform data into paths and values
    const paths = R.pipe(
        data,
        R.map(item => {
            const pathRaw = getNestedValue(item, pathProp);
            return (typeof pathRaw !== 'string' || !pathRaw)
                ? null
                : (() => {
                    const parts = pathRaw.split('/').filter(p => p.length > 0);
                    return parts.length === 0
                        ? null
                        : (() => {
                            const valNum = valueProp ? Number(getNestedValue(item, valueProp)) : Number.NaN;
                            // Explicitly use undefined if NaN, so it matches optional type better?
                            // Actually, type { value?: number } allows undefined.
                            const value = Number.isNaN(valNum) ? undefined : valNum;

                            return { parts, value };
                        })();
                })();
        }),
        R.filter((x): x is PathItem => x !== null)
    );

    // 2. Recursive builder
    const buildLevel = (items: readonly PathItem[]): readonly HierarchyNode[] => {
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
    data: readonly Record<string, unknown>[],
    pathProp: string,
    options?: SunburstTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;
    const hierarchyData = buildHierarchy(data, pathProp, valueProp);

    const seriesItem: SunburstSeriesOption = {
        type: 'sunburst',
        data: hierarchyData as unknown as SunburstSeriesOption['data'],
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
    data: readonly Record<string, unknown>[],
    pathProp: string,
    options?: TreeTransformerOptions
): EChartsOption {
    const hierarchyDataRaw = buildHierarchy(data, pathProp);

    const hierarchyData = hierarchyDataRaw.length > 1
        ? [{ name: 'Root', children: hierarchyDataRaw }]
        : hierarchyDataRaw;

    const seriesItem: TreeSeriesOption = {
        type: 'tree',
        data: hierarchyData as unknown as TreeSeriesOption['data'],
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
