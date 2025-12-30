import type { EChartsOption } from 'echarts';

/**
 * Transforms Bases data into an ECharts option object.
 *
 * @param data The raw data array from the Bases query.
 * @param xProp The property key to use for the X-axis (category).
 * @param yProp The property key to use for the Y-axis (value).
 * @returns An ECharts option object.
 */
export function transformDataToChartOption(data: Record<string, any>[], xProp: string, yProp: string): EChartsOption {
    const xData: string[] = [];
    const yData: number[] = [];

    // Map to aggregate values if there are duplicate x-axis categories
    // Or just push for now. Let's assume aggregation might be needed later,
    // but for "basic", simple mapping is enough.
    // However, charts usually expect unique categories on X-axis or it treats them as separate points.

    for (const item of data) {
        // We only care about the properties, not the full object structure if it's nested.
        // Bases data usually comes as flat objects or with predictable structure.
        // Let's assume `data` is an array of objects where keys are property names.

        let xVal = item[xProp];
        let yVal = item[yProp];

        // Handle potential nesting or different structures if needed,
        // but for now assume direct access.

        // Handle "file.name" or similar if passed as prop
        if (xProp.includes('.')) {
             xVal = getNestedValue(item, xProp);
        }
        if (yProp.includes('.')) {
             yVal = getNestedValue(item, yProp);
        }

        // Basic validation
        if (xVal === undefined || xVal === null) {
            xVal = "Unknown";
        }

        // Ensure yVal is a number
        const numVal = parseFloat(yVal);

        if (!isNaN(numVal)) {
            xData.push(String(xVal));
            yData.push(numVal);
        }
    }

    return {
        xAxis: {
            type: 'category',
            data: xData,
            name: xProp
        },
        yAxis: {
            type: 'value',
            name: yProp
        },
        series: [
            {
                data: yData,
                type: 'bar',
                name: yProp
            }
        ],
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            containLabel: true
        }
    };
}

function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, key) => (o && o[key] !== undefined) ? o[key] : undefined, obj);
}
