/* eslint-disable functional/no-expression-statements */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/functional-parameters */
/* eslint-disable functional/no-conditional-statements */
/* eslint-disable functional/prefer-immutable-types */

import * as echarts from 'echarts'
import { transformDataToChartOption } from '../src/charts/transformer'
import type { ChartType, BasesData } from '../src/charts/transformers/base'
import { Platform } from './obsidian-mock'
import 'echarts-wordcloud'

// Chart Data Definitions
interface ChartExample {
  readonly type: ChartType
  readonly label: string
  readonly data: BasesData
  readonly xProp: string
  readonly yProp: string
  readonly options?: Record<string, unknown>
}

const EXAMPLES: ChartExample[] = [
  {
    type: 'bar',
    label: 'Bar Chart',
    data: [
      { category: 'Mon', value: 120 },
      { category: 'Tue', value: 200 },
      { category: 'Wed', value: 150 },
      { category: 'Thu', value: 80 },
      { category: 'Fri', value: 70 },
      { category: 'Sat', value: 110 },
      { category: 'Sun', value: 130 },
    ],
    xProp: 'category',
    yProp: 'value',
    options: { xAxisLabel: 'Day', yAxisLabel: 'Sales' },
  },
  {
    type: 'line',
    label: 'Line Chart',
    data: [
      { date: '2023-01-01', value: 10 },
      { date: '2023-01-02', value: 15 },
      { date: '2023-01-03', value: 8 },
      { date: '2023-01-04', value: 25 },
      { date: '2023-01-05', value: 18 },
    ],
    xProp: 'date',
    yProp: 'value',
    options: { xAxisLabel: 'Date', yAxisLabel: 'Count' },
  },
  {
    type: 'scatter',
    label: 'Scatter Chart',
    data: [
      { x: 10, y: 8.04, series: 'I' },
      { x: 8, y: 6.95, series: 'I' },
      { x: 13, y: 7.58, series: 'I' },
      { x: 10, y: 9.14, series: 'II' },
      { x: 8, y: 8.14, series: 'II' },
      { x: 13, y: 8.74, series: 'II' },
    ],
    xProp: 'x',
    yProp: 'y',
    options: { seriesProp: 'series', xAxisLabel: 'X', yAxisLabel: 'Y' },
  },
  {
    type: 'pie',
    label: 'Pie Chart',
    data: [
      { name: 'Search', value: 1048 },
      { name: 'Direct', value: 735 },
      { name: 'Email', value: 580 },
      { name: 'Union Ads', value: 484 },
      { name: 'Video Ads', value: 300 },
    ],
    xProp: 'name',
    yProp: 'value',
    options: { legend: true },
  },
  {
    type: 'wordCloud',
    label: 'Word Cloud',
    data: [
      { text: 'Obsidian', weight: 10 },
      { text: 'Bases', weight: 8 },
      { text: 'Charts', weight: 8 },
      { text: 'Visualization', weight: 6 },
      { text: 'Data', weight: 6 },
      { text: 'Plugin', weight: 5 },
      { text: 'Markdown', weight: 5 },
      { text: 'Canvas', weight: 4 },
      { text: 'Graph', weight: 4 },
      { text: 'Nodes', weight: 3 },
    ],
    xProp: 'text',
    yProp: 'weight',
    options: {},
  },
]

// App State
// eslint-disable-next-line functional/no-let
let currentChart: ChartExample = EXAMPLES[0]!
// eslint-disable-next-line functional/no-let
let chartInstance: echarts.ECharts | null = null

function render() {
  const chartDom = document.getElementById('chart')
  if (!chartDom) {
    return
  }

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartDom, 'dark')

  // eslint-disable-next-line functional/no-try-statements
  try {
    const option = transformDataToChartOption(
      currentChart.data,
      currentChart.xProp,
      currentChart.yProp,
      currentChart.type,
      currentChart.options,
    )
    chartInstance.setOption(option)
  }
  catch (e) {
    console.error('Failed to render chart:', e)
  }
}

function init() {
  const listEl = document.getElementById('chart-list')
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const mobileToggle = document.getElementById('mobile-toggle') as HTMLInputElement

  // Init Sidebar
  EXAMPLES.forEach((ex) => {
    const btn = document.createElement('button')
    btn.textContent = ex.label
    btn.onclick = () => {
      // Update active state
      document.querySelectorAll('button').forEach((b) => {
        b.classList.remove('active')
      })
      btn.classList.add('active')

      // Render
      currentChart = ex
      render()
    }
    listEl?.appendChild(btn)
  })

  // Select first by default
  const firstBtn = listEl?.querySelector('button')
  firstBtn?.classList.add('active')

  // Mobile Toggle
  if (mobileToggle) {
    mobileToggle.onchange = (e) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      Platform.isMobile = (e.target as HTMLInputElement).checked
      // eslint-disable-next-line no-console
      console.log('Mobile Mode:', Platform.isMobile)
      render() // Re-render to catch any mobile-specific logic in transformers
    }
  }

  // Window Resize
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })

  // Initial Render
  render()
}

// Start
init()
