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
    functional.configs.recommended,
    functional.configs.noMutations,
    functional.configs.externalVanillaRecommended,
    {
        // Fix for missing @typescript-eslint plugin in functional.configs.externalTypeScriptRecommended
        ...functional.configs.externalTypeScriptRecommended,
        // Only apply to TS files
        files: ["**/*.ts", "**/*.tsx"],
        plugins: {
            "@typescript-eslint": tseslint.plugin
        }
    },

	// Manual plugin setup
	{
        // Only apply strict obsidian rules to TS files where we have type info
        files: ["**/*.ts", "**/*.tsx"],
		plugins: {
            obsidianmd,
			functional,
			promise,
            "@typescript-eslint": tseslint.plugin
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
            // "functional/prefer-readonly-type": "error", // Deprecated and removed

			// Obsidian Compatibility overrides (Global)
			"functional/no-classes": "error",
			"functional/no-this-expressions": "error",
			"functional/no-return-void": "error",
			"functional/no-mixed-types": "error",
			"functional/functional-parameters": "error",
			"functional/no-try-statements": "error",
			"functional/no-throw-statements": "error",

			// Additional clean code rules
			"no-console": "warn",
			"eqeqeq": "error",
			"curly": "error",

            // Type Safety Rules
            "@typescript-eslint/consistent-type-assertions": ["error", {
                assertionStyle: "never"
            }]
		}
	},
    // Overrides
    {
        files: ["src/views/**/*.ts", "tests/**/*.ts", "tests/**/*.tsx", "src/main.ts", "src/settings.ts"],
        rules: {
            "functional/no-conditional-statements": "off",
            "functional/no-expression-statements": "off",
            "functional/immutable-data": "off", // Tests often need mutation
             // Allow casting in tests and views if necessary, though ideally avoided
             "@typescript-eslint/consistent-type-assertions": "off",
             // Obsidian API requires classes, this, void returns (lifecycle methods), and specific params
            "functional/no-classes": "off",
            "functional/no-class-inheritance": "off",
            "functional/prefer-immutable-types": "off",
            "functional/no-this-expressions": "off",
            "functional/no-return-void": "off",
            "functional/functional-parameters": "off",
            "functional/no-try-statements": "off",
            // Tests might use throw implicitly or test error cases
            "functional/no-throw-statements": "off"
        }
    },
	globalIgnores([
		"node_modules",
		"dist",
		"esbuild.config.mjs",
		"eslint.config.js",
		"versions.json",
		"main.js",
		"coverage"
	]),
    // Node scripts
    {
        files: ["scripts/**/*.ts", "esbuild.config.mjs"],
        languageOptions: {
            globals: {
                ...globals.node
            }
        },
        rules: {
            "functional/no-conditional-statements": "off",
            "functional/no-expression-statements": "off",
            "functional/immutable-data": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "import/no-nodejs-modules": "off",
            "no-console": "off",
            "functional/no-return-void": "off",
            "functional/functional-parameters": "off",
            "functional/no-throw-statements": "off",
            "functional/no-try-statements": "off"
        }
    }
);
