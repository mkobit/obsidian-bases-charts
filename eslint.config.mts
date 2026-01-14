import tseslint from 'typescript-eslint';
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import functional from "eslint-plugin-functional";
import promise from "eslint-plugin-promise";
import stylistic from "@stylistic/eslint-plugin";
import unicorn from "eslint-plugin-unicorn";
import { globalIgnores } from "eslint/config";
import json from "@eslint/json";

// Define custom rule for package.json dependency sorting
const packageJsonPlugin = {
	rules: {
		"sort-dependencies": {
			meta: {
				type: "suggestion",
				docs: {
					description: "Sort dependencies alphabetically",
				},
				fixable: "code",
			},
			create(context: any) {
				return {
					"Member"(node: any) {
						if (
							node.name &&
							node.name.type === "String" &&
							["dependencies", "devDependencies", "peerDependencies", "scripts"].includes(node.name.value)
						) {
							if (node.value && node.value.type === "Object") {
								const members = node.value.members;
								const memberNames = members.map((m: any) => m.name.value);
								const sortedMemberNames = [...memberNames].sort();

								const isSorted = memberNames.every((name: string, index: number) => name === sortedMemberNames[index]);

								if (!isSorted) {
									context.report({
										node: node.value,
										message: `Dependencies in '${node.name.value}' should be sorted alphabetically.`,
										fix(fixer: any) {
											// Extract member pairs (key: value)
											const memberPairs = members.map((m: any) => {
												return {
													name: m.name.value,
													// We reconstruct the JSON string for the member
													// Assuming simple key-value pairs for deps
													key: JSON.stringify(m.name.value),
													value: JSON.stringify(m.value.value)
												};
											});

											// Sort pairs
											memberPairs.sort((a: any, b: any) => a.name.localeCompare(b.name));

											// Reconstruct the object content with indentation
											// Assuming standard package.json indentation (tabs)
											// The object itself is indented by 1 tab, so members are 2 tabs.
											const indentation = "\t\t";
											const content = memberPairs.map((p: any) => `${indentation}${p.key}: ${p.value}`).join(",\n");

											// Wrap in braces with correct outer indentation
											const newText = `{\n${content}\n\t}`;

											return fixer.replaceText(node.value, newText);
										}
									});
								}
							}
						}
					}
				};
			}
		}
	}
};

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
	stylistic.configs.recommended,
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
			unicorn
		},
		rules: {
			...promise.configs.recommended.rules,

			// ObsidianMD Rules
			"obsidianmd/prefer-file-manager-trash-file": "error",

			// Additional clean code rules
			"no-console": "warn",
			"eqeqeq": "error",
			"curly": "error",

			"no-restricted-globals": ["error", {
				"name": "Date",
				"message": "Use Temporal (from temporal-polyfill) instead of Date. In Obsidian code, use moment."
			}],

			// Type Safety Rules
			"@typescript-eslint/consistent-type-assertions": ["error", {
				assertionStyle: "never"
			}],
			// Enforce separate type imports (User Request)
			"@typescript-eslint/consistent-type-imports": ["error", {
				"prefer": "type-imports",
				"fixStyle": "separate-type-imports"
			}],

			// Unicorn Rules
			"unicorn/numeric-separators-style": "error",

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
			"functional/prefer-immutable-types": ["error", {
				enforcement: "ReadonlyShallow",
				ignoreClasses: true,
				ignoreTypePattern: ["^.*Option$"]
			}],
			"functional/type-declaration-immutability": ["error", {
				rules: [
					{
						identifiers: "^I?Mutable.+",
						immutability: "Mutable",
						comparator: "AtLeast"
					},
					{
						identifiers: "^(?!I?Mutable).+",
						immutability: "ReadonlyDeep",
						comparator: "AtLeast"
					}
				],
				ignoreInterfaces: false
			}],

		}
	},
	// Configuration for package.json
	{
		files: ["package.json"],
		language: "json/json",
		plugins: {
			json,
			"package-json": packageJsonPlugin
		},
		rules: {
			"package-json/sort-dependencies": "error",
			// Enable recommended JSON rules
			"json/no-duplicate-keys": "error",
			"json/no-empty-keys": "error",
			// Restore override for depend/ban-dependencies
			"depend/ban-dependencies": "off",
			"@stylistic/indent": "off"
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
			"functional/prefer-immutable-types": "off",
			"functional/type-declaration-immutability": "off",
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
			"functional/prefer-immutable-types": "off",
			"functional/type-declaration-immutability": "off",
			"functional/immutable-data": ["error", {
				ignoreClasses: true,
				ignoreAccessorPattern: ["this.**"]
			}]
		}
	},
	// Legacy Transformers (Pending Refactor)
	{
		files: ["src/charts/transformers/**/*.ts", "src/@types/**/*.ts"],
		rules: {
			"functional/prefer-immutable-types": "off",
			"functional/type-declaration-immutability": "off",
			"functional/readonly-type": "off"
		}
	},
	// Refactored Transformers (Strict)
	{
		files: [
			"src/charts/transformer.ts",
			"src/charts/transformers/base.ts",
			"src/charts/transformers/cartesian.ts",
			"src/charts/transformers/pie.ts",
			"src/charts/transformers/scatter.ts",
			"src/charts/transformers/utils.ts"
		],
		rules: {
			"functional/prefer-immutable-types": ["error", {
				enforcement: "ReadonlyShallow",
				ignoreClasses: true,
				ignoreTypePattern: ["^.*Option$"]
			}],
			"functional/type-declaration-immutability": ["error", {
				rules: [
					{
						identifiers: "^I?Mutable.+",
						immutability: "Mutable",
						comparator: "AtLeast"
					},
					{
						identifiers: "^(?!I?Mutable).+",
						immutability: "ReadonlyShallow",
						comparator: "AtLeast"
					}
				],
				ignoreInterfaces: false
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
			"import/no-nodejs-modules": "off",
			"no-console": "off",
			"functional/no-return-void": "off",
			"functional/no-try-statements": "off",
			"functional/prefer-immutable-types": "off",
			"functional/type-declaration-immutability": "off",
			"functional/readonly-type": "off",
			// Allow require in scripts
			"@typescript-eslint/no-require-imports": "off",
			// Relax stylistic indent for scripts if mixed content, but generally enforce tab
			"@stylistic/indent": ["error", 2]
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
