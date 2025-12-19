import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		include: ["src/test/**/*.test.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			include: ["src/**/*.ts"],
			exclude: ["node_modules/**", "dist/**", "src/test/**", "**/*.config.{js,ts}", "**/*.d.ts"],
			thresholds: {
				lines: 50,
				functions: 50,
				branches: 50,
				statements: 50,
			},
		},
		server: {
			deps: {
				inline: ["ansis"],
			},
		},
	},
});
