/**
 * Integration tests for combined features.
 * Tests multiple features working together.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hasAnsiCodes, stripAnsi } from "./helpers/ansi.js";

describe("Integration Tests", () => {
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		vi.stubEnv("CI", "");
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	it("should handle colors + timestamps + prefix/suffix together", async () => {
		const { createHagen } = await import("../index.js");
		const logger = createHagen({
			enableColor: true,
			showTimestamp: true,

			labelPrefix: ">>",
			labelSuffix: "<<",
		});

		logger.log("TEST", "message");

		const label = consoleLogSpy.mock.calls[0]?.[0] as string;
		const message = consoleLogSpy.mock.calls[0]?.[1] as string;

		// Should have ANSI codes
		expect(hasAnsiCodes(label)).toBe(true);

		// Strip and check all parts
		const stripped = stripAnsi(label);

		// Should have prefix
		expect(stripped).toContain(">>");

		// Should have label
		expect(stripped).toContain("TEST");

		// Should have suffix
		expect(stripped).toContain("<<");

		// Should have timestamp (looking for date or time parts)
		// ISO format: 2024-03-15T10:30:00.000Z
		expect(stripped).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

		// Message should be separate
		expect(message).toBe("message");
	});

	it("should work with colorless mode + timestamps + prefix/suffix", async () => {
		const { createHagen } = await import("../index.js");
		const logger = createHagen({
			enableColor: false,
			showTimestamp: true,

			labelPrefix: ">>",
			labelSuffix: "<<",
		});

		logger.log("TEST", "message");

		const label = consoleLogSpy.mock.calls[0]?.[0] as string;

		// Should NOT have ANSI codes
		expect(hasAnsiCodes(label)).toBe(false);

		// Should have all parts
		expect(label).toContain(">>");
		expect(label).toContain("TEST");
		expect(label).toContain("<<");
		expect(label).toMatch(/\d{1,2}:\d{2}:\d{2}/);
	});

	it("should maintain consistency across multiple loggers", async () => {
		const { createHagen } = await import("../index.js");

		const logger1 = createHagen({ enableColor: true, labelPrefix: "A:" });
		const logger2 = createHagen({ enableColor: false, labelPrefix: "B:" });

		logger1.log("TEST1", "msg1");
		logger2.log("TEST2", "msg2");

		const label1 = consoleLogSpy.mock.calls[0]?.[0] as string;
		const label2 = consoleLogSpy.mock.calls[1]?.[0] as string;

		// Logger 1 should have colors
		expect(hasAnsiCodes(label1)).toBe(true);
		expect(stripAnsi(label1)).toContain("A:");

		// Logger 2 should NOT have colors
		expect(hasAnsiCodes(label2)).toBe(false);
		expect(label2).toContain("B:");

		// Both should have their respective labels
		expect(stripAnsi(label1)).toContain("TEST1");
		expect(label2).toContain("TEST2");
	});

	it("should handle custom colors with timestamps and prefix/suffix", async () => {
		const { createHagen } = await import("../index.js");
		const logger = createHagen({
			enableColor: true,
			showTimestamp: true,

			labelPrefix: ">>",
			labelSuffix: "<<",
		});

		logger.log(
			{
				kind: "color",
				label: "CUSTOM",
				bgColor: "#FF5733",
				fgColor: "#FFFFFF",
			},
			"test"
		);

		const label = consoleLogSpy.mock.calls[0]?.[0] as string;

		// Should have ANSI codes
		expect(hasAnsiCodes(label)).toBe(true);

		// Should have RGB color codes
		expect(label).toMatch(/\u001B\[48;2;\d+;\d+;\d+m/);
		expect(label).toMatch(/\u001B\[38;2;\d+;\d+;\d+m/);

		// Should have all parts
		const stripped = stripAnsi(label);
		expect(stripped).toContain(">>");
		expect(stripped).toContain("CUSTOM");
		expect(stripped).toContain("<<");
		expect(stripped).toMatch(/\d{1,2}:\d{2}:\d{2}/);
	});

	it("should handle fixed width + colors + timestamps", async () => {
		const { createHagen } = await import("../index.js");
		const logger = createHagen({
			enableColor: true,
			showTimestamp: true,

			fixedWidth: {
				width: 10,
				truncationMethod: "end",
			},
		});

		logger.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "message");

		const label = consoleLogSpy.mock.calls[0]?.[0] as string;

		// Should have ANSI codes
		expect(hasAnsiCodes(label)).toBe(true);

		// Should have timestamp
		const stripped = stripAnsi(label);
		expect(stripped).toMatch(/\d{1,2}:\d{2}:\d{2}/);

		// Label should be truncated (contains ellipsis)
		expect(stripped).toContain("…");
	});

	it("should handle all log levels with same config", async () => {
		const { createHagen } = await import("../index.js");
		const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const logger = createHagen({
			enableColor: true,
			showTimestamp: true,
		});

		logger.log("LOG", "msg");
		logger.info("INFO", "msg");

		logger.warn("WARN", "msg");
		logger.error("ERROR", "msg");

		// All should have ANSI codes
		expect(hasAnsiCodes(consoleLogSpy.mock.calls[0]?.[0] as string)).toBe(true);
		expect(hasAnsiCodes(consoleLogSpy.mock.calls[1]?.[0] as string)).toBe(true);
		expect(hasAnsiCodes(consoleWarnSpy.mock.calls[0]?.[0] as string)).toBe(true);
		expect(hasAnsiCodes(consoleErrorSpy.mock.calls[0]?.[0] as string)).toBe(true);

		// All should have timestamps
		const stripped1 = stripAnsi(consoleLogSpy.mock.calls[0]?.[0] as string);
		const stripped2 = stripAnsi(consoleLogSpy.mock.calls[1]?.[0] as string);
		const stripped4 = stripAnsi(consoleWarnSpy.mock.calls[0]?.[0] as string);
		const stripped5 = stripAnsi(consoleErrorSpy.mock.calls[0]?.[0] as string);

		expect(stripped1).toMatch(/\d{1,2}:\d{2}:\d{2}/);
		expect(stripped2).toMatch(/\d{1,2}:\d{2}:\d{2}/);
		expect(stripped4).toMatch(/\d{1,2}:\d{2}:\d{2}/);
		expect(stripped5).toMatch(/\d{1,2}:\d{2}:\d{2}/);

		consoleWarnSpy.mockRestore();
		consoleErrorSpy.mockRestore();
	});

	it("should handle complex nested data with all features", async () => {
		const { createHagen } = await import("../index.js");
		const logger = createHagen({
			enableColor: true,
			showTimestamp: true,
			labelPrefix: ">>",
			labelSuffix: "<<",
		});

		const complexData = {
			nested: {
				array: [1, 2, 3],
				object: { key: "value" },
			},
			string: "test",
			number: 42,
		};

		logger.log("DATA", complexData, "extra", "args");

		const calls = consoleLogSpy.mock.calls[0] || [];
		const label = calls[0] as string;
		const data = calls[1];
		const extra1 = calls[2];
		const extra2 = calls[3];

		// Label should have all features
		expect(hasAnsiCodes(label)).toBe(true);
		const stripped = stripAnsi(label);
		expect(stripped).toContain(">>");
		expect(stripped).toContain("DATA");
		expect(stripped).toContain("<<");
		expect(stripped).toMatch(/\d+:\d+:\d+/);

		// Data should be preserved
		expect(data).toEqual(complexData);
		expect(extra1).toBe("extra");
		expect(extra2).toBe("args");
	});
});
