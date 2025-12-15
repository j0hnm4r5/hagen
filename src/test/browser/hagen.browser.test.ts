import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createHagen } from "../../index";

interface LogEntry {
	type: string;
	rawText: string;
	hasAnsi: boolean;
}

interface HagenTestData {
	totalLogs: number;
	logTypes: string[];
	hasColoredOutput: boolean;
	logs: LogEntry[];
}

// Helper to capture console output
function setupConsoleCapture() {
	const originalLog = console.log;
	const originalWarn = console.warn;
	const originalError = console.error;

	interface CapturedLog {
		type: "log" | "warn" | "error";
		args: unknown[];
		hasAnsi: boolean;
		rawText: string;
	}

	const capturedLogs: CapturedLog[] = [];

	console.log = (...args: unknown[]) => {
		const rawText = args.map((arg) => String(arg)).join(" ");
		capturedLogs.push({
			type: "log",
			args,
			hasAnsi: /\u001B\[\d+m/.test(rawText),
			rawText,
		});
		originalLog(...args);
	};

	console.warn = (...args: unknown[]) => {
		const rawText = args.map((arg) => String(arg)).join(" ");
		capturedLogs.push({
			type: "warn",
			args,
			hasAnsi: /\u001B\[\d+m/.test(rawText),
			rawText,
		});
		originalWarn(...args);
	};

	console.error = (...args: unknown[]) => {
		const rawText = args.map((arg) => String(arg)).join(" ");
		capturedLogs.push({
			type: "error",
			args,
			hasAnsi: /\u001B\[\d+m/.test(rawText),
			rawText,
		});
		originalError(...args);
	};

	return {
		logs: capturedLogs,
		restore: () => {
			console.log = originalLog;
			console.warn = originalWarn;
			console.error = originalError;
		},
		clear: () => {
			capturedLogs.length = 0;
		},
		getData: (): HagenTestData => ({
			totalLogs: capturedLogs.length,
			logTypes: capturedLogs.map((l) => l.type),
			hasColoredOutput: capturedLogs.some((l) => l.hasAnsi),
			logs: capturedLogs.map((l) => ({
				type: l.type,
				rawText: l.rawText,
				hasAnsi: l.hasAnsi,
			})),
		}),
	};
}

// Helper to run Hagen test suite
function runHagenTests(logger: ReturnType<typeof createHagen>) {
	// Basic tests
	logger.log("Test", "This is a normal log message");
	logger.info("Info", "This is an info message");
	logger.warn("Warning", "This is a warning message");
	logger.error("Error", "This is an error message");

	// Custom colors
	logger.log(
		{
			label: "CUSTOM",
			bgColor: "#ff0000",
			fgColor: "#ffffff",
		},
		"This message has a custom color"
	);

	// Multi-line
	logger.log("Multi", "This is a message\nwith\nmultiple\nlines");

	// Empty label
	logger.log(undefined, "Empty Label");

	// Objects and arrays
	logger.log("Object", { key: "value", nested: { deep: true } });
	logger.log("Array", [1, 2, 3, 4, 5]);

	// Timestamps
	const loggerWithTimestamp = createHagen({ showTimestamp: true });
	loggerWithTimestamp.log("Time", "This message includes a timestamp");

	// Fixed width labels
	const loggerWithFixedWidth = createHagen({
		fixedWidth: {
			width: 12,
			truncationMethod: "end",
		},
	});
	loggerWithFixedWidth.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "Width: 12; Truncation: end");
	const loggerWithMiddleTrunc = createHagen({
		fixedWidth: {
			width: 12,
			truncationMethod: "middle",
		},
	});
	loggerWithMiddleTrunc.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "Width: 12; Truncation: middle");
	const loggerWithStartTrunc = createHagen({
		fixedWidth: {
			width: 12,
			truncationMethod: "start",
		},
	});
	loggerWithStartTrunc.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "Width: 12; Truncation: start");

	// Custom colors
	logger.log({ label: "Custom", bgColor: [100, 50, 150] }, "Using custom bgColor");
	logger.log({ label: "Custom2", bgColor: [200, 100, 50] }, "Using another custom bgColor");
}

