// Global type definition for Obsidian's exposed i18next
import 'obsidian';

declare module 'obsidian' {
    interface App {
        // Expose i18next if strictly needed through App, though it's usually global
    }
}

declare global {
    // eslint-disable-next-line no-var
    var i18next: {
        t: (key: string, options?: Record<string, unknown>) => string;
        addResourceBundle: (lng: string, ns: string, resources: Record<string, unknown>, deep?: boolean, overwrite?: boolean) => void;
        getFixedT: (lng: string | null, ns: string | null, keyPrefix?: string) => (key: string, options?: Record<string, unknown>) => string;
    };
}
