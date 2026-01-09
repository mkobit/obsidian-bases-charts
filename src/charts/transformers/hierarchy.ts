import type { EChartsOption, SeriesOption } from 'echarts';
import type { BasesData, BaseTransformerOptions } from './base';

export interface SunburstTransformerOptions extends BaseTransformerOptions {
    // Hierarchical options
}

export interface TreeTransformerOptions extends BaseTransformerOptions {
    // Hierarchical options
}

// Common hierarchy builder
function buildHierarchy(data: BasesData, pathProp: string, valueProp?: string) {
    const root = { name: 'root', children: [] as any[] };

    data.forEach(item => {
        const path = String(item[pathProp]).split('/');
        const val = valueProp ? (item[valueProp] !== undefined ? Number(item[valueProp]) : undefined) : 1;

        let current = root;
        path.forEach((segment, index) => {
            if (!segment) return;
            let child = current.children.find(c => c.name === segment);
            if (!child) {
                child = { name: segment, children: [] };
                // Only set value for leaf nodes if provided
                current.children.push(child);
            }
            if (index === path.length - 1) {
                // Leaf
                // If valueProp is undefined and item[valueProp] is undefined, we probably want undefined?
                // The test says "should handle missing values gracefully", expecting undefined.
                if (val !== undefined) {
                    child.value = val;
                }
            }
            current = child;
        });
    });
    return root.children;
}

export function createSunburstChartOption(
    data: BasesData,
    pathProp: string,
    options?: SunburstTransformerOptions
): EChartsOption {
    // Sunburst usually needs value.
    const valueProp = (options as any)?.valueProp; // Might need to add to interface if tests use it
    const hierarchy = buildHierarchy(data, pathProp, valueProp);

    const series: SeriesOption = {
        type: 'sunburst',
        data: hierarchy,
        radius: [0, '90%'],
        label: { rotate: 'radial' }
    };

    return {
        series: [series],
        tooltip: { trigger: 'item' }
    };
}

export function createTreeChartOption(
    data: BasesData,
    pathProp: string,
    options?: TreeTransformerOptions
): EChartsOption {
    const valueProp = (options as any)?.valueProp;
    const hierarchy = buildHierarchy(data, pathProp, valueProp);

    // If only one root node is present in hierarchy, ECharts Tree prefers that as root.
    // If multiple, we wrap.
    let rootData = hierarchy;
    if (hierarchy.length === 1) {
        // If the single node is a true root (e.g. from data), use it.
        // But buildHierarchy returns children of a virtual root.
        // If data was "A/B", "A/C", hierarchy is [A].
        // If data was "A", "B", hierarchy is [A, B].
        rootData = hierarchy;
    } else {
        rootData = [{ name: 'Root', children: hierarchy }];
    }

    // Wait, the test "should use single root directly if only one top-level node"
    // implies if hierarchy has 1 item, use it.
    // But `rootData` in my previous code was `[{ name: 'Root', children: hierarchy }]`.

    const finalData = hierarchy.length === 1 ? hierarchy : [{ name: 'Root', children: hierarchy }];

    const series: SeriesOption = {
        type: 'tree',
        data: finalData,
        top: '10%',
        bottom: '10%',
        layout: 'orthogonal',
        symbol: 'emptyCircle',
        symbolSize: 7,
        initialTreeDepth: 3,
        animationDurationUpdate: 750
    };

    return {
        series: [series],
        tooltip: { trigger: 'item' }
    };
}
