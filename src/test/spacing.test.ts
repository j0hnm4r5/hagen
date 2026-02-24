/**
 * Tests for spacing and margins around labels.
 * Ensures consistent spacing before and after label text.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stripAnsi } from "./helpers/ansi.js";

describe("Spacing and Margins", () => {
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		vi.stubEnv("CI", "");
		vi.stubEnv("FORCE_COLOR", "3");
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	describe("Colored Mode", () => {
		it("should have space before label", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.log("X", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			// Should start with a space
			expect(stripped.charAt(0)).toBe(" ");
		});

		it("should have space after label", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.log("X", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			// Should end with a space
			expect(stripped.charAt(stripped.length - 1)).toBe(" ");
		});

		it("should have exactly one space before and after for single char", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.log("X", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			expect(stripped).toBe(" X ");
		});

		it("should maintain spacing for multi-char labels", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.log("TEST", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			expect(stripped).toBe(" TEST ");
		});

		it("should maintain spacing with long labels", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			const longLabel = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			logger.log(longLabel, "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			expect(stripped).toBe(` ${longLabel} `);
			expect(stripped.startsWith(" ")).toBe(true);
			expect(stripped.endsWith(" ")).toBe(true);
		});
	});

	describe("Colorless Mode", () => {
		it("should have proper spacing in brackets", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: false } });

			logger.log("X", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;

			// Should be: [ X ]
			expect(label).toBe("[ X ]");
		});

		it("should maintain spacing for various label lengths", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: false } });

			// Single char
			logger.log("X", "msg");
			expect(consoleLogSpy.mock.calls[0]?.[0]).toBe("[ X ]");

			// Short
			consoleLogSpy.mockClear();
			logger.log("API", "msg");
			expect(consoleLogSpy.mock.calls[0]?.[0]).toBe("[ API ]");

			// Medium
			consoleLogSpy.mockClear();
			logger.log("DATABASE", "msg");
			expect(consoleLogSpy.mock.calls[0]?.[0]).toBe("[ DATABASE ]");

			// Long
			consoleLogSpy.mockClear();
			logger.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "msg");
			expect(consoleLogSpy.mock.calls[0]?.[0]).toBe("[ ABCDEFGHIJKLMNOPQRSTUVWXYZ ]");
		});
	});

	describe("With Prefix/Suffix", () => {
		it("should maintain spacing with prefix in colored mode", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				colorOptions: { enabled: true },
				layout: " >>%l",
			});

			logger.log("TEST", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			// Should have spaces around the whole thing: " >> TEST "
			expect(stripped).toContain(">>");
			expect(stripped).toContain("TEST");
			expect(stripped.startsWith(" ")).toBe(true);
			expect(stripped.endsWith(" ")).toBe(true);
		});

		it("should maintain spacing with suffix in colored mode", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				colorOptions: { enabled: true },
				layout: " %l<< ",
			});

			logger.log("TEST", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			expect(stripped).toContain("TEST");
			expect(stripped).toContain("<<");
			expect(stripped.startsWith(" ")).toBe(true);
			expect(stripped.endsWith(" ")).toBe(true);
		});

		it("should maintain spacing with both prefix and suffix", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				colorOptions: { enabled: true },
				layout: " >>%l<< ",
			});

			logger.log("TEST", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			expect(stripped).toContain(">>");
			expect(stripped).toContain("TEST");
			expect(stripped).toContain("<<");
			expect(stripped.startsWith(" ")).toBe(true);
			expect(stripped.endsWith(" ")).toBe(true);
		});
	});

	describe("Edge Cases", () => {
		it("should handle empty label with proper spacing", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.log("", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			// Empty label gets printed as empty space (padding)
			expect(stripped).toBe("  ");
		});

		it("should handle label with internal spaces", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.log("TEST LABEL", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			// Should preserve internal spaces and add margin spaces
			expect(stripped).toBe(" TEST LABEL ");
		});

		it("should handle label with leading/trailing spaces", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.log("  TEST  ", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			// No trimming, plus margins: " " + "  TEST  " + " "
			expect(stripped).toBe("   TEST   ");
		});

		it("should maintain consistent spacing across multiple logs", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ colorOptions: { enabled: true } });

			logger.log("A", "msg1");
			logger.log("BB", "msg2");
			logger.log("CCC", "msg3");

			const label1 = stripAnsi(consoleLogSpy.mock.calls[0]?.[0] as string);
			const label2 = stripAnsi(consoleLogSpy.mock.calls[1]?.[0] as string);
			const label3 = stripAnsi(consoleLogSpy.mock.calls[2]?.[0] as string);

			// All should start and end with single space
			expect(label1).toBe(" A ");
			expect(label2).toBe(" BB ");
			expect(label3).toBe(" CCC ");
		});
	});
});
