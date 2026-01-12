import { moment } from 'obsidian';
import * as i18next from 'i18next';
import en from './locales/en.json';

let isInitialized = false;

// Get Obsidian language settings
const getObsidianLanguage = (): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return (moment as any).locale() as string || 'en';
};

// Define a function to initialize i18next
export const initializeI18n = async () => {
    if (!isInitialized) {
        await i18next.init({
            lng: getObsidianLanguage(),
            fallbackLng: 'en',
            returnEmptyString: false,
            resources: {
                en: { translation: en },
            },
            interpolation: {
                escapeValue: false,
            },
        });

        isInitialized = true;
    }
};

export const i18n = new Proxy(i18next, {
    get(target, prop) {
        if (!isInitialized && prop === 't') {
            throw new Error('i18n.t() called before initialization. Call initializeI18n() first.');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Reflect.get(target, prop) as any;
    },
});

export function t(key: string, options?: Record<string, unknown>): string {
    return i18n.t(key, options);
}
