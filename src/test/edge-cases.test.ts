/**
 * Edge case tests for uncovered code paths.
 * Tests specific scenarios to improve code coverage.
 */

import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { hasAnsiCodes, stripAnsi } from "./helpers/ansi.js";

describe("Edge Cases", () => {
	let consoleLogSpy: MockInstance;
	let consoleInfoSpy: MockInstance;
	let consoleWarnSpy: MockInstance;
	let consoleErrorSpy: MockInstance;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
		vi.stubEnv("CI", "");
		vi.stubEnv("FORCE_COLOR", "3");
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
		consoleInfoSpy.mockRestore();
		consoleWarnSpy.mockRestore();
		consoleErrorSpy.mockRestore();
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	describe("fixedWidthFormat edge cases", () => {
		it("should handle label exactly matching fixed width", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				colorOptions: { enabled: true },
				labelOptions: {
					fixedWidth: 10,
					truncationMethod: "end",
				},
			});

			// Label exactly 10 chars
			logger.log("EXACTWIDTH", "message");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label).trim();

			// Should be exactly 10 chars (no ellipsis, no padding)
			expect(stripped.replaceAll(/\s+/g, "")).toBe("EXACTWIDTH");
		});

		it("should handle start truncation method", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				colorOptions: { enabled: true },
				labelOptions: {
					fixedWidth: 10,
					truncationMethod: "start",
				},
			});

			logger.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "message");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label).trim();

			// Should have ellipsis at start
			expect(stripped).toContain("~");
			expect(stripped).toMatch(/^~.+/); //Starts with ellipsis
		});

		it("should handle middle truncation method", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				colorOptions: { enabled: true },
				labelOptions: {
					fixedWidth: 10,
					truncationMethod: "middle",
				},
			});

			logger.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "message");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label).trim();

			// Should have ellipsis in middle
			expect(stripped).toContain("~");
			expect(stripped).not.toMatch(/^\.\.\./); // Not at start
			expect(stripped).not.toMatch(/\.\.\.$/); // Not at end
		});

		it("should handle short label with padding", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				colorOptions: { enabled: true },
				labelOptions: {
					fixedWidth: 20,
					truncationMethod: "end",
				},
			});

			logger.log("SHORT", "message");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			// Should have spaces around it (padding to width)
			expect(stripped).toContain("SHORT");
			expect(stripped.length).toBeGreaterThan("SHORT".length);
		});
	});

	describe("Specialized log method behavior", () => {
		it("should handle info with custom prefix and suffix", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.info(
				{
					kind: "color",
					label: "CUSTOM",
					prefix: ">>",
					suffix: "<<",
				},
				"message"
			);

			const label = consoleInfoSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			// Should use custom prefix instead of default "i"
			expect(stripped).toContain(">>");
			expect(stripped).toContain("<<");
			expect(stripped).toContain("CUSTOM");
		});

		it("should handle warn with custom colors (bgColor/fgColor)", async () => {
			const { createHagen } = await import("../index.js");

			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.warn(
				{
					kind: "color",
					label: "CUSTOM",
					bgColor: "#FF5733",
					fgColor: "#FFFFFF",
					prefix: ">>",
					suffix: "<<",
				},
				"message"
			);

			const label = consoleWarnSpy.mock.calls[0]?.[0] as string;

			const esc = String.fromCharCode(27);
			// Should have RGB ANSI codes
			expect(label).toMatch(new RegExp(`${esc}\[48;2;\\d+;\\d+;\\d+m`));
			expect(label).toMatch(new RegExp(`${esc}\[38;2;\\d+;\\d+;\\d+m`));

			const stripped = stripAnsi(label);
			expect(stripped).toContain(">>");
			expect(stripped).toContain("<<");
			expect(stripped).toContain("CUSTOM");
		});

		it("should handle error with custom colors (bgColor/fgColor)", async () => {
			const { createHagen } = await import("../index.js");

			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.error(
				{
					kind: "color",
					label: "CUSTOM",
					bgColor: "#FF5733",
					fgColor: "#FFFFFF",
					prefix: ">>",
					suffix: "<<",
				},
				"message"
			);

			const label = consoleErrorSpy.mock.calls[0]?.[0] as string;

			const esc = String.fromCharCode(27);
			// Should have RGB ANSI codes
			expect(label).toMatch(new RegExp(`${esc}\[48;2;\\d+;\\d+;\\d+m`));
			expect(label).toMatch(new RegExp(`${esc}\[38;2;\\d+;\\d+;\\d+m`));

			const stripped = stripAnsi(label);
			expect(stripped).toContain(">>");
			expect(stripped).toContain("<<");
			expect(stripped).toContain("CUSTOM");
		});

		it("should handle info with custom color instance", async () => {
			const { createHagen } = await import("../index.js");
			const { Ansis } = await import("ansis");
			const logger = createHagen({ colorOptions: { enabled: true } });
			const testAnsis = new Ansis();

			logger.info(
				{
					kind: "formatter",
					label: "CUSTOM",
					ansiFormatter: testAnsis.bgYellowBright.black,
					prefix: ">>",
				},
				"message"
			);
			const label = consoleInfoSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(label)).toBe(true);
			const stripped = stripAnsi(label);
			expect(stripped).toContain(">>");
			expect(stripped).toContain("CUSTOM");
		});

		it("should handle warn with custom color instance", async () => {
			const { createHagen } = await import("../index.js");
			const { Ansis } = await import("ansis");

			const logger = createHagen({ colorOptions: { enabled: true } });
			const testAnsis = new Ansis();

			logger.warn(
				{
					kind: "formatter",
					label: "CUSTOM",
					ansiFormatter: testAnsis.bgBlack.white,
					prefix: ">>",
					suffix: "<<",
				},
				"message"
			);
			const label = consoleWarnSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(label)).toBe(true);
			const stripped = stripAnsi(label);
			expect(stripped).toContain(">>");
			expect(stripped).toContain("<<");
			expect(stripped).toContain("CUSTOM");
		});

		it("should handle error with custom color instance", async () => {
			const { createHagen } = await import("../index.js");
			const { Ansis } = await import("ansis");

			const logger = createHagen({ colorOptions: { enabled: true } });
			const testAnsis = new Ansis();

			logger.error(
				{
					kind: "formatter",
					label: "CUSTOM",
					ansiFormatter: testAnsis.bgBlack.greenBright,
					prefix: ">>",
					suffix: "<<",
				},
				"message"
			);
			const label = consoleErrorSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(label)).toBe(true);
			const stripped = stripAnsi(label);
			expect(stripped).toContain(">>");
			expect(stripped).toContain("<<");
			expect(stripped).toContain("CUSTOM");
		});
	});
});
