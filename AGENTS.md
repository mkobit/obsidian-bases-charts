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
-   **Linting**: ESLint is configured with strict functional programming rules.
-   **Pre-commit Protocol**: We use **Husky** and **lint-staged** to enforce quality standards automatically.
    -   When you commit, `eslint --fix` runs on staged files to fix style issues and enforce rules.
    -   `tsc-files` runs to ensure staged files pass type checking.
    -   `pnpm dedupe` ensures dependencies are clean.
-   **CI**: GitHub Actions workflow (`ci.yml`) enforces build success, type safety, and linting on every push, acting as a final gate.

## Functional programming protocol

We strictly enforce functional programming principles to ensure code clarity, prevent side effects, and improve maintainability.

### 1. Immutability is mandatory
-   **No Mutations**: Do not mutate objects or arrays after creation.
    -   ❌ `array.push(item)`
    -   ❌ `obj.prop = value`
    -   ✅ Use `[...array, item]` or `remeda`'s functions.
    -   ✅ Use `{ ...obj, prop: value }`.
-   **No Let**: Use `const` exclusively. Reassignment is banned.

### 2. No imperative loops
-   **Ban Loops**: `for`, `for...of`, `while`, and `do...while` are strictly forbidden.
-   **Use Declarative Transforms**:
    -   Use `map`, `filter`, `reduce` (sparingly, prefer specific transforms), `flatMap`, etc.
    -   For complex pipelines, use **[Remeda](https://remedajs.com/)** (`remeda`).
        ```typescript
        import * as R from 'remeda';

        // Instead of a loop:
        const result = R.pipe(
          items,
          R.filter(item => item.active),
          R.map(item => item.value),
          R.sum()
        );
        ```

### 3. Iterators and lazy evaluation
-   **Lazy Iterators**: Use modern Iterator helpers (e.g., `.values()`, `Iterator.from()`) where appropriate to avoid creating intermediate arrays for large datasets.
-   **Streamlining**: Adopt libraries like `remeda` to optimize and streamline development.
-   **Exceptions**: The only time we should consider not doing this is when a third-party library requires it (e.g., Obsidian API, ECharts). In that case, explicitly disable the lints for that specific block.

### 4. Pure functions
-   **No Side Effects**: Functions, especially transformers, must be pure. They should take input and return output without modifying external state.

## Date and time protocol
-   **Temporal**: Use the `Temporal` API (via `temporal-polyfill`) for all date and time logic within the plugin's core logic and scripts.
-   **Avoid Date**: Avoid using the native `Date` class whenever possible.
-   **Moment.js**: Only use `moment` (which Obsidian depends on) when interacting directly with Obsidian APIs that require it or when formatting dates for Obsidian UI where `moment` is the standard. Isolate these usages.

## Development Commands

| Command | Description |
| :--- | :--- |
| `pnpm run dev` | Starts `esbuild` in watch mode for development. |
| `pnpm run build` | Runs a full production build (Type check + Build). |
| `pnpm run lint` | Runs ESLint on the source code. |
| `pnpm run version <type>` | Bumps version in `package.json`, `manifest.json`, and `versions.json`. Usage: `pnpm run version patch` |

## Contributing guidelines
1.  **Maintain Strictness**: Do not relax TypeScript rules or linter rules.
2.  **Verify**: Always run the following commands locally to verify your changes before opening a pull request:
    - `pnpm run build`
    - `pnpm run test`
    *Note: Linting and Type Checking are automatically verified on commit via Husky.*
3.  **Clean Code**: Keep `main.ts` focused on lifecycle management. Move heavy logic to separate modules/components.
