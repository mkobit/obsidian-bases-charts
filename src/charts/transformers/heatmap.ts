import type { EChartsOption, HeatmapSeriesOption } from 'echarts';
import type { HeatmapTransformerOptions } from './types';
import { safeToString, getNestedValue } from './utils';

export function createHeatmapChartOption(
    data: Record<string, unknown>[],
    xProp: string,
    yProp: string,
    options?: HeatmapTransformerOptions
): EChartsOption {
    const valueProp = options?.valueProp;

    // 1. Identify X Categories (Horizontal)
    const uniqueX = new Set<string>();
    data.forEach(item => {
        const valRaw = getNestedValue(item, xProp);
        const xVal = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);
        uniqueX.add(xVal);
    });
    const xAxisData = Array.from(uniqueX);

    // 2. Identify Y Categories (Vertical)
    const uniqueY = new Set<string>();
    data.forEach(item => {
        const valRaw = getNestedValue(item, yProp);
        const yVal = valRaw === undefined || valRaw === null ? 'Unknown' : safeToString(valRaw);
        uniqueY.add(yVal);
    });
    const yAxisData = Array.from(uniqueY);

    // 3. Build Data [xIndex, yIndex, value]
    const seriesData: [number, number, number][] = [];
    let minVal = Infinity;
    let maxVal = -Infinity;

    data.forEach(item => {
        const xValRaw = getNestedValue(item, xProp);
        const xVal = xValRaw === undefined || xValRaw === null ? 'Unknown' : safeToString(xValRaw);
        const xIndex = xAxisData.indexOf(xVal);

        const yValRaw = getNestedValue(item, yProp);
        const yVal = yValRaw === undefined || yValRaw === null ? 'Unknown' : safeToString(yValRaw);
        const yIndex = yAxisData.indexOf(yVal);

        if (xIndex === -1 || yIndex === -1) return;

        let val = 0;
        if (valueProp) {
            const v = Number(getNestedValue(item, valueProp));
            if (!isNaN(v)) {
                val = v;
            }
        }

        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;

        seriesData.push([xIndex, yIndex, val]);
    });

    if (minVal === Infinity) minVal = 0;
    if (maxVal === -Infinity) maxVal = 10;

    const seriesItem: HeatmapSeriesOption = {
        type: 'heatmap',
        data: seriesData,
        label: {
            show: true
        }
    };

    const opt: EChartsOption = {
        tooltip: {
            position: 'top',
            formatter: (params: unknown) => {
                const p = params as { value: (number | string)[] };
                if (!p || !Array.isArray(p.value)) return '';
                const xIndex = p.value[0] as number;
                const yIndex = p.value[1] as number;
                const val = p.value[2] as number;
                return `${xProp}: ${xAxisData[xIndex]}<br/>${yProp}: ${yAxisData[yIndex]}<br/>Value: ${val}`;
            }
        },
        grid: {
            height: '70%',
            top: '10%'
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            splitArea: {
                show: true
            }
        },
        yAxis: {
            type: 'category',
            data: yAxisData,
            splitArea: {
                show: true
            }
        },
        visualMap: {
            min: minVal,
            max: maxVal,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '0%'
        },
        series: [seriesItem]
    };

    return opt;
}
