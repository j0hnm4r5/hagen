/**
 * Tests for color formatting validation.
 * Ensures that correct RGB color codes are used for each color variant.
 */

import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hasAnsiCodes, hasBackgroundColor, hasBold } from "./helpers/ansi.js";

describe("Color Formatting", () => {
	let consoleLogSpy: MockInstance;
	let consoleWarnSpy: MockInstance;
	let consoleErrorSpy: MockInstance;
	let consoleInfoSpy: MockInstance;

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
		consoleWarnSpy.mockRestore();
		consoleErrorSpy.mockRestore();
		consoleInfoSpy.mockRestore();
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	describe("Hash-based Color Generation", () => {
		it("should generate colors from label hash", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.log("API", "test");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			expect(hasBackgroundColor(output)).toBe(true);
			// Should have RGB background codes
			expect(output).toContain("\u001B[48;2;");
			// Should have RGB foreground codes
			expect(output).toContain("\u001B[38;2;");
		});

		it("should generate consistent colors for the same label", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.log("CONSISTENT", "first call");
			const output1 = consoleLogSpy.mock.calls[0]?.[0] as string;

			consoleLogSpy.mockClear();

			logger.log("CONSISTENT", "second call");
			const output2 = consoleLogSpy.mock.calls[0]?.[0] as string;

			// Both outputs should use the same color (same ANSI codes for color part)
			const esc = String.fromCharCode(27);
			const colorRegex = new RegExp(`${esc}\[48;2;\\d+;\\d+;\\d+m`);
			const color1 = colorRegex.exec(output1)?.[0];
			const color2 = colorRegex.exec(output2)?.[0];
			expect(color1).toBe(color2);
		});

		it("should generate different colors for different labels", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.log("LABEL_A", "test");
			const output1 = consoleLogSpy.mock.calls[0]?.[0] as string;

			consoleLogSpy.mockClear();

			logger.log("LABEL_B", "test");
			const output2 = consoleLogSpy.mock.calls[0]?.[0] as string;

			const esc = String.fromCharCode(27);
			const colorRegex = new RegExp(`${esc}\[48;2;\\d+;\\d+;\\d+m`);
			const color1 = colorRegex.exec(output1)?.[0];
			const color2 = colorRegex.exec(output2)?.[0];

			// Different labels should likely have different colors
			// (not guaranteed but very likely with hash)
			expect(color1).not.toBe(color2);
		});

		it("should NOT apply bold to all labels (removed to fix color issues)", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.log("TEST", "test");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(hasBold(output)).toBe(false);
			expect(output).not.toContain("\u001B[1m");
		});
	});

	describe("Specialized Log Levels", () => {
		it("should use correct RGB codes for WARN (Orange with black text)", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.warn("WARN", "warning message");

			const output = consoleWarnSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);

			// Should have Orange background (RGB 255,165,0)
			expect(output).toContain("\u001B[48;2;255;165;0m");
			// Should have black foreground (using RGB black)
			expect(output).toContain("\u001B[38;2;0;0;0m");
		});

		it("should use correct RGB codes for ERROR (Crimson with white text)", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.error("ERROR", "error message");

			const output = consoleErrorSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);

			// Should have Crimson background (RGB 220,20,60)
			expect(output).toContain("\u001B[48;2;220;20;60m");
			// Should have white foreground (using RGB white)
			expect(output).toContain("\u001B[38;2;255;255;255m");
		});

		it("should use correct RGB codes for INFO (Royal Blue with white text)", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.info("INFO", "info message");

			const output = consoleInfoSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);

			// Should have Royal Blue background (RGB 65,105,225)
			expect(output).toContain("\u001B[48;2;65;105;225m");
			// Should have white foreground (using RGB white)
			expect(output).toContain("\u001B[38;2;255;255;255m");
		});
	});

	describe("Custom Colors", () => {
		it("should support hex color strings with auto-calculated text", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			// Use a light color that should get black text
			logger.log({ kind: "color", label: "CUSTOM", bgColor: "#FFFF00" }, "test");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			// Should have yellow background (RGB 255,255,0)
			expect(output).toContain("\u001B[48;2;255;255;0m");
			// Should have black foreground (light bg)
			expect(output).toContain("\u001B[38;2;0;0;0m");
		});

		it("should support RGB tuple colors with auto-calculated text", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			// Use a dark color that should get white text
			logger.log({ kind: "color", label: "CUSTOM", bgColor: [20, 20, 80] }, "test");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			// Should have dark blue background
			expect(output).toContain("\u001B[48;2;20;20;80m");
			// Should have white foreground (dark bg)
			expect(output).toContain("\u001B[38;2;255;255;255m");
		});

		it("should auto-calculate black text for light backgrounds", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.log({ kind: "color", label: "LIGHT", bgColor: "#FFFFFF" }, "test");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			// White bg should get black text
			expect(output).toContain("\u001B[48;2;255;255;255m");
			expect(output).toContain("\u001B[38;2;0;0;0m");
		});

		it("should auto-calculate white text for dark backgrounds", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.log({ kind: "color", label: "DARK", bgColor: "#000000" }, "test");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			// Black bg should get white text
			expect(output).toContain("\u001B[48;2;0;0;0m");
			expect(output).toContain("\u001B[38;2;255;255;255m");
		});
	});

	describe("Palette Quantization", () => {
		it("should quantize colors when paletteSize is specified", async () => {
			const { createHagen } = await import("../index.js");

			// With 8 colors (2 levels per channel), RGB values snap to 0 or 255
			const logger = createHagen({ colorOptions: { enabled: true, paletteSize: 8 } });

			logger.log({ kind: "color", label: "QUANT", bgColor: [100, 150, 200] }, "test");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			// Should have quantized background
			expect(output).toContain("\u001B[48;2;");
		});

		it("should not quantize when paletteSize is undefined", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.log({ kind: "color", label: "FULL", bgColor: [100, 150, 200] }, "test");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			// Should have exact RGB background values
			expect(output).toContain("\u001B[48;2;100;150;200m");
		});

		it("should quantize reserved colors when paletteSize is specified", async () => {
			const { createHagen } = await import("../index.js");

			// With small palette, colors should be quantized
			const logger = createHagen({ colorOptions: { enabled: true, paletteSize: 8 } });

			logger.warn("WARN", "test");

			const output = consoleWarnSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			// Orange (255,165,0) should be quantized
			// With 2 levels: 255->255, 165->255, 0->0 = (255,255,0)
			expect(output).toContain("\u001B[48;2;255;255;0m");
		});
	});
});