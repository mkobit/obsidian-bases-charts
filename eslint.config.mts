import tseslint from 'typescript-eslint';
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import functional from "eslint-plugin-functional";
import promise from "eslint-plugin-promise";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
	{
		languageOptions: {
			globals: {
				...globals.browser,
				// Ensure global objects like Number are known
				Number: "readonly",
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
	// Recommended configs
	...obsidianmd.configs.recommended,

	// Manual plugin setup
	{
        // Only apply strict obsidian rules to TS files where we have type info
        files: ["**/*.ts", "**/*.tsx"],
		plugins: {
            obsidianmd,
			functional,
			promise
		},
		rules: {
			...promise.configs.recommended.rules,

            // ObsidianMD Rules - Enable ALL rules explicitly or ensure they are covered
            "obsidianmd/prefer-file-manager-trash-file": "error",

			// Functional Rules - STRICTER
			"functional/no-let": "error",
			"functional/immutable-data": [
				"error",
				{
					ignoreAccessorPattern: [
						"**.style**", // DOM style mutation
						"this.**",     // Allow mutation of class properties (standard in Obsidian plugins)
						"**.value"     // Allow setting value on inputs/nodes if needed
					],
					ignoreClasses: true
				}
			],
			"functional/no-loop-statements": "error",
			"functional/no-conditional-statements": "error",
			"functional/no-expression-statements": ["error", { ignoreVoid: true }],
            "functional/prefer-readonly-type": "off",

			// Obsidian Compatibility overrides (Global)
			"functional/no-classes": "off",
			"functional/no-this-expressions": "off",
			"functional/no-return-void": "off",
			"functional/no-mixed-types": "off",
			"functional/functional-parameters": "off",
			"functional/no-try-statements": "off",
			"functional/no-throw-statements": "off",

			// Additional clean code rules
			"no-console": "warn",
			"eqeqeq": "error",
			"curly": "error",
		}
	},
    // Overrides
    {
        files: ["src/views/**/*.ts", "tests/**/*.ts", "tests/**/*.tsx", "src/main.ts", "src/settings.ts"],
        rules: {
            "functional/no-conditional-statements": "off",
            "functional/no-expression-statements": "off",
            "functional/immutable-data": "off", // Tests often need mutation
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
		"coverage"
	]),
);
