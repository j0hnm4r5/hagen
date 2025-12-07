/**
 * Edge case tests for uncovered code paths.
 * Tests specific scenarios to improve code coverage.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearColorCache } from "../index.js";
import { hasAnsiCodes, stripAnsi } from "./helpers/ansi.js";

describe("Edge Cases", () => {
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

	describe("clearColorCache", () => {
		it("should clear the color cache", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			// Log with same label twice
			logger.log("TEST", "first");
			const label1 = consoleLogSpy.mock.calls[0]?.[0] as string;

			// Clear cache
			clearColorCache();

			// Log again with same label
			logger.log("TEST", "second");
			const label2 = consoleLogSpy.mock.calls[1]?.[0] as string;

			// Both should have ANSI codes (colors still work)
			expect(hasAnsiCodes(label1)).toBe(true);
			expect(hasAnsiCodes(label2)).toBe(true);

			// Function should not throw
			expect(() => {
				clearColorCache();
			}).not.toThrow();
		});

		it("should work when clearing empty cache", () => {
			// Clear cache when it's already empty
			expect(() => {
				clearColorCache();
			}).not.toThrow();
			expect(() => {
				clearColorCache();
			}).not.toThrow();
		});
	});

	describe("fixedWidthFormat edge cases", () => {
		it("should handle label exactly matching fixed width", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				enableColor: true,
				fixedWidth: {
					width: 10,
					truncationMethod: "end",
				},
			});

			// Label exactly 10 chars
			logger.log("EXACTWIDTH", "message");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label).trim();

			// Should be exactly 10 chars (no ellipsis, no padding)
			expect(stripped.replace(/\s+/g, "")).toBe("EXACTWIDTH");
		});

		it("should handle start truncation method", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				enableColor: true,
				fixedWidth: {
					width: 10,
					truncationMethod: "start",
				},
			});

			logger.log("VERYLONGLABEL", "message");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label).trim();

			// Should have ellipsis at start
			expect(stripped).toContain("…");
			expect(stripped).toMatch(/^…/); // Starts with ellipsis
		});

		it("should handle middle truncation method", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				enableColor: true,
				fixedWidth: {
					width: 10,
					truncationMethod: "middle",
				},
			});

			logger.log("VERYLONGLABEL", "message");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label).trim();

			// Should have ellipsis in middle
			expect(stripped).toContain("…");
			expect(stripped).not.toMatch(/^…/); // Not at start
			expect(stripped).not.toMatch(/…$/); // Not at end
		});

		it("should handle short label with padding", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				enableColor: true,
				fixedWidth: {
					width: 20,
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

	describe("Reserved method label overrides", () => {
		it("should handle info with custom prefix and suffix", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.info(
				{
					label: "CUSTOM",
					prefix: ">>",
					suffix: "<<",
				},
				"message"
			);

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			// Should use custom prefix instead of default "i"
			expect(stripped).toContain(">>");
			expect(stripped).toContain("<<");
			expect(stripped).toContain("CUSTOM");
		});

		it("should handle success with custom colors (bgColor/fgColor)", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.success(
				{
					label: "CUSTOM",
					bgColor: "#FF5733",
					fgColor: "#FFFFFF",
					prefix: ">>",
					suffix: "<<",
				},
				"message"
			);

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;

			// Should have RGB ANSI codes
			expect(label).toMatch(/\u001B\[48;2;\d+;\d+;\d+m/);
			expect(label).toMatch(/\u001B\[38;2;\d+;\d+;\d+m/);

			const stripped = stripAnsi(label);
			expect(stripped).toContain(">>");
			expect(stripped).toContain("<<");
			expect(stripped).toContain("CUSTOM");
		});

		it("should handle warn with custom colors (bgColor/fgColor)", async () => {
			const { createHagen } = await import("../index.js");
			const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			const logger = createHagen({ enableColor: true });

			logger.warn(
				{
					label: "CUSTOM",
					bgColor: "#FF5733",
					fgColor: "#FFFFFF",
					prefix: ">>",
					suffix: "<<",
				},
				"message"
			);

			const label = consoleWarnSpy.mock.calls[0]?.[0] as string;

			// Should have RGB ANSI codes
			expect(label).toMatch(/\u001B\[48;2;\d+;\d+;\d+m/);
			expect(label).toMatch(/\u001B\[38;2;\d+;\d+;\d+m/);

			const stripped = stripAnsi(label);
			expect(stripped).toContain(">>");
			expect(stripped).toContain("<<");
			expect(stripped).toContain("CUSTOM");

			consoleWarnSpy.mockRestore();
		});

		it("should handle error with custom colors (bgColor/fgColor)", async () => {
			const { createHagen } = await import("../index.js");
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			const logger = createHagen({ enableColor: true });

			logger.error(
				{
					label: "CUSTOM",
					bgColor: "#FF5733",
					fgColor: "#FFFFFF",
					prefix: ">>",
					suffix: "<<",
				},
				"message"
			);

			const label = consoleErrorSpy.mock.calls[0]?.[0] as string;

			// Should have RGB ANSI codes
			expect(label).toMatch(/\u001B\[48;2;\d+;\d+;\d+m/);
			expect(label).toMatch(/\u001B\[38;2;\d+;\d+;\d+m/);

			const stripped = stripAnsi(label);
			expect(stripped).toContain(">>");
			expect(stripped).toContain("<<");
			expect(stripped).toContain("CUSTOM");

			consoleErrorSpy.mockRestore();
		});

		it("should handle info with custom color instance", async () => {
			const { createHagen, defaultConfig } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.info(
				{
					label: "CUSTOM",
					color: defaultConfig.colors.reserved.WARN, // Borrow WARN color
					prefix: ">>",
				},
				"message"
			);

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(label)).toBe(true);
			const stripped = stripAnsi(label);
			expect(stripped).toContain(">>");
			expect(stripped).toContain("CUSTOM");
		});

		it("should handle success with custom color instance", async () => {
			const { createHagen, defaultConfig } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.success(
				{
					label: "CUSTOM",
					color: defaultConfig.colors.reserved.ERROR, // Borrow ERROR color
					suffix: "<<",
				},
				"message"
			);

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(label)).toBe(true);
			const stripped = stripAnsi(label);
			expect(stripped).toContain("<<");
			expect(stripped).toContain("CUSTOM");
		});

		it("should handle warn with custom color instance", async () => {
			const { createHagen, defaultConfig } = await import("../index.js");
			const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			const logger = createHagen({ enableColor: true });

			logger.warn(
				{
					label: "CUSTOM",
					color: defaultConfig.colors.reserved.INFO, // Borrow INFO color
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

			consoleWarnSpy.mockRestore();
		});

		it("should handle error with custom color instance", async () => {
			const { createHagen, defaultConfig } = await import("../index.js");
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			const logger = createHagen({ enableColor: true });

			logger.error(
				{
					label: "CUSTOM",
					color: defaultConfig.colors.reserved.SUCCESS, // Borrow SUCCESS color
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

			consoleErrorSpy.mockRestore();
		});
	});
});
