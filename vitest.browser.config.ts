import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
	test: {
		globals: true,
		include: ["src/test/browser/**/*.test.ts"],
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
				},
			}),
		},
	},
});
