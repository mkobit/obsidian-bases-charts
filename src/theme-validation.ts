import { z } from 'zod'

// ECharts theme validation schema
// ECharts themes can be any JSON object, but we want to ensure it's at least an object (not null, string, etc.)
// We could add more specific checks if needed, but for now, just object is safe.
// eslint-disable-next-line functional/prefer-immutable-types
export const themeSchema = z.object({}).loose()

export const validateTheme = (json: string): boolean => {
  // eslint-disable-next-line functional/no-try-statements
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsed = JSON.parse(json)
    // eslint-disable-next-line functional/no-expression-statements
    themeSchema.parse(parsed)
    return true
  }
  catch {
    return false
  }
}
