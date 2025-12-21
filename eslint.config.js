// @ts-check

import eslint from "@eslint/js";
import markdown from "@eslint/markdown";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
	// GLOBAL IGNORES
	globalIgnores(["node_modules/", "**/dist/", "**/coverage/", "**/*.scratch.md", "**/cache/"]),

	// BASE CONFIGS
	eslint.configs.recommended,
	tseslint.configs.recommendedTypeChecked,
	eslintPluginUnicorn.configs.recommended,

	// MARKDOWN CONFIGS
	markdown.configs.recommended,

	// GLOBAL SETTINGS & TYPE AWARENESS
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: ["*.js", "*.ts", "*.vue"],
				},
				extraFileExtensions: [".vue"],
			},
		},
	},

	// MARKDOWN OVERRIDES
	{
		files: ["**/*.md"],
		language: "markdown/gfm",

		// these need to be disabled for markdown files, since markdown can't handle rules that expect js/ts
		extends: [tseslint.configs.disableTypeChecked],
		rules: {
			"no-irregular-whitespace": "off",
			"unicorn/expiring-todo-comments": "off",
		},
	},

	// GLOBAL RULES
	{
		rules: {
			"unicorn/prevent-abbreviations": [
				"error",
				{
					replacements: {
						dir: false,
						dist: false,
					},
				},
			],
		},
	},
]);
