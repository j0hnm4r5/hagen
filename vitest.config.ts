import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "happy-dom",
		include: ["src/test/**/*.test.ts"],
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
		browser: {
			enabled: true,
			instances: [
				{
					browser: "chromium",
				},
			],
			provider: playwright({
				launchOptions: {
					headless: true,
					args: ["--headless=new", "--disable-gpu", "--no-sandbox"],
				},
			}),
			ui: false,
		},
	},
});
