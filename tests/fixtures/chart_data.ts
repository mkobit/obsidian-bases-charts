import fc from 'fast-check';
import { Temporal } from 'temporal-polyfill';

/**
 * A generic chart data point.
 * Using a generic record allows flexibility while still letting consumers narrow it down if they know the schema.
 * However, for our specific known types (XY, TimeSeries), we should prefer specific interfaces.
 */
export type GenericChartDataPoint = Record<string, unknown>;

/**
 * A data point with explicit X and Y values.
 */
export interface XYPoint {
    x: number | string;
    y: number;
    [key: string]: unknown; // Allow extra properties but enforce x/y
}

/**
 * A data point for time series.
 */
export interface TimePoint {
    date: Temporal.ZonedDateTime | Temporal.PlainDate | string | number; // Support various time formats
    value: number;
    [key: string]: unknown;
}

/**
 * Type alias for a dataset.
 */
export type ChartDataset<T = GenericChartDataPoint> = T[];

// --- Property-based Generators (using fast-check) ---

/**
 * Generator for a generic data point.
 */
export function chartDataPointArbitrary(
    keys: string[] = ['x', 'y'],
    valueArbitrary: fc.Arbitrary<unknown> = fc.oneof(fc.string(), fc.integer(), fc.float())
): fc.Arbitrary<GenericChartDataPoint> {
    const properties: Record<string, fc.Arbitrary<unknown>> = {};
    for (const key of keys) {
        properties[key] = valueArbitrary;
    }
    return fc.record(properties);
}

/**
 * Generator for a generic dataset.
 */
export function chartDatasetArbitrary(
    keys: string[] = ['x', 'y'],
    minLength = 0,
    maxLength = 20
): fc.Arbitrary<ChartDataset<GenericChartDataPoint>> {
    return fc.array(chartDataPointArbitrary(keys), { minLength, maxLength });
}

/**
 * Generator for time-series data using Temporal.
 * Returns explicit `TimePoint` objects (with ZonedDateTime for date).
 */
export function timeSeriesArbitrary(): fc.Arbitrary<ChartDataset<TimePoint>> {
    // Use integers for timestamps to guarantee validity for Temporal
    // 946684800000 = 2000-01-01
    // 2524608000000 = 2050-01-01
    const dateArb = fc.integer({ min: 946684800000, max: 2524608000000 })
        .map(ts => Temporal.Instant.fromEpochMilliseconds(ts).toZonedDateTimeISO('UTC'));

    return fc.array(
        fc.record({
            date: dateArb,
            value: fc.float()
        }),
        { minLength: 1, maxLength: 50 }
    ).map(data => {
        // Sort by time
        return data.sort((a, b) => {
            // inferred type of 'a' has 'date' as ZonedDateTime
            return Temporal.ZonedDateTime.compare(a.date, b.date);
        });
    });
}

// --- Fixed Generators (Deterministic) ---

/**
 * Creates a simple linear dataset.
 */
export function generateLinearData(
    count = 10,
    slope = 1,
    intercept = 0
): ChartDataset<XYPoint> {
    return Array.from({ length: count }, (_, i) => ({
        x: i,
        y: i * slope + intercept
    }));
}

/**
 * Creates a sine wave dataset.
 */
export function generateSineData(
    count = 50,
    frequency = 0.1,
    amplitude = 10
): ChartDataset<XYPoint> {
    return Array.from({ length: count }, (_, i) => ({
        x: i,
        y: Math.sin(i * frequency) * amplitude
    }));
}

/**
 * Creates a time series with daily increments using Temporal.
 */
export function generateDailyTimeSeries(
    count = 10,
    startDateStr = '2023-01-01',
    startValue = 100,
    volatility = 5
): ChartDataset<TimePoint> {
    const data: ChartDataset<TimePoint> = [];
    let currentValue = startValue;

    // Use PlainDate for daily series
    let currentDate = Temporal.PlainDate.from(startDateStr);

    for (let i = 0; i < count; i++) {
        data.push({
            date: currentDate,
            value: Number(currentValue.toFixed(2))
        });

        currentDate = currentDate.add({ days: 1 });
        currentValue += (Math.random() - 0.5) * volatility;
    }
    return data;
}
