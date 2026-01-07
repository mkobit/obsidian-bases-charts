# Obsidian Bases Charts

> [!WARNING]
> **Work in Progress** as of 2026-01-07. This plugin is under active development.

## Project Summary

Obsidian Bases Charts is a visualization-heavy plugin for Obsidian that bridges the gap between your vault's data and powerful, interactive charts.

By leveraging the **Obsidian Bases API** for data querying and **Apache ECharts** for rendering, this plugin allows you to create dynamic visualizations driven directly by the properties in your notes.

## Goals

- **Data-Driven**: Utilize the Obsidian Bases API to query and aggregate data from your vault properties efficiently.
- **Advanced Visualization**: Provide a comprehensive suite of chart types (Bar, Line, Pie, Scatter, Heatmap, and more) using the robust Apache ECharts library.
- **Flexible Configuration**: Enable users to define and customize views using intuitive configuration files (`.base` files) or UI-based settings.
- **Performance**: Ensure high performance and responsiveness, even with large datasets, by using optimized data structures and chart rendering techniques.
- **Extensibility**: Lay the groundwork for future integrations, such as Mermaid diagrams or custom chart types.

## Development

This project uses [pnpm](https://pnpm.io/) and Node.js.

### Prerequisites

- Node.js (v22 recommended)
- pnpm

### Setup

Install dependencies:

```bash
pnpm install
```

### Building

To build the plugin in watch mode (for development):

```bash
pnpm dev
```

To build for production:

```bash
pnpm build
```

### Manual Testing

To test the plugin in Obsidian, you need to load the built files into a vault.

1.  **Prepare a Vault**: You can use the provided `example/` directory as a test vault, or create a new one.
2.  **Install the Plugin**: Create a directory inside your vault at `.obsidian/plugins/obsidian-bases-charts` (or your preferred ID).
3.  **Deploy Files**: Copy `main.js`, `manifest.json`, and `styles.css` into that directory.

For a smoother development experience, we recommend using the **Hot Reload** plugin:
-   [https://github.com/pjeby/hot-reload](https://github.com/pjeby/hot-reload)

### License

MIT License
