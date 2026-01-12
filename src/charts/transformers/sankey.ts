import type { EChartsOption, SankeySeriesOption } from 'echarts';
import type { BaseTransformerOptions, BasesData } from './base';
import { safeToString, getNestedValue } from './utils';
import * as R from 'remeda';

export interface SankeyTransformerOptions extends BaseTransformerOptions {
	readonly valueProp?: string;
}

export function createSankeyChartOption(
	data: BasesData,
	sourceProp: string,
	targetProp: string,
	options?: SankeyTransformerOptions,
): EChartsOption {
	const valueProp = options?.valueProp;

	const links = R.pipe(
		data,
		R.map(item => {
			const sourceRaw = getNestedValue(
				item,
				sourceProp,
			);
			const targetRaw = getNestedValue(
				item,
				targetProp,
			);

			return (sourceRaw !== null && sourceRaw !== undefined && targetRaw !== null && targetRaw !== undefined)
				? (() => {
					const source = safeToString(sourceRaw);
					const target = safeToString(targetRaw);

					const valNum = valueProp ? Number(getNestedValue(
						item,
						valueProp,
					)) : Number.NaN;
					const value = Number.isNaN(valNum) ? 1 : valNum;

					return { source,
						target,
						value };
				})()
				: null;
		}),
		R.filter((x): x is Readonly<{ source: string;
			target: string;
			value: number }> => x !== null),
	);

	const nodes = R.pipe(
		links,
		R.flatMap(l => [l.source,
			l.target]),
		R.unique(),
		R.map(name => ({ name })),
	);

	const seriesItem: SankeySeriesOption = {
		type: 'sankey',
		data: nodes,
		links: links,
		emphasis: {
			focus: 'adjacency',
		},
		label: {
			show: true,
		},
	};

	return {
		tooltip: {
			trigger: 'item',
			triggerOn: 'mousemove',
		},
		series: [seriesItem],
	};
}
