import * as fc from 'fast-check'
import { ECHARTS_PRODUCTS, themeSubset } from './themes'

const hierarchyData = [
  { path: 'Grandpa/Father/Child1', value: 10 },
  { path: 'Grandpa/Father/Child2', value: 5 },
  { path: 'Grandpa/Mother/Child3', value: 8 },
  { path: 'Grandma/Uncle/Child4', value: 12 },
]

/**
 * Arbitrary for Sunburst data.
 */
export const sunburstChartArbitrary = fc.constant({
  type: 'sunburst',
  data: hierarchyData,
})

/**
 * Arbitrary for Tree data.
 */
export const treeChartArbitrary = fc.constant({
  type: 'tree',
  data: hierarchyData,
})

/**
 * Arbitrary for Treemap data.
 * Currently flat structure based on transformer implementation.
 */
export const treemapChartArbitrary = themeSubset(ECHARTS_PRODUCTS, 4)
  .chain((names) => {
    return fc.record({
      names: fc.constant(names),
      values: fc.array(
        fc.integer({ min: 10, max: 100 }),
        { minLength: names.length, maxLength: names.length },
      ),
    })
  })
  .map(data => ({
    type: 'treemap',
    data: data.names.map((name, i) => ({
      name: name,
      value: data.values[i]!,
    })),
  }))
