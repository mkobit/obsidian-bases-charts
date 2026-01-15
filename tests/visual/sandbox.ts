import * as echarts from 'echarts'
import { transformDataToChartOption } from '../../src/charts/transformer'
import type { ChartType, BasesData } from '../../src/charts/transformers/base'
import 'echarts-wordcloud'

// Expose render function to window
declare global {
  interface Window {
    renderChart: (
      type: ChartType,
      data: BasesData,
      xProp: string,
      yProp: string,
      options?: Record<string, unknown>,
    ) => void
  }
}

// eslint-disable-next-line functional/no-let
let chartInstance: echarts.ECharts | null = null

// eslint-disable-next-line functional/immutable-data
window.renderChart = (
  type: ChartType,
  data: BasesData,
  xProp: string,
  yProp: string,
  options: Record<string, unknown> = {},
) => {
  const chartDom = document.getElementById('chart')
  if (!chartDom) {
    throw new Error('Chart DOM not found')
  }

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartDom, 'dark') // forcing dark theme for now

  const chartOption = transformDataToChartOption(data, xProp, yProp, type, options)

  chartInstance.setOption(chartOption)

  // Handle resize
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
}