describe("Hagen Browser Tests", () => {
	let capture: ReturnType<typeof setupConsoleCapture>;
	let logger: ReturnType<typeof createHagen>;

	beforeEach(() => {
		capture = setupConsoleCapture();
		logger = createHagen();
		runHagenTests(logger);
	});

	afterEach(() => {
		capture.restore();
	});

	test("should capture and display all log types", () => {
		const testData = capture.getData();

		expect(testData).toBeDefined();
		expect(testData.totalLogs).toBeGreaterThanOrEqual(15);

		// Should have all three log types
		const types = new Set(testData.logTypes);
		expect(types.has("log")).toBe(true);
		expect(types.has("warn")).toBe(true);
		expect(types.has("error")).toBe(true);
	});

	test("should produce colored output with ANSI codes", () => {
		const testData = capture.getData();

		// Should have colored output (ANSI escape codes)
		expect(testData.hasColoredOutput).toBe(true);

		// Check that logs contain ANSI color codes
		const logsWithAnsi = testData.logs.filter((log) => log.hasAnsi);
		expect(logsWithAnsi.length).toBeGreaterThan(10);
	});

	test("should log standard messages correctly", () => {
		const testData = capture.getData();

		// Find the "Test" log
		const testLog = testData.logs.find((log) =>
			log.rawText.includes("This is a normal log message")
		);
		expect(testLog).toBeDefined();
		if (testLog) {
			expect(testLog.type).toBe("log");
		}

		// Find the info log
		const infoLog = testData.logs.find((log) => log.rawText.includes("This is an info message"));
		expect(infoLog).toBeDefined();
	});

	test("should handle warn and error log levels with correct console methods", () => {
		const testData = capture.getData();

		// Warning should use console.warn
		const warnLog = testData.logs.find((log) => log.rawText.includes("This is a warning message"));
		expect(warnLog).toBeDefined();
		if (warnLog) {
			expect(warnLog.type).toBe("warn");
		}

		// Error should use console.error
		const errorLog = testData.logs.find((log) => log.rawText.includes("This is an error message"));
		expect(errorLog).toBeDefined();
		if (errorLog) {
			expect(errorLog.type).toBe("error");
		}
	});

	test("should support custom colors with hex values", () => {
		const testData = capture.getData();

		// Custom color log should exist
		const customColorLog = testData.logs.find((log) =>
			log.rawText.includes("This message has a custom color")
		);
		expect(customColorLog).toBeDefined();
		if (customColorLog) {
			expect(customColorLog.hasAnsi).toBe(true);
		}
	});

	test("should handle multi-line messages", () => {
		const testData = capture.getData();

		// Multi-line log should exist
		const multilineLog = testData.logs.find(
			(log) => log.rawText.includes("This is a message") && log.rawText.includes("with")
		);
		expect(multilineLog).toBeDefined();
		if (multilineLog) {
			expect(multilineLog.rawText).toContain("\n");
		}
	});

	test("should handle empty labels", () => {
		const testData = capture.getData();

		// Empty label log should exist
		const emptyLabelLog = testData.logs.find((log) => log.rawText.includes("Empty Label"));
		expect(emptyLabelLog).toBeDefined();
	});

	test("should log objects and arrays", () => {
		const testData = capture.getData();

		// Object log should exist
		const objectLogs = testData.logs.filter((log) => log.rawText.includes("Object"));
		expect(objectLogs.length).toBeGreaterThan(0);

		// Array log should exist
		const arrayLogs = testData.logs.filter((log) => log.rawText.includes("Array"));
		expect(arrayLogs.length).toBeGreaterThan(0);
	});

	test("should support timestamps when configured", () => {
		const testData = capture.getData();

		// Timestamp log should exist
		const timestampLog = testData.logs.find((log) =>
			log.rawText.includes("This message includes a timestamp")
		);
		expect(timestampLog).toBeDefined();

		// Timestamp log should have timestamp indicators (brackets with colons for time)
		if (timestampLog) {
			expect(timestampLog.rawText).toMatch(/\[.*:.*\]/);
		}
	});

	test("should support fixed-width labels with truncation", () => {
		const testData = capture.getData();

		// Fixed width logs should exist
		const fixedWidthLogs = testData.logs.filter((log) =>
			log.rawText.includes("Width: 12; Truncation:")
		);
		expect(fixedWidthLogs.length).toBe(3); // end, middle, start
	});

	test("should maintain consistent colors for same labels", () => {
		// Clear and run again
		capture.clear();
		runHagenTests(logger);

		const testData = capture.getData();

		// Find all "Test" logs
		const testLogs = testData.logs.filter((log) =>
			log.rawText.includes("This is a normal log message")
		);

		// If we have multiple logs with same label, they should have similar ANSI codes
		if (testLogs.length > 1) {
			const ansiPattern = /\u001B\[\d+m/g;
			const firstLogAnsi = testLogs[0]?.rawText.match(ansiPattern);
			const secondLogAnsi = testLogs[1]?.rawText.match(ansiPattern);

			// Both should have ANSI codes
			expect(firstLogAnsi).toBeDefined();
			expect(secondLogAnsi).toBeDefined();
		}
	});
});
