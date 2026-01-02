# Chart views for Obsidian Bases

This plugin brings the power of [Apache ECharts](https://echarts.apache.org/) to Obsidian, integrating seamlessly with the [Bases API](https://github.com/obsidian-bases/bases). It allows you to create dynamic, data-driven visualizations directly from your vault's properties.

## Features

-   **Deep integration**: Built on the Obsidian Bases API to consume data from your vault's properties.
-   **Wide variety of charts**: Supports a comprehensive suite of ECharts visualizations.
-   **Interactive**: Charts are rendered using the ECharts library, providing tooltips, zooming, and filtering.

For examples of the types of visualizations possible, see the [Apache ECharts examples](https://echarts.apache.org/examples/en/index.html).

## Usage

This plugin registers "views" with the Bases API. To use it:
1.  Ensure you have a plugin installed that acts as a Bases host (or use the Bases Example).
2.  Select one of the chart types from the view selector.
3.  Configure the view options (e.g., select which property to use for the X-Axis, Y-Axis, etc.).

## Development

See [AGENTS.md](AGENTS.md) for detailed development and contribution guidelines.
