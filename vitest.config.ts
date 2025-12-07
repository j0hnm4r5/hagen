import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "happy-dom",
		include: ["src/test/**/*.test.ts"],
		exclude: ["src/test/browser/**", "node_modules/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			include: ["src/index.ts"],
			exclude: ["node_modules/**", "dist/**", "src/test/**", "**/*.config.{js,ts}", "**/*.d.ts"],
			thresholds: {
				lines: 50,
				functions: 50,
				branches: 50,
				statements: 50,
			},
		},
	},
});
