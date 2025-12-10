import eslint from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		plugins: {
			prettier,
			unicorn,
		},
		rules: {
			// Prettier integration
			"prettier/prettier": "error",

			// Unicorn rules
			"unicorn/prevent-abbreviations": "off",
			"unicorn/no-null": "off",
			"unicorn/prefer-module": "error",
			"unicorn/prefer-node-protocol": "error",
			"unicorn/no-array-for-each": "error",
			"unicorn/prefer-top-level-await": "off",
			"unicorn/no-process-exit": "off",

			// TypeScript specific
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/restrict-template-expressions": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/prefer-nullish-coalescing": "off",
			"@typescript-eslint/no-misused-spread": "off",
		},
	},
	{
		// Relaxed rules for test files
		files: ["src/test/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
		rules: {
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/no-empty-function": "off",
			"@typescript-eslint/unbound-method": "off",
			"@typescript-eslint/no-unsafe-return": "off",
			"@typescript-eslint/no-unsafe-argument": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"no-control-regex": "off", // ANSI codes contain control characters
		},
	},
	{
		ignores: [
			"dist/",
			"docs/",
			"docs-generated/",
			"scripts/",
			"tools/",
			"node_modules/",
			"coverage/",
			"src/test/coverage/",
			"playwright-report/",
			"test-results/",
			"*.config.js",
			"*.config.ts",
		],
	}
);
