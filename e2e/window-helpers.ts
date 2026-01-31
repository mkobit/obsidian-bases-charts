import { SCREEN_SIZES, type ScreenSize } from './config/screens.js';

/**
 * Sets the browser window size to a predefined standard or custom dimension.
 * @param size - The named screen size (MOBILE, TABLET, etc.) or custom dimensions.
 */
export async function setScreenSize(size: ScreenSize | { width: number, height: number }) {
    const { width, height } = typeof size === 'string' ? SCREEN_SIZES[size] : size;
    // browser.setWindowSize can fail with some Electron versions/drivers.
    // We try to resize via the window API first.
    await browser.execute((w, h) => {
        window.resizeTo(w, h);
    }, width, height);
}
