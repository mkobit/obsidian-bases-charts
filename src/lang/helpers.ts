import { moment } from 'obsidian';
import en from './locale/en';

const localeMap: { [k: string]: Partial<typeof en> } = {
    en,
};

const locale = localeMap[moment.locale()];

export function t(str: keyof typeof en): string {
    return (locale && locale[str]) || en[str];
}
