export class Notice {}
export class Plugin {}
export class ItemView {}
export const Platform = { isMobile: true }
export function debounce(func: Function, wait: number, immediate: boolean) {
    let timeout: any;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
