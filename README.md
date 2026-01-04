# Obsidian Plugin

This is a bare Obsidian plugin.

## Usage

Describe your plugin here.

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
2.  **Install the Plugin**: Create a directory inside your vault at `.obsidian/plugins/obsidian-sample-plugin` (or your plugin ID).
3.  **Deploy Files**: Copy `main.js`, `manifest.json`, and `styles.css` into that directory.

For a smoother development experience, we recommend using the **Hot Reload** plugin:
-   [https://github.com/pjeby/hot-reload](https://github.com/pjeby/hot-reload)

With Hot Reload installed in your test vault, you can symlink the plugin directory or configure a build script to copy files automatically. The Hot Reload plugin will detect changes to `main.js` and reload the plugin automatically.

### Documentation

For more information on building Obsidian plugins, refer to the official documentation:
-   [Build a plugin - Obsidian Developer Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
