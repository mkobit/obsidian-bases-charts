import { browser, expect } from '@wdio/globals'
import { setScreenSize } from './window-helpers.js'
import { SCREEN_SIZES } from './config/screens.js'

describe('Responsive Layout', () => {
    it('should allow resizing the window', async () => {
        // Switch to Mobile
        await setScreenSize('MOBILE');
        await browser.pause(500); // Give WM time to react

        // Use execute to get inner dimensions as getWindowSize is flaky with this driver
        let size = await browser.execute(() => ({ width: window.innerWidth, height: window.innerHeight }));
        console.log(`Requested Mobile: ${JSON.stringify(SCREEN_SIZES.MOBILE)}, Got: ${JSON.stringify(size)}`);

        // Verify it's reasonably close (WM might add decorations or force sizes)
        // Inner width might be smaller than outer width (borders/scrollbars).
        // We check within 100px variance to allow for OS chrome.
        expect(Math.abs(size.width - SCREEN_SIZES.MOBILE.width)).toBeLessThan(100);
        expect(Math.abs(size.height - SCREEN_SIZES.MOBILE.height)).toBeLessThan(100);

        // Switch to Desktop
        await setScreenSize('DESKTOP');
        await browser.pause(500);
        size = await browser.execute(() => ({ width: window.innerWidth, height: window.innerHeight }));
        console.log(`Requested Desktop: ${JSON.stringify(SCREEN_SIZES.DESKTOP)}, Got: ${JSON.stringify(size)}`);

        // Verify Desktop size
        expect(Math.abs(size.width - SCREEN_SIZES.DESKTOP.width)).toBeLessThan(100);
        expect(Math.abs(size.height - SCREEN_SIZES.DESKTOP.height)).toBeLessThan(100);
    });
});
