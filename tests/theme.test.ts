import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as echarts from 'echarts';
import { getChartTheme } from '../src/charts/theme';

// Mock the entire echarts module
vi.mock('echarts', async (importOriginal) => {
    const actual = await importOriginal<typeof echarts>();
    return {
        ...actual,
        registerTheme: vi.fn(),
    };
});

describe('getChartTheme', () => {
    beforeEach(() => {
        vi.mocked(echarts.registerTheme).mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return "dark" when setting is "dark"', () => {
        expect(getChartTheme('dark', false)).toBe('dark');
        expect(getChartTheme('dark', true)).toBe('dark');
    });

    it('should return undefined when setting is "light"', () => {
        expect(getChartTheme('light', false)).toBeUndefined();
        expect(getChartTheme('light', true)).toBeUndefined();
    });

    it('should return "dark" when setting is "auto" and isDarkMode is true', () => {
        expect(getChartTheme('auto', true)).toBe('dark');
    });

    it('should return undefined when setting is "auto" and isDarkMode is false', () => {
        expect(getChartTheme('auto', false)).toBeUndefined();
    });

    it('should return "bare-plugin-custom-theme" and register theme when setting is "custom" and valid JSON is provided', () => {
        const validJson = '{"color": ["#333"]}';
        const theme = getChartTheme('custom', false, validJson);

        expect(theme).toBe('bare-plugin-custom-theme');
        expect(echarts.registerTheme).toHaveBeenCalledWith('bare-plugin-custom-theme', JSON.parse(validJson));
    });

    it('should fallback to auto (undefined) when setting is "custom" but JSON is invalid', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const invalidJson = '{ bad json }';

        // When invalid JSON and not dark mode -> undefined (auto light)
        expect(getChartTheme('custom', false, invalidJson)).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    it('should fallback to auto (dark) when setting is "custom" but JSON is invalid and it is dark mode', () => {
         const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
         const invalidJson = '{ bad json }';

         // When invalid JSON and dark mode -> dark (auto dark)
         expect(getChartTheme('custom', true, invalidJson)).toBe('dark');

         consoleSpy.mockRestore();
    });

    it('should fallback to auto when setting is "custom" but JSON is empty', () => {
        expect(getChartTheme('custom', false, '')).toBeUndefined();
        expect(echarts.registerTheme).not.toHaveBeenCalled();
    });
});
