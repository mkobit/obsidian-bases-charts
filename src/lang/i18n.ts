import en from './locale/en';

const PLUGIN_ID = 'obsidian-sample-plugin';

export function initTranslations(): void {
    // Check if i18next is available (provided by Obsidian)
    if (typeof i18next !== 'undefined') {
        i18next.addResourceBundle('en', PLUGIN_ID, en);
    }
}

export function t(key: string): string {
    if (typeof i18next !== 'undefined') {
        return i18next.t(key, { ns: PLUGIN_ID });
    }
    // Fallback for tests or if i18next is missing
    return resolveKey(key, en);
}

function resolveKey(path: string, obj: Record<string, unknown>): string {
    const result = path.split('.').reduce((prev: unknown, curr: string) => {
        if (prev && typeof prev === 'object' && curr in prev) {
            return (prev as Record<string, unknown>)[curr];
        }
        return undefined;
    }, obj);

    return (typeof result === 'string' ? result : path);
}
