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
-   **Styles**: `styles.css` (Currently empty, reserved for view styles).
-   **Manifest**: `manifest.json` (Synced via automation).

## Strictness & Quality
-   **TypeScript**: `"strict": true` is enabled in `tsconfig.json`. No implicit `any` allowed.
-   **Linting**: ESLint is configured. Run `npm run lint` before committing.
-   **CI**: GitHub Actions workflow (`ci.yml`) enforces build success, type safety, and linting on every push.

## Development Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts `esbuild` in watch mode for development. |
| `npm run build` | Runs a full production build (Type check + Build). |
| `npm run lint` | Runs ESLint on the source code. |
| `npm run version <type>` | Bumps version in `package.json`, `manifest.json`, and `versions.json`. Usage: `npm run version patch` |

## Contributing Guidelines
1.  **Maintain Strictness**: Do not relax TypeScript rules. Fix types properly.
2.  **Verify**: Always run `npm run build` and `npm run lint` before submitting.
3.  **Clean Code**: Keep `main.ts` focused on lifecycle management. Move heavy logic to separate modules/components.
