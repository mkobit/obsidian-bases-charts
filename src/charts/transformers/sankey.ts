import type { EChartsOption, SankeySeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';
import * as R from 'remeda';

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

    const links = R.pipe(
        data,
        R.map(item => {
            const sourceRaw = getNestedValue(item, sourceProp);
            const targetRaw = getNestedValue(item, targetProp);

            if (sourceRaw == null || targetRaw == null) return null;

            const source = safeToString(sourceRaw);
            const target = safeToString(targetRaw);

            const valNum = valueProp ? Number(getNestedValue(item, valueProp)) : NaN;
            const value = !isNaN(valNum) ? valNum : 1;

            return { source, target, value };
        }),
        R.filter((x): x is { source: string; target: string; value: number } => x !== null)
    );

    const nodes = R.pipe(
        links,
        R.flatMap(l => [l.source, l.target]),
        R.unique(),
        R.map(name => ({ name }))
    );

    const seriesItem: SankeySeriesOption = {
        type: 'sankey',
        data: nodes,
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
