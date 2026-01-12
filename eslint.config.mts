import tseslint from 'typescript-eslint';
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import functional from "eslint-plugin-functional";
import promise from "eslint-plugin-promise";
import stylistic from "@stylistic/eslint-plugin";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
	{
		languageOptions: {
			globals: {
				...globals.browser,
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
	functional.configs.strict,
	functional.configs.stylistic,
	{
		...functional.configs.externalTypeScriptRecommended,
		files: ["**/*.ts", "**/*.tsx"],
		plugins: {
			"@typescript-eslint": tseslint.plugin
		}
	},

	// Manual plugin setup
	{
		files: ["**/*.ts", "**/*.tsx"],
		plugins: {
			obsidianmd,
			functional,
			promise,
			"@typescript-eslint": tseslint.plugin,
            "@stylistic": stylistic
		},
		rules: {
			...promise.configs.recommended.rules,

			// ObsidianMD Rules
			"obsidianmd/prefer-file-manager-trash-file": "error",

			// Additional clean code rules
			"no-console": "warn",
			"eqeqeq": "error",
			"curly": "error",

			// Type Safety Rules
			"@typescript-eslint/consistent-type-assertions": ["error", {
				assertionStyle: "never"
			}],
            // Enforce separate type imports (User Request)
            "@typescript-eslint/consistent-type-imports": ["error", {
                "prefer": "type-imports",
                "fixStyle": "separate-type-imports"
            }],

            // Stylistic Rules (User Request)
            // Indentation (Tab based as per .editorconfig)
            "@stylistic/indent": ["error", "tab"],
            "@stylistic/no-mixed-spaces-and-tabs": "error",

            // Trailing commas
            "@stylistic/comma-dangle": ["error", "always-multiline"],
            // Single arg per line (for call arguments)
            "@stylistic/function-call-argument-newline": ["error", "always"],
            // Single parameter per line (for function definitions)
            "@stylistic/function-paren-newline": ["error", "multiline"],
            // Single array element per line
            "@stylistic/array-element-newline": ["error", "always"],
            // Single object property per line
            "@stylistic/object-property-newline": ["error", { "allowAllPropertiesOnSameLine": false }],
             // Consistent object curly spacing
            "@stylistic/object-curly-spacing": ["error", "always"],
            // Quote style (usually desirable with stylistic)
            "@stylistic/quotes": ["error", "single", { "avoidEscape": true }],
            // Semi (implied by good style)
            "@stylistic/semi": ["error", "always"],


            // Ensure strictness explicitly (reinforcing 'strict' config)
            "functional/no-let": "error",
            "functional/no-loop-statements": "error",
            "functional/no-conditional-statements": "error",
            "functional/no-expression-statements": ["error", { ignoreVoid: true }],
            "functional/no-classes": "error",
            "functional/no-this-expressions": "error",
            "functional/no-return-void": "error",
            "functional/no-mixed-types": "error",
            "functional/no-try-statements": "error",
            "functional/no-throw-statements": "error",
            "functional/immutable-data": ["error", {
                ignoreClasses: true,
                ignoreAccessorPattern: ["this.**"]
            }],

            // DISABLE Strict Type Immutability Rules Globally
            // These rules (from 'stylistic' and 'strict') are too aggressive for the current codebase,
            // especially when interacting with ECharts (mutable types) and Obsidian APIs.
            // Enabling them requires significant refactoring or deep type wrappers.
            "functional/prefer-immutable-types": "off",
            "functional/type-declaration-immutability": "off",
            "functional/readonly-type": "off"
		}
	},
	// Overrides for Configuration Files
	{
		files: ["package.json"],
		rules: {
			"depend/ban-dependencies": "off"
		}
	},
	// Overrides for Obsidian Plugin Code (Views, Main, Settings)
	{
		files: ["src/views/**/*.ts", "src/main.ts", "src/settings.ts"],
		rules: {
            // RELAX Functional Rules for Obsidian API
            // The Obsidian API necessitates classes, inheritance, side effects, and mutations (of 'this').
			"functional/no-expression-statements": "off",
			"@typescript-eslint/consistent-type-assertions": "off",
			"functional/no-classes": "off",
			"functional/no-class-inheritance": "off",
			"functional/no-this-expressions": "off",
			"functional/no-return-void": "off",
			"functional/no-try-statements": "off",
			"functional/no-throw-statements": "off",
            "functional/no-loop-statements": "off",
            "functional/no-conditional-statements": "off",
            "functional/no-mixed-types": "off",
            "functional/functional-parameters": "off",
			"functional/immutable-data": ["error", {
				ignoreClasses: true,
				ignoreAccessorPattern: ["this.**"]
			}]
		}
	},
    // Overrides for Tests
    {
        files: ["tests/**/*.ts", "tests/**/*.tsx"],
        rules: {
            // Relax rules for Testing patterns (Assertions, Mocking, Setup/Teardown)
            "functional/no-expression-statements": "off", // Needed for expect() assertions
            "@typescript-eslint/consistent-type-assertions": "off", // Needed for mocking
            "functional/no-return-void": "off", // Needed for test/beforeEach callbacks
            "functional/no-classes": "off", // Allowed in tests if needed (e.g. mock classes)
            "functional/no-class-inheritance": "off",
            "functional/no-this-expressions": "off",
            "functional/no-try-statements": "off",
            "functional/no-throw-statements": "off",
            "functional/no-loop-statements": "off",
            "functional/no-conditional-statements": "off",
            "functional/no-mixed-types": "off",
            "functional/functional-parameters": "off",
            "functional/immutable-data": ["error", {
                ignoreClasses: true,
                ignoreAccessorPattern: ["this.**"]
            }]
        }
    },
    // Scripts
    {
        files: ["scripts/**/*.ts", "scripts/**/*.cjs", "esbuild.config.mjs", "version-bump.mjs"],
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
            "@typescript-eslint/no-var-requires": "off",
            "import/no-nodejs-modules": "off",
            "no-console": "off",
            "functional/no-return-void": "off",
            "functional/no-throw-statements": "off",
            "functional/no-try-statements": "off",
            "functional/no-classes": "off",
            "functional/no-this-expressions": "off",
            "functional/prefer-immutable-types": "off",
            "functional/type-declaration-immutability": "off",
            "functional/readonly-type": "off",
            // Allow require in scripts
             "@typescript-eslint/no-require-imports": "off",
             // Relax stylistic indent for scripts if mixed content, but generally enforce tab
             "@stylistic/indent": ["error", "tab"],
             "@stylistic/no-mixed-spaces-and-tabs": "off" // Scripts might use mixed, can relax if issues arise
        }
    },
    // Specific override for legacy script
    {
        files: ["scripts/generate.ts"],
        rules: {
             "@stylistic/indent": "off",
             "@stylistic/function-call-argument-newline": "off",
             "@stylistic/comma-dangle": "off",
             "@stylistic/array-element-newline": "off"
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
	])
);
