# Example Chart Data

This folder contains example data files that can be used with the **Obsidian Charts** plugin.

## How to Use

1.  Open this folder (`example`) as an Obsidian vault.
2.  Install the **Obsidian Charts** plugin (if not already installed).
3.  Install the **Bases** plugin (required for creating views).
4.  Create a new **Bases View** and select the desired chart type.
5.  Configure the view using the properties listed below.

## Chart Configurations

### Bar, Line, Area, Pie, Stacked Bar Charts
- **Data Source**: Files starting with `Sales-`
- **X-Axis Property**: `Date` or `Category` or `Region`
- **Y-Axis Property**: `Revenue` or `Cost`
- **Series Property**: `Region` (for stacked/grouped charts)

### Candlestick Chart
- **Data Source**: Files starting with `Stock-`
- **X-Axis Property**: `Date`
- **Open Property**: `Open`
- **Close Property**: `Close`
- **High Property**: `High`
- **Low Property**: `Low`

### Heatmap Chart
- **Data Source**: Files starting with `Metric-`
- **X-Axis Property**: `Time`
- **Y-Axis Property**: `Server`
- **Value Property**: `Load`

### Treemap, Sunburst, Tree Charts
- **Data Source**: Files starting with `Task-`
- **X-Axis Property**: `Path` (e.g., "Project/Backend/API")
- **Value Property**: `Value`

### Scatter, Bubble, Funnel Charts
- **Data Source**: Files starting with `Country-Stats-`
- **X-Axis Property**: `GDP`
- **Y-Axis Property**: `LifeExpectancy`
- **Size Property**: `Population` (for Bubble Chart)
- **Series Property**: `Continent`

### Sankey, Graph Charts
- **Data Source**: Files starting with `Flow-`
- **Source Property**: `Source`
- **Target Property**: `Target`
- **Value Property**: `Amount`

### Calendar Chart
- **Data Source**: Files starting with `Journal-`
- **X-Axis Property**: `Date`
- **Value Property**: `Mood`

### Parallel, Radar Charts
- **Data Source**: Files starting with `Character-`
- **X-Axis Property**: `Strength`, `Intelligence`, `Agility` (Type these as comma-separated values in the input field for Parallel Chart)
- **Series Property**: `Class` (for grouping)
    *   *Note for Radar*: Usually requires one dimension per axis. This setup might need adjustment depending on how Radar chart maps dimensions.

### Boxplot Chart
- **Data Source**: Files starting with `Score-`
- **X-Axis Property**: `Subject`
- **Y-Axis Property**: `Score`

### ThemeRiver Chart
- **Data Source**: Files starting with `News-`
- **X-Axis Property**: `Date`
- **Value Property**: `Mentions`
- **Series Property**: `Topic`
