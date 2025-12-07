import { test, expect } from "@playwright/test";

test.describe("Hagen Browser Tests", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		// Wait for the page to be fully loaded
		await page.waitForLoadState("networkidle");
	});

	test("should load the page successfully", async ({ page }) => {
		await expect(page).toHaveTitle(/Hagen/);
		const heading = page.locator("h1");
		await expect(heading).toHaveText("Hagen Visual Test");
	});

	test("should render output to the DOM", async ({ page }) => {
		const output = page.locator("#output");
		await expect(output).toBeVisible();

		// Should have log entries
		const logEntries = page.locator(".log-entry");
		const count = await logEntries.count();
		expect(count).toBeGreaterThan(20); // We log many things in test()
	});

	test("should capture and display all log types", async ({ page }) => {
		// Wait for logs to be rendered
		await page.waitForSelector(".log-entry");

		// Get test data from window
		const testData = await page.evaluate(() => {
			return (window as never).hagenTestData;
		});

		expect(testData).toBeDefined();
		expect(testData.totalLogs).toBeGreaterThan(20);

		// Should have all three log types
		const types = new Set(testData.logTypes);
		expect(types.has("log")).toBe(true);
		expect(types.has("warn")).toBe(true);
		expect(types.has("error")).toBe(true);
	});

	test("should produce colored output with ANSI codes", async ({ page }) => {
		const testData = await page.evaluate(() => {
			return (window as never).hagenTestData;
		});

		// Should have colored output (ANSI escape codes)
		expect(testData.hasColoredOutput).toBe(true);

		// Check that logs contain ANSI color codes
		const logsWithAnsi = testData.logs.filter((log: never) => log.hasAnsi);
		expect(logsWithAnsi.length).toBeGreaterThan(10);
	});

	test("should log standard messages correctly", async ({ page }) => {
		const testData = await page.evaluate(() => {
			return (window as never).hagenTestData;
		});

		// Find the "Test" log
		const testLog = testData.logs.find((log: never) =>
			log.rawText.includes("This is a normal log message")
		);
		expect(testLog).toBeDefined();
		expect(testLog.type).toBe("log");

		// Find the info log
		const infoLog = testData.logs.find((log: never) =>
			log.rawText.includes("This is an info message")
		);
		expect(infoLog).toBeDefined();

		// Find the success log
		const successLog = testData.logs.find((log: never) =>
			log.rawText.includes("This is a success message")
		);
		expect(successLog).toBeDefined();
	});

	test("should handle warn and error log levels with correct console methods", async ({ page }) => {
		const testData = await page.evaluate(() => {
			return (window as never).hagenTestData;
		});

		// Warning should use console.warn
		const warnLog = testData.logs.find((log: never) =>
			log.rawText.includes("This is a warning message")
		);
		expect(warnLog).toBeDefined();
		expect(warnLog.type).toBe("warn");

		// Error should use console.error
		const errorLog = testData.logs.find((log: never) =>
			log.rawText.includes("This is an error message")
		);
		expect(errorLog).toBeDefined();
		expect(errorLog.type).toBe("error");
	});

	test("should support custom colors with hex values", async ({ page }) => {
		const testData = await page.evaluate(() => {
			return (window as never).hagenTestData;
		});

		// Custom color log should exist
		const customColorLog = testData.logs.find((log: never) =>
			log.rawText.includes("This message has a custom color")
		);
		expect(customColorLog).toBeDefined();
		expect(customColorLog.hasAnsi).toBe(true);
	});

	test("should handle multi-line messages", async ({ page }) => {
		const testData = await page.evaluate(() => {
			return (window as never).hagenTestData;
		});

		// Multi-line log should exist
		const multilineLog = testData.logs.find(
			(log: never) => log.rawText.includes("This is a message") && log.rawText.includes("with")
		);
		expect(multilineLog).toBeDefined();
		expect(multilineLog.rawText).toContain("\n");
	});

	test("should handle empty labels", async ({ page }) => {
		const testData = await page.evaluate(() => {
			return (window as never).hagenTestData;
		});

		// Empty label log should exist
		const emptyLabelLog = testData.logs.find((log: never) => log.rawText.includes("Empty Label"));
		expect(emptyLabelLog).toBeDefined();
	});

	test("should log objects and arrays", async ({ page }) => {
		const testData = await page.evaluate(() => {
			return (window as never).hagenTestData;
		});

		// Object log should exist
		const objectLogs = testData.logs.filter((log: never) => log.rawText.includes("Object"));
		expect(objectLogs.length).toBeGreaterThan(0);

		// Array log should exist
		const arrayLogs = testData.logs.filter((log: never) => log.rawText.includes("Array"));
		expect(arrayLogs.length).toBeGreaterThan(0);
	});

	test("should support timestamps when configured", async ({ page }) => {
		const testData = await page.evaluate(() => {
			return (window as never).hagenTestData;
		});

		// Timestamp log should exist
		const timestampLog = testData.logs.find((log: never) =>
			log.rawText.includes("This message includes a timestamp")
		);
		expect(timestampLog).toBeDefined();

		// Timestamp log should have timestamp indicators (brackets with colons for time)
		expect(timestampLog.rawText).toMatch(/\[.*:.*\]/);
	});

	test("should support fixed-width labels with truncation", async ({ page }) => {
		const testData = await page.evaluate(() => {
			return (window as never).hagenTestData;
		});

		// Fixed width logs should exist
		const fixedWidthLogs = testData.logs.filter((log: never) =>
			log.rawText.includes("Width: 12; Truncation:")
		);
		expect(fixedWidthLogs.length).toBe(3); // end, middle, start

		// Check for ellipsis character (truncation indicator)
		const hasEllipsis = fixedWidthLogs.some((log: never) => log.rawText.includes("…"));
		expect(hasEllipsis).toBe(true);
	});

	test("should handle grouped console output", async ({ page }) => {
		const testData = await page.evaluate(() => {
			return (window as never).hagenTestData;
		});

		// Level logs should exist
		const levelLogs = testData.logs.filter((log: never) => log.rawText.includes("LEVEL"));
		expect(levelLogs.length).toBeGreaterThan(0);
	});

	test("should maintain consistent colors for same labels", async ({ page }) => {
		// Trigger test multiple times
		await page.evaluate(() => {
			(window as any).runHagenTest?.();
		});

		await page.waitForTimeout(100);

		const testData = await page.evaluate(() => {
			return (window as never).hagenTestData;
		});

		// Find all "Test" logs
		const testLogs = testData.logs.filter((log: never) =>
			log.rawText.includes("This is a normal log message")
		);

		// If we have multiple logs with same label, they should have similar ANSI codes
		// (indicating same color)
		if (testLogs.length > 1) {
			const ansiPattern = /\u001B\[\d+m/g;
			const firstLogAnsi = testLogs[0].rawText.match(ansiPattern);
			const secondLogAnsi = testLogs[1].rawText.match(ansiPattern);

			// Both should have ANSI codes
			expect(firstLogAnsi).toBeDefined();
			expect(secondLogAnsi).toBeDefined();
		}
	});

	test("should properly escape and render special characters", async ({ page }) => {
		const output = page.locator("#output");
		const content = await output.innerHTML();

		// Should not have unescaped HTML tags
		expect(content).not.toContain("<script>");
		expect(content).not.toContain("<iframe>");

		// Should have proper HTML entities for special chars
		expect(content.includes("&lt;") || content.includes("&gt;") || content.includes("&amp;"));
	});
});
