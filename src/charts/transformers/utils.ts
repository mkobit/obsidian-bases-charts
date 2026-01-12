import type { LegendComponentOption } from 'echarts';
import type { BaseTransformerOptions } from './base';

export function safeToString(val: unknown): string {
	return val === null || val === undefined
		? ''
		: typeof val === 'string'
			? val
			: typeof val === 'number' || typeof val === 'boolean'
				? String(val)
				: JSON.stringify(val);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export function getNestedValue(obj: unknown, path: string): unknown {
	return (typeof obj !== 'object' || obj === null)
		? undefined
		: path.split('.').reduce(
			(o: unknown, key: string) => {
				return (isRecord(o) && key in o)
					? o[key]
					: undefined;
			},
			obj,
		);
}

export function getLegendOption(options?: BaseTransformerOptions): LegendComponentOption | undefined {
	const showLegend = options?.legend ?? false;
	const position = options?.legendPosition ?? 'top';

	// Default orient based on position if not set
	// Left/Right -> Vertical
	// Top/Bottom -> Horizontal
	const defaultOrient = (position === 'left' || position === 'right') ? 'vertical' : 'horizontal';
	const orient = options?.legendOrient ?? defaultOrient;

	const base: LegendComponentOption = {
		orient,
		type: 'scroll',
	};

	const positionMap: Record<string, LegendComponentOption> = {
		bottom: { bottom: 0,
			left: 'center' },
		left: { left: 0,
			top: 'middle' },
		right: { right: 0,
			top: 'middle' },
		top: { top: 0,
			left: 'center' },
	};

	const posConfig = positionMap[position] ?? positionMap['top']!;

	return showLegend
		? { ...base,
			...posConfig }
		: undefined;
}
