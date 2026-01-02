# Obsidian Plugin: ECharts Visualization

## Project Overview
This repository contains an Obsidian plugin that provides advanced data visualizations using **Apache ECharts** and the **Obsidian Bases API**. It allows users to visualize their vault data (properties) through various chart types.

## Roadmap
The goal is to build an assortment of views using:
-   **Apache ECharts**: For advanced data visualization (Primary focus).
-   **Mermaid**: Potentially building on top of the built-in Mermaid plugin support (Future).

## Environment setup
An automated environment setup script is available at `.agents/jules/env_setup.sh`. This script handles the bootstrapping of the development environment by:
-   Managing tool availability (prioritizing `mise` and checking `.nvmrc`).
-   Installing `pnpm` dependencies.

## Architecture
-   **Entry Point**: `src/main.ts` (`BarePlugin` class).
-   **Settings**: `src/settings.ts` (Typed settings management).
-   **Views**:
    -   **BasesView**: We utilize the Obsidian Bases API for views.
    -   **ECharts**: We use Apache ECharts for rendering charts.
    -   **Separation of Concerns**: View logic (`ChartView` subclasses) is separated from data transformation logic (`src/charts/transformers/*.ts`) to facilitate testing and maintenance.
-   **Styles**: `styles.css` (Currently empty, reserved for view styles).
-   **Manifest**: `manifest.json` (Synced via automation).

## CI & pre-commit protocol
To ensure the stability of the codebase and prevent CI failures, strict adherence to the following protocol is **mandatory**.

### Required checks
Before submitting any code, you **MUST** run the following commands locally and ensure they pass:

1.  **`pnpm install`**: Ensures your `pnpm-lock.yaml` is consistent with `package.json`.
2.  **`pnpm run build`**: Runs the TypeScript compiler (`tsc --noEmit`) and the `esbuild` process. This catches type errors.
3.  **`pnpm run lint`**: Runs ESLint. We enforce strict linting (including `obsidianmd/ui/sentence-case`).
4.  **`pnpm run test`**: Runs the Vitest suite.

**If any of these fail, DO NOT submit.** Fix the errors first.

### Troubleshooting common failures
-   **Lockfile Errors**: If CI fails on `pnpm install`, you likely committed a `package-lock.json` (which is forbidden) or your `pnpm-lock.yaml` is out of sync. Always use `pnpm`, never `npm`.
-   **Type Errors**: We run with `"strict": true`.
    -   No implicit `any`.
    -   Use `unknown` instead of `any` where possible.
    -   If accessing properties on `ViewOption` or `ECharts` types, use type guards or explicit casts if the library types are insufficient.
-   **Linting**:
    -   Display names must be "Sentence case".
    -   Unbound methods (callbacks) must be bound (use arrow functions).
-   **Tests**:
    -   New features must have tests.
    -   Test files must be included in `tsconfig.json` to be linted/checked.

## Development Commands

| Command | Description |
| :--- | :--- |
| `pnpm run dev` | Starts `esbuild` in watch mode for development. |
| `pnpm run build` | Runs a full production build (Type check + Build). |
| `pnpm run lint` | Runs ESLint on the source code. |
| `pnpm run test` | Runs unit tests via Vitest. |
| `pnpm run version <type>` | Bumps version in `package.json`, `manifest.json`, and `versions.json`. Usage: `pnpm run version patch` |

## Contributing Guidelines
1.  **Maintain Strictness**: Do not relax TypeScript rules. Fix types properly.
2.  **Verify**: Always run the required checks (`build`, `lint`, `test`) before pushing.
3.  **Clean Code**: Keep `main.ts` focused on lifecycle management. Move heavy logic to separate modules/components.
