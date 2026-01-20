import * as fc from 'fast-check'

export const WEEK_DAYS = ['Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun']
export const MONTHS = ['Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec']
export const PRODUCT_NAMES = ['Matcha Latte',
  'Milk Tea',
  'Cheese Cocoa',
  'Walnut Brownie']
export const BROWSERS = ['Chrome',
  'Firefox',
  'Safari',
  'Edge',
  'Opera']
export const TRAFFIC_SOURCES = ['Search Engine',
  'Direct',
  'Email',
  'Union Ads',
  'Video Ads']

/**
 * Arbitrary that selects a random subset of a theme array, preserving order.
 */
export function themeSubset(theme: string[], minLength = 3) {
  return fc.subarray(
    theme,
    { minLength,
      maxLength: theme.length },
  )
}

/**
 * Arbitrary that selects a single item from a theme.
 */
export function themeItem(theme: string[]) {
  return fc.constantFrom(...theme)
}
