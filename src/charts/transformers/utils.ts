import type { LegendComponentOption } from 'echarts';

export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    if (!path) return undefined;
    const keys = path.split('.');
    let current: unknown = obj;
    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            current = (current as Record<string, unknown>)[key];
        } else {
            return undefined;
        }
    }
    return current;
}

export function safeToString(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value);
}

export function getLegendOption(
    visible: boolean | undefined,
    position: 'top' | 'bottom' | 'left' | 'right' | undefined,
    orient: 'horizontal' | 'vertical' | undefined
): LegendComponentOption | undefined {
    if (visible === false) {
        return { show: false };
    }

    const isVertical = orient === 'vertical' || position === 'left' || position === 'right';
    const finalOrient = isVertical ? 'vertical' : 'horizontal';

    let left: string | number | undefined = 'center';
    let top: string | number | undefined = 'top';
    let right: string | number | undefined = undefined;
    let bottom: string | number | undefined = undefined;

    if (position === 'bottom') {
        top = undefined;
        bottom = 0;
    } else if (position === 'left') {
        left = 0;
        top = 'middle';
    } else if (position === 'right') {
        left = undefined;
        right = 0;
        top = 'middle';
    } else if (position === 'top') {
        top = 0;
    }

    return {
        show: true,
        type: 'scroll',
        orient: finalOrient,
        left,
        top,
        right,
        bottom
    };
}
