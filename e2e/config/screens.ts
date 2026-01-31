export const SCREEN_SIZES = {
    MOBILE: { width: 375, height: 812 }, // iPhone X-ish
    TABLET: { width: 768, height: 1024 }, // iPad Portrait
    DESKTOP: { width: 1280, height: 1024 }, // Standard 4:3
    DESKTOP_WIDE: { width: 1920, height: 1080 } // 1080p
} as const;

export type ScreenSize = keyof typeof SCREEN_SIZES;
