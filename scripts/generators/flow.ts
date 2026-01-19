import * as fc from 'fast-check'

/**
 * Arbitrary for Sankey chart data.
 * Generates a simple multi-stage flow.
 */
export const sankeyChartArbitrary = fc.constant(null).map((_?: unknown) => {
  // Hardcoded simple structure to ensure valid flow
  const data = [
    { source: 'A',
      target: 'B',
      value: 10 },
    { source: 'A',
      target: 'C',
      value: 15 },
    { source: 'B',
      target: 'D',
      value: 8 },
    { source: 'B',
      target: 'E',
      value: 2 },
    { source: 'C',
      target: 'E',
      value: 10 },
    { source: 'C',
      target: 'F',
      value: 5 },
  ]
  return {
    type: 'sankey',
    data,
  }
})

/**
 * Arbitrary for Graph chart data.
 * Generates nodes and links.
 */
export const graphChartArbitrary = fc.record({
  nodeCount: fc.integer({ min: 5,
    max: 15 }),
}).chain((config) => {
  return fc.array(
    fc.record({
      targetIndex: fc.integer({ min: 0,
        max: config.nodeCount - 1 }),
      value: fc.integer({ min: 1,
        max: 10 }),
    }),
    { minLength: config.nodeCount,
      maxLength: config.nodeCount * 2 },
  ).map((linksData) => {
    const nodes = Array.from({ length: config.nodeCount }, (_, i) => `Node ${i}`)

    // Create links ensuring source != target to avoid self-loops if desired (though graph supports them)
    const links = linksData.map((l, i) => {
      const sourceIndex = i % config.nodeCount
      const rawTargetIndex = l.targetIndex
      const targetIndex = sourceIndex === rawTargetIndex
        ? (rawTargetIndex + 1) % config.nodeCount
        : rawTargetIndex

      return {
        source: nodes[sourceIndex],
        target: nodes[targetIndex],
        value: l.value,
        category: i % 2 === 0 ? 'Cat A' : 'Cat B', // Optional category
      }
    })

    return {
      type: 'graph',
      data: links, // The transformer infers nodes from links
    }
  })
})

/**
 * Arbitrary for Lines chart data.
 * Generates coordinate pairs.
 */
export const linesChartArbitrary = fc.record({
  count: fc.integer({ min: 5,
    max: 20 }),
}).chain((config) => {
  return fc.array(
    fc.record({
      x1: fc.float({ min: 0,
        max: 100 }),
      y1: fc.float({ min: 0,
        max: 100 }),
      x2: fc.float({ min: 0,
        max: 100 }),
      y2: fc.float({ min: 0,
        max: 100 }),
    }),
    { minLength: config.count,
      maxLength: config.count },
  ).map((lines) => {
    return {
      type: 'lines',
      data: lines.map(l => ({
        start_x: parseFloat(l.x1.toFixed(1)),
        start_y: parseFloat(l.y1.toFixed(1)),
        end_x: parseFloat(l.x2.toFixed(1)),
        end_y: parseFloat(l.y2.toFixed(1)),
      })),
    }
  })
})
