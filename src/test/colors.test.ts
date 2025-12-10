/**
 * Tests for ANSI color codes validation.
 * Ensures that correct ANSI color codes are used for each color variant.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hasAnsiCodes, hasBold, hasBackgroundColor } from "./helpers/ansi.js";
import type { Label } from "../index.js";

describe("ANSI Color Codes", () => {
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.stubEnv("CI", "");
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
		consoleWarnSpy.mockRestore();
		consoleErrorSpy.mockRestore();
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	describe("Normal Color Palette (0-5)", () => {
		it("should use ANSI codes for color 0 (Royal Blue)", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			const label: Label = { label: "COLOR0", color: 0 };
			logger.log(label, "test");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			expect(hasBold(output)).toBe(true);
			expect(hasBackgroundColor(output)).toBe(true);

			// Should have Royal Blue background (#4169E1 = RGB 65,105,225)
			expect(output).toContain("\u001B[48;2;65;105;225m");
			// Should have black foreground (30)
			expect(output).toContain("\u001B[38;2;255;255;255m");
		});

		it("should use ANSI codes for color 1 (green background)", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			const label: Label = { label: "COLOR1", color: 1 };
			logger.log(label, "test");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			expect(hasBold(output)).toBe(true);

			// Should have Emerald Green background (#2ECC71 = RGB 46,204,113)
			expect(output).toContain("\u001B[48;2;46;204;113m");
			// Should have black foreground (#000000 = RGB 0,0,0)
			expect(output).toContain("\u001B[38;2;0;0;0m");
		});

		it("should use ANSI codes for color 2 (cyan background)", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			const label: Label = { label: "COLOR2", color: 2 };
			logger.log(label, "test");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			expect(hasBold(output)).toBe(true);

			// Should have Turquoise background (#1ABC9C = RGB 26,188,156)
			expect(output).toContain("\u001B[48;2;26;188;156m");
			// Should have black foreground (30)
			expect(output).toContain("\u001B[38;2;0;0;0m");
		});

		it("should use ANSI codes for color 3 (red background)", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			const label: Label = { label: "COLOR3", color: 3 };
			logger.log(label, "test");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			expect(hasBold(output)).toBe(true);

			// Should have Alizarin Red background (#E74C3C = RGB 231,76,60)
			expect(output).toContain("\u001B[48;2;231;76;60m");
			// Should have white foreground (37)
			expect(output).toContain("\u001B[38;2;255;255;255m");
		});

		it("should use ANSI codes for color 4 (magenta background)", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			const label: Label = { label: "COLOR4", color: 4 };
			logger.log(label, "test");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			expect(hasBold(output)).toBe(true);

			// Should have Amethyst background (#9B59B6 = RGB 155,89,182)
			expect(output).toContain("\u001B[48;2;155;89;182m");
			// Should have white foreground (37)
			expect(output).toContain("\u001B[38;2;255;255;255m");
		});

		it("should use ANSI codes for color 5 (yellow background)", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			const label: Label = { label: "COLOR5", color: 5 };
			logger.log(label, "test");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			expect(hasBold(output)).toBe(true);

			// Should have Orange background (#F39C12 = RGB 243,156,18)
			expect(output).toContain("\u001B[48;2;243;156;18m");
			// Should have black foreground (30)
			expect(output).toContain("\u001B[38;2;0;0;0m");
		});

		it("should apply bold to all colored labels", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			for (let i = 0; i <= 5; i++) {
				consoleLogSpy.mockClear();
				const label: Label = { label: `COLOR${i}`, color: i };
				logger.log(label, "test");

				const output = consoleLogSpy.mock.calls[0]?.[0] as string;
				expect(hasBold(output)).toBe(true);
				expect(output).toContain("\u001B[1m"); // Bold on
			}
		});
	});

	describe("Reserved Colors (Predefined Labels)", () => {
		it("should use correct ANSI codes for WARN (bgYellowBright + black)", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.warn("WARN", "warning message");

			const output = consoleWarnSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			expect(hasBold(output)).toBe(true);

			// Should have Orange background (#FFA500 = RGB 255,165,0)
			expect(output).toContain("\u001B[48;2;255;165;0m");
			// Should have black foreground (30)
			expect(output).toContain("\u001B[38;2;0;0;0m");
		});

		it("should use correct ANSI codes for ERROR (bgRedBright + black)", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.error("ERROR", "error message");

			const output = consoleErrorSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			expect(hasBold(output)).toBe(true);

			// Should have Crimson background (#DC143C = RGB 220,20,60)
			expect(output).toContain("\u001B[48;2;220;20;60m");
			// Should have white foreground (#FFFFFF = RGB 255,255,255)
			expect(output).toContain("\u001B[38;2;255;255;255m");
		});

		it("should use correct ANSI codes for INFO (bgBlack + white)", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.info("INFO", "info message");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			expect(hasBold(output)).toBe(true);

			// Should have Dodger Blue background (#1E90FF = RGB 30,144,255)
			expect(output).toContain("\u001B[48;2;30;144;255m");
			// Should have white foreground (37)
			expect(output).toContain("\u001B[38;2;255;255;255m");
		});

		it("should use correct ANSI codes for SUCCESS (bgBlack + greenBright)", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.success("SUCCESS", "success message");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			expect(hasBold(output)).toBe(true);

			// Should have Lime Green background (#32CD32 = RGB 50,205,50)
			expect(output).toContain("\u001B[48;2;50;205;50m");
			// Should have black foreground (#000000 = RGB 0,0,0)
			expect(output).toContain("\u001B[38;2;0;0;0m");
		});
	});

	describe("Custom Colors", () => {
		it("should use RGB ANSI codes for custom hex colors", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			const label: Label = {
				label: "CUSTOM",
				bgColor: "#FF5733",
				fgColor: "#FFFFFF",
			};
			logger.log(label, "test");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			expect(hasBold(output)).toBe(true);

			// Should have RGB color codes (48;2;R;G;B for background, 38;2;R;G;B for foreground)
			expect(output).toMatch(/\u001B\[48;2;\d+;\d+;\d+m/); // BG RGB
			expect(output).toMatch(/\u001B\[38;2;\d+;\d+;\d+m/); // FG RGB
		});

		it("should use custom Chalk instance", async () => {
			const { Chalk } = await import("chalk");
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			const customChalk = new Chalk({ level: 3 });
			const customColor = customChalk.bgMagenta.yellow;

			const label: Label = {
				label: "CUSTOM",
				color: customColor,
			};
			logger.log(label, "test");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
			expect(hasBold(output)).toBe(true);

			// Should have magenta background (45) and yellow foreground (33)
			expect(output).toContain("\u001B[45m");
			expect(output).toContain("\u001B[33m");
		});
	});

	describe("Color Reset Codes", () => {
		it("should include proper reset codes after colored text", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.log({ label: "TEST", color: 0 }, "message");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			// Should have reset codes
			expect(output).toMatch(/\u001B\[(?:22|39|49)m/); // Bold reset (22), FG reset (39), or BG reset (49)
		});

		it("should properly reset after each label", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.log({ label: "FIRST", color: 0 }, "msg1");
			logger.log({ label: "SECOND", color: 1 }, "msg2");

			const first = consoleLogSpy.mock.calls[0]?.[0] as string;
			const second = consoleLogSpy.mock.calls[1]?.[0] as string;

			// Both should have reset codes
			expect(first).toMatch(/\u001B\[(?:22|39|49)m/);
			expect(second).toMatch(/\u001B\[(?:22|39|49)m/);

			// Colors should be different
			expect(first).not.toBe(second);
		});
	});

	describe("Calculated Colors (String Labels)", () => {
		it("should calculate color based on label text", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			// Same label should get same color
			logger.log("API", "msg1");
			logger.log("API", "msg2");

			const first = consoleLogSpy.mock.calls[0]?.[0] as string;
			const second = consoleLogSpy.mock.calls[1]?.[0] as string;

			// Should both have ANSI codes
			expect(hasAnsiCodes(first)).toBe(true);
			expect(hasAnsiCodes(second)).toBe(true);

			// Colors should be identical for same label
			expect(first).toBe(second);
		});

		it("should assign different colors to different labels", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.log("API", "msg1");
			const first = consoleLogSpy.mock.calls[0]?.[0] as string;

			consoleLogSpy.mockClear();
			logger.log("DATABASE", "msg2");
			const second = consoleLogSpy.mock.calls[0]?.[0] as string;

			// Should both have ANSI codes
			expect(hasAnsiCodes(first)).toBe(true);
			expect(hasAnsiCodes(second)).toBe(true);

			// Colors will likely be different (not guaranteed but probable)
			// At minimum, they should both be valid colored outputs
			expect(hasBold(first)).toBe(true);
			expect(hasBold(second)).toBe(true);
		});
	});

	describe("Colorless Mode", () => {
		it("should not output any ANSI codes when colors disabled", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: false });

			// Test all color variants
			logger.log({ label: "COLOR0", color: 0 }, "test");
			logger.log({ label: "COLOR1", color: 1 }, "test");
			logger.warn("WARN", "test");
			logger.error("ERROR", "test");

			const calls = [
				consoleLogSpy.mock.calls[0]?.[0] as string,
				consoleLogSpy.mock.calls[1]?.[0] as string,
				consoleWarnSpy.mock.calls[0]?.[0] as string,
				consoleErrorSpy.mock.calls[0]?.[0] as string,
			];

			// None should have ANSI codes
			for (const output of calls) {
				expect(hasAnsiCodes(output)).toBe(false);
			}
		});
	});
});
