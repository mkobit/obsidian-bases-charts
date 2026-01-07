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

export function getNestedValue(obj: unknown, path: string): unknown {
    return (typeof obj !== 'object' || obj === null)
        ? undefined
        : path.split('.').reduce((o: unknown, key: string) => {
            return (typeof o === 'object' && o !== null && key in o)
                ? (o as Record<string, unknown>)[key]
                : undefined;
        }, obj);
}

export function getLegendOption(options?: BaseTransformerOptions): LegendComponentOption | undefined {
    if (!options?.legend) return undefined;

    const position = options.legendPosition || 'top';
    // Default orient based on position if not set
    // Left/Right -> Vertical
    // Top/Bottom -> Horizontal
    const defaultOrient = (position === 'left' || position === 'right') ? 'vertical' : 'horizontal';
    const orient = options.legendOrient || defaultOrient;

    const base: LegendComponentOption = {
        orient,
        type: 'scroll'
    };

    switch (position) {
        case 'bottom':
            base.bottom = 0;
            base.left = 'center';
            break;
        case 'left':
            base.left = 0;
            base.top = 'middle';
            break;
        case 'right':
            base.right = 0;
            base.top = 'middle';
            break;
        case 'top':
        default:
            base.top = 0;
            base.left = 'center';
            break;
    }

    return base;
}
