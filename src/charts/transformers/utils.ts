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
