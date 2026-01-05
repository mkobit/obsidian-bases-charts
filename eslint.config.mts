import tseslint from 'typescript-eslint';
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import functional from "eslint-plugin-functional";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						'eslint.config.js',
						'manifest.json'
					]
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.json']
			},
		},
	},
	...obsidianmd.configs.recommended,
	{
		plugins: {
			functional
		},
		rules: {
			"functional/no-let": "error",
			"functional/immutable-data": [
				"error",
				{
					ignoreAccessorPattern: [
						"**.style**", // DOM style mutation
						"this.**",     // Allow mutation of class properties (standard in Obsidian plugins)
						"**.value"     // Allow setting value on inputs/nodes if needed
					],
					ignoreClasses: true // simpler way to allow class mutation if supported
				}
			],
			"functional/no-loop-statements": "error",
			// Disable some strictness that might conflict with Obsidian's class-based API or common patterns
			"functional/no-classes": "off",
			"functional/no-this-expressions": "off",
			"functional/no-return-void": "off",
			"functional/no-mixed-types": "off",
			"functional/no-conditional-statements": "off",
			"functional/no-expression-statements": "off",
			"functional/no-try-statements": "off",
			"functional/no-throw-statements": "off",
			"functional/functional-parameters": "off"
		}
	},
	globalIgnores([
		"node_modules",
		"dist",
		"esbuild.config.mjs",
		"eslint.config.js",
		"version-bump.mjs",
		"versions.json",
		"main.js",
	]),
);
