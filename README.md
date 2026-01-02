# Obsidian ECharts Visualization Plugin

This plugin brings the power of [Apache ECharts](https://echarts.apache.org/) to Obsidian, integrating seamlessly with the [Bases API](https://github.com/obsidian-bases/bases). It allows you to create dynamic, data-driven visualizations directly from your vault's properties.

## Features

-   **Deep Integration**: Built on the Obsidian Bases API to consume data from your vault's properties.
-   **Wide Variety of Charts**: Supports a comprehensive suite of ECharts visualizations.
-   **Interactive**: Charts are rendered using the ECharts library, providing tooltips, zooming, and filtering.

## Supported Chart Types

The following chart types are currently implemented:

### Basic Charts
-   **Bar Chart**: Visualize categorical data.
-   **Line Chart**: Perfect for trends over time.
-   **Pie Chart**: Display proportions.
-   **Scatter Chart**: Analyze correlations between two variables.
-   **Bubble Chart**: Three-dimensional data (x, y, size).
-   **Area Chart**: Line chart with filled area.
-   **Stacked Bar Chart**: Visualize parts of a whole across categories.

### Financial & Statistical
-   **Candlestick Chart**: Financial OHLC (Open-High-Low-Close) data.
-   **Boxplot Chart**: Statistical distribution of data.
-   **Gauge Chart**: Single value monitoring (e.g., progress, KPIs).

### Hierarchical & Relational
-   **Treemap**: Hierarchical data with nested rectangles.
-   **Sunburst**: Radial hierarchical visualization.
-   **Tree Chart**: Node-link diagrams for trees.
-   **Sankey Chart**: Flow visualization (source to target).
-   **Graph Chart**: Force-directed graph layouts for network data.

### Specialized
-   **Radar Chart**: Multivariate data on radial axes.
-   **Funnel Chart**: Stages in a process.
-   **Heatmap**: Matrix data with color coding.
-   **ThemeRiver**: Evolution of themes over time.
-   **Calendar Chart**: Activity over time (GitHub-style contribution graphs).

## Usage

This plugin registers "views" with the Bases API. To use it:
1.  Ensure you have a plugin installed that acts as a Bases host (or use the Bases Example).
2.  Select one of the chart types from the view selector.
3.  Configure the view options (e.g., select which property to use for the X-Axis, Y-Axis, etc.).

## Development

See [AGENTS.md](AGENTS.md) for detailed development and contribution guidelines.
