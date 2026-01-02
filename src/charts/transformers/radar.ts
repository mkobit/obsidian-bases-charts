import type { EChartsOption, RadarSeriesOption } from 'echarts';
import type { BaseTransformerOptions } from './base';
import { safeToString, getNestedValue } from './utils';

export interface RadarTransformerOptions extends BaseTransformerOptions {
    seriesProp?: string;
}

export function createRadarChartOption(
    data: Record<string, unknown>[],
    indicatorProp: string,
    valueProp: string,
    options?: RadarTransformerOptions
): EChartsOption {
    const seriesProp = options?.seriesProp;

    // 1. Identify Indicators (Axes)
    const uniqueIndicators = new Set<string>();
    for (const item of data) {
        const valRaw = getNestedValue(item, indicatorProp);
        const val = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);
        uniqueIndicators.add(val);
    }
    const indicatorsList = Array.from(uniqueIndicators);

    // 2. Identify Series
    const uniqueSeries = new Set<string>();
    for (const item of data) {
        if (seriesProp) {
            const valRaw = getNestedValue(item, seriesProp);
            const val = valRaw === undefined || valRaw === null ? 'Series 1' : safeToString(valRaw);
            uniqueSeries.add(val);
        } else {
            uniqueSeries.add(valueProp); // Use value prop name as default series name if no grouping
        }
    }

    // 3. Build Data
    // Map: SeriesName -> [v1, v2, v3...] corresponding to indicatorsList
    const seriesMap = new Map<string, (number | null)[]>();
    for (const s of uniqueSeries) {
        // Explicitly type the array created with fill(null)
        seriesMap.set(s, new Array<number | null>(indicatorsList.length).fill(null));
    }

    data.forEach(item => {
        const indRaw = getNestedValue(item, indicatorProp);
        const indVal = indRaw === undefined || indRaw === null ? 'Unknown' : safeToString(indRaw);
        const indIndex = indicatorsList.indexOf(indVal);

        if (indIndex === -1) return;

        let sName = valueProp;
        if (seriesProp) {
            const sRaw = getNestedValue(item, seriesProp);
            sName = sRaw === undefined || sRaw === null ? 'Series 1' : safeToString(sRaw);
        }

        const val = Number(getNestedValue(item, valueProp));
        if (!isNaN(val)) {
             const arr = seriesMap.get(sName);
             if (arr) arr[indIndex] = val;
        }
    });

    // 4. Construct Option
    const radarIndicators = indicatorsList.map(name => ({ name })); // Auto max?

    const seriesData = Array.from(seriesMap.entries()).map(([name, values]) => {
        // Use default value 0 for nulls, and ensure we map to number[]
        const safeValues = values.map(v => v === null ? 0 : v);
        return {
            value: safeValues,
            name: name
        };
    });

    const seriesItem: RadarSeriesOption = {
        type: 'radar',
        data: seriesData
    };

    const opt: EChartsOption = {
        radar: {
            indicator: radarIndicators
        },
        series: [seriesItem],
        tooltip: {
            trigger: 'item'
        }
    };

    if (options?.legend) {
        opt.legend = {
            data: Array.from(uniqueSeries)
        };
    }

    return opt;
}
