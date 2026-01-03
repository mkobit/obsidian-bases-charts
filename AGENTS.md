# Obsidian Plugin: Bare Foundation

## Project Overview
This repository contains a bare-bones Obsidian plugin configured with strict TypeScript enforcement and automated CI. It serves as the foundation for a future visualization-heavy plugin.

## Roadmap
The goal is to build an assortment of views using:
-   **Apache ECharts**: For advanced data visualization.
-   **Mermaid**: Potentially building on top of the built-in Mermaid plugin support.

## Architecture
-   **Entry Point**: `src/main.ts` (`BarePlugin` class).
-   **Settings**: `src/settings.ts` (Typed settings management).
-   **Views**:
    -   **BasesView**: We utilize the Obsidian Bases API for views.
    -   **ECharts**: We use Apache ECharts for rendering charts.
    -   **Separation of Concerns**: View logic (`ChartView`) is separated from data transformation logic (`transformer.ts`) to facilitate testing and maintenance.
-   **Styles**: `styles.css` (Currently empty, reserved for view styles).
-   **Manifest**: `manifest.json` (Synced via automation).

## Strictness & Quality
-   **TypeScript**: `"strict": true` is enabled in `tsconfig.json`. No implicit `any` allowed.
-   **Linting**: ESLint is configured. Run `pnpm run lint` before committing.
-   **CI**: GitHub Actions workflow (`ci.yml`) enforces build success, type safety, and linting on every push.
-   **Functional programming**:
    -   **Prioritize immutability**: Avoid mutating enclosed state. Use pure functions where possible.
    -   **Use functional transformations**: Prefer `map`, `reduce`, `filter` over imperative loops like `forEach` or `for`.
    -   **Avoid side effects**: Ensure transformer functions calculate results without side effects.

## Development Commands

| Command | Description |
| :--- | :--- |
| `pnpm run dev` | Starts `esbuild` in watch mode for development. |
| `pnpm run build` | Runs a full production build (Type check + Build). |
| `pnpm run lint` | Runs ESLint on the source code. |
| `pnpm run version <type>` | Bumps version in `package.json`, `manifest.json`, and `versions.json`. Usage: `pnpm run version patch` |

## Contributing Guidelines
1.  **Maintain Strictness**: Do not relax TypeScript rules. Fix types properly.
2.  **Verify**: Always run the following commands locally to verify your changes before opening a pull request:
    - `pnpm run build`
    - `pnpm run lint`
    - `pnpm run test`
3.  **Clean Code**: Keep `main.ts` focused on lifecycle management. Move heavy logic to separate modules/components.
