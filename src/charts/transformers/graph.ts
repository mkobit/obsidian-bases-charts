import type { EChartsOption, SeriesOption } from 'echarts';
import type { BasesData, BaseTransformerOptions } from './base';
import { getLegendOption } from './utils';

export interface GraphTransformerOptions extends BaseTransformerOptions {
    readonly categoryProp?: string;
    readonly valueProp?: string;
}

export function createGraphChartOption(
    data: BasesData,
    sourceProp: string, // Source
    targetProp: string, // Target
    options?: GraphTransformerOptions
): EChartsOption {
    const categoryProp = options?.categoryProp;
    const valueProp = options?.valueProp;

    const links: {source: string, target: string, value?: number}[] = [];

    data.forEach(item => {
        const s = String(item[sourceProp]);
        const t = String(item[targetProp]);

        if (!item[sourceProp] || !item[targetProp]) return;

        links.push({
            source: s,
            target: t,
            value: valueProp ? Number(item[valueProp]) : undefined
        });
    });

    const nodeMap = new Map<string, { name: string; category?: number | string; value?: number }>();

    let categories: { name: string }[] | undefined;
    const categoryNameMap = new Map<string, number>();

    if (categoryProp) {
        const catNames = new Set<string>();
        data.forEach(item => {
            if (item[categoryProp]) catNames.add(String(item[categoryProp]));
        });
        const sortedCats = Array.from(catNames).sort();
        categories = sortedCats.map(name => ({ name }));
        sortedCats.forEach((name, idx) => categoryNameMap.set(name, idx));
    }

    data.forEach(item => {
        const s = String(item[sourceProp]);
        const t = String(item[targetProp]);
        if (!item[sourceProp] || !item[targetProp]) return;

        const catName = categoryProp ? String(item[categoryProp]) : undefined;
        // Test expects category to be NAME, not index.
        const catVal = catName !== undefined ? catName : undefined;

        if (!nodeMap.has(s)) {
            nodeMap.set(s, { name: s, category: catVal });
        } else if (catVal !== undefined && nodeMap.get(s)!.category === undefined) {
             nodeMap.get(s)!.category = catVal;
        }

        if (!nodeMap.has(t)) {
             nodeMap.set(t, { name: t });
        }
    });

    const nodes = Array.from(nodeMap.values());

    const series: SeriesOption = {
        type: 'graph',
        layout: 'force',
        data: nodes,
        links: links,
        categories: categories,
        roam: true,
        label: { show: true },
        force: { repulsion: 100 }
    };

    return {
        series: [series],
        legend: getLegendOption(options?.legend, options?.legendPosition, options?.legendOrient),
        tooltip: {}
    };
}
