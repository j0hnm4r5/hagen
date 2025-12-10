/**
 * Tests for output format in different modes:
 * - Normal mode (colors enabled, not CI): colored label with spaces, no brackets
 * - CI mode (colors enabled, isCI=true): brackets around colored label
 * - Colorless mode (colors disabled): plain brackets with no ANSI codes
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hasAnsiCodes, stripAnsi } from "./helpers/ansi.js";

describe("Output Format", () => {
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
		consoleWarnSpy.mockRestore();
		consoleErrorSpy.mockRestore();
		vi.unstubAllEnvs();
		vi.resetModules(); // Important: reset module cache
	});

	describe("Normal Mode (Colors ON, Not CI)", () => {
		it("should format with spaces but NO brackets around label", async () => {
			// Ensure we're not in CI mode
			vi.stubEnv("CI", "");
			vi.stubEnv("CONTINUOUS_INTEGRATION", "");

			// Import AFTER setting env vars
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.log("TEST", "message");

			// console.log takes multiple arguments: label, ...data
			const calls = consoleLogSpy.mock.calls[0] || [];
			const label = calls[0] as string;
			const message = calls[1] as string;

			// Label should have ANSI codes
			expect(hasAnsiCodes(label)).toBe(true);

			// Label should NOT start with a bracket
			expect(label.charAt(0)).not.toBe("[");

			// Strip ANSI to check label structure
			const stripped = stripAnsi(label);

			// Should have spaces before and after label text
			expect(stripped).toMatch(/^ .+ $/);
			expect(stripped).toContain("TEST");

			// Message should be separate argument
			expect(message).toBe("message");
		});

		it("should have colored label with bold formatting", async () => {
			vi.stubEnv("CI", "");
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.log("X", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;

			// Should have bold code
			expect(label).toContain("\u001B[1m");

			// Should have color codes (foreground or background)
			expect(label).toMatch(/\u001B\[(?:[34]\d|9\d|10\d)m/);

			// Should have reset codes
			expect(label).toMatch(/\u001B\[(?:22|39|49)m/);
		});

		it("should format correctly for different label lengths", async () => {
			vi.stubEnv("CI", "");
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			// Short label
			logger.log("X", "msg1");
			const short = stripAnsi(consoleLogSpy.mock.calls[0]?.[0] as string);
			expect(short).toBe(" X ");

			// Medium label
			consoleLogSpy.mockClear();
			logger.log("MEDIUM", "msg2");
			const medium = stripAnsi(consoleLogSpy.mock.calls[0]?.[0] as string);
			expect(medium).toBe(" MEDIUM ");

			// Long label
			consoleLogSpy.mockClear();
			logger.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "msg3");
			const long = stripAnsi(consoleLogSpy.mock.calls[0]?.[0] as string);
			expect(long).toBe(" ABCDEFGHIJKLMNOPQRSTUVWXYZ ");
		});
	});

	describe("Colorless Mode (Colors OFF)", () => {
		it("should format with plain brackets when colors disabled", async () => {
			vi.stubEnv("CI", "");
			vi.resetModules();
			const { createHagen } = await import("../index.js");

			const logger = createHagen({ enableColor: false });
			logger.log("TEST", "message");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const message = consoleLogSpy.mock.calls[0]?.[1] as string;

			// Label should NOT have ANSI codes
			expect(hasAnsiCodes(label)).toBe(false);

			// Label should be: [ TEST ]
			expect(label).toBe("[ TEST ]");

			// Message should be separate
			expect(message).toBe("message");
		});

		it("should format with proper spacing in colorless mode", async () => {
			vi.stubEnv("CI", "");
			vi.resetModules();
			const { createHagen } = await import("../index.js");

			const logger = createHagen({ enableColor: false });

			// Test various labels
			logger.log("X", "msg");
			expect(consoleLogSpy.mock.calls[0]?.[0]).toBe("[ X ]");
			expect(consoleLogSpy.mock.calls[0]?.[1]).toBe("msg");

			consoleLogSpy.mockClear();
			logger.log("TEST", "message");
			expect(consoleLogSpy.mock.calls[0]?.[0]).toBe("[ TEST ]");
			expect(consoleLogSpy.mock.calls[0]?.[1]).toBe("message");
		});

		it("should work for all log levels in colorless mode", async () => {
			vi.stubEnv("CI", "");
			vi.resetModules();
			const { createHagen } = await import("../index.js");

			const logger = createHagen({ enableColor: false });

			logger.log("LOG", "msg");
			expect(hasAnsiCodes(consoleLogSpy.mock.calls[0]?.[0] as string)).toBe(false);

			logger.warn("WARN", "msg");
			expect(hasAnsiCodes(consoleWarnSpy.mock.calls[0]?.[0] as string)).toBe(false);

			logger.error("ERROR", "msg");
			expect(hasAnsiCodes(consoleErrorSpy.mock.calls[0]?.[0] as string)).toBe(false);
		});
	});

	describe("Format Consistency", () => {
		it("should maintain format with timestamps in normal mode", async () => {
			vi.stubEnv("CI", "");
			vi.resetModules();
			const { createHagen } = await import("../index.js");

			const logger = createHagen({
				enableColor: true,
				showTimestamp: true,
				dateFormat: "time", // Use time format for consistent HH:MM:SS
				timeFormat: "24h",
			});

			logger.log("TEST", "message");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const message = consoleLogSpy.mock.calls[0]?.[1] as string;

			// Label should still have ANSI codes
			expect(hasAnsiCodes(label)).toBe(true);

			// Label should have timestamp (in brackets with colons for time)
			expect(label).toMatch(/\[\s*\d{1,2}:\d{2}:\d{2}\s*\]/);

			// Strip and check structure
			const stripped = stripAnsi(label);
			expect(stripped).toContain("TEST");
			expect(stripped).toMatch(/\d{1,2}:\d{2}:\d{2}/);

			// Message should be separate
			expect(message).toBe("message");
		});

		it("should maintain format with timestamps in colorless mode", async () => {
			vi.stubEnv("CI", "");
			vi.resetModules();
			const { createHagen } = await import("../index.js");

			const logger = createHagen({
				enableColor: false,
				showTimestamp: true,
				dateFormat: "time",
				timeFormat: "24h",
			});

			logger.log("TEST", "message");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const message = consoleLogSpy.mock.calls[0]?.[1] as string;

			// Label should NOT have ANSI codes
			expect(hasAnsiCodes(label)).toBe(false);

			// Label should have label brackets
			expect(label).toContain("[ TEST ]");

			// Label should have timestamp brackets
			expect(label).toMatch(/\[\s*\d{1,2}:\d{2}:\d{2}\s*\]/);

			// Message should be separate
			expect(message).toBe("message");
		});
	});
});
