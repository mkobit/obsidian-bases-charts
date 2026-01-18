import { z } from 'zod'
import { jsonParsed } from './json-parsing'

// ECharts theme validation schema
// ECharts themes can be any JSON object, but we want to ensure it's at least an object (not null, string, etc.)
// We could add more specific checks if needed, but for now, just object is safe.
// eslint-disable-next-line functional/prefer-immutable-types
export const themeSchema = jsonParsed(z.object({}).loose())

export const parseTheme = (json: string): object | null => {
  // eslint-disable-next-line functional/prefer-immutable-types
  const result = themeSchema.safeParse(json)
  return result.success ? result.data : null
}

export const validateTheme = (json: string): boolean => {
  return parseTheme(json) !== null
}
