/**
 * Tests for content validation.
 * Ensures labels, messages, prefixes, suffixes, and timestamps appear correctly.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stripAnsi } from "./helpers/ansi.js";
import type { Label } from "../index.js";

describe("Content Validation", () => {
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

	describe("Label Text", () => {
		it("should output exact label text", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.log("EXACT_LABEL", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			expect(stripped).toContain("EXACT_LABEL");
		});

		it("should handle empty label", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.log("", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(label).toBeDefined();
		});

		it("should handle very long labels", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			const longLabel = "A".repeat(100);
			logger.log(longLabel, "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			expect(stripped).toContain(longLabel);
		});

		it("should handle special characters in labels", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.log("🚀 TEST 🎉", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			const stripped = stripAnsi(label);

			expect(stripped).toContain("🚀 TEST 🎉");
		});
	});

	describe("Message Content", () => {
		it("should output exact message text", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.log("LABEL", "exact message text");

			const message = consoleLogSpy.mock.calls[0]?.[1] as string;
			expect(message).toBe("exact message text");
		});

		it("should handle multiple message arguments", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.log("LABEL", "msg1", "msg2", "msg3");

			const calls = consoleLogSpy.mock.calls[0] || [];
			expect(calls[1]).toBe("msg1");
			expect(calls[2]).toBe("msg2");
			expect(calls[3]).toBe("msg3");
		});

		it("should handle objects as messages", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			const obj = { key: "value", num: 42 };
			logger.log("LABEL", obj);

			const message = consoleLogSpy.mock.calls[0]?.[1];
			expect(message).toEqual(obj);
		});

		it("should handle arrays as messages", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			const arr = [1, 2, 3, "four"];
			logger.log("LABEL", arr);

			const message = consoleLogSpy.mock.calls[0]?.[1];
			expect(message).toEqual(arr);
		});

		it("should handle multiline messages", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.log("LABEL", "line1\nline2\nline3");

			const message = consoleLogSpy.mock.calls[0]?.[1] as string;
			expect(message).toBe("line1\nline2\nline3");
			expect(message.split("\n")).toHaveLength(3);
		});

		it("should handle empty message", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.log("LABEL", "");

			const message = consoleLogSpy.mock.calls[0]?.[1];
			expect(message).toBe("");
		});
	});

	describe("Prefix and Suffix", () => {
		it("should apply global labelPrefix", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				enableColor: false,
				labelPrefix: ">>",
			});

			logger.log("TEST", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(label).toContain(">>");
			expect(label).toContain("TEST");
		});

		it("should apply global labelSuffix", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				enableColor: false,
				labelSuffix: "<<",
			});

			logger.log("TEST", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(label).toContain("<<");
			expect(label).toContain("TEST");
		});

		it("should apply both global prefix and suffix", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				enableColor: false,
				labelPrefix: ">>",
				labelSuffix: "<<",
			});

			logger.log("TEST", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(label).toContain(">>");
			expect(label).toContain("TEST");
			expect(label).toContain("<<");
		});

		it("should override global prefix with label-specific prefix", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				enableColor: false,
				labelPrefix: ">>",
			});

			const label: Label = {
				label: "TEST",
				prefix: "**",
			};
			logger.log(label, "msg");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(output).toContain("**");
			expect(output).not.toContain(">>");
		});

		it("should override global suffix with label-specific suffix", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				enableColor: false,
				labelSuffix: "<<",
			});

			const label: Label = {
				label: "TEST",
				suffix: "**",
			};
			logger.log(label, "msg");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(output).toContain("**");
			expect(output).not.toContain("<<");
		});
	});

	describe("Timestamps", () => {
		it("should include timestamp when enabled", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				enableColor: false,
				showTimestamp: true,
				dateFormat: "time",
				timeFormat: "24h",
			});

			logger.log("TEST", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;

			// Should have timestamp in brackets with time format
			expect(label).toMatch(/\[\s*\d{1,2}:\d{2}:\d{2}\s*\]/);
		});

		it("should use ISO format", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				enableColor: false,
				showTimestamp: true,
				dateFormat: "iso",
			});

			logger.log("TEST", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;

			// ISO format: YYYY-MM-DDTHH:MM:SS.sssZ
			expect(label).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
		});

		it("should use 12-hour time format", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				enableColor: false,
				showTimestamp: true,
				dateFormat: "time",
				timeFormat: "12h",
			});

			logger.log("TEST", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;

			// 12-hour format should have AM or PM
			expect(label).toMatch(/(AM|PM)/);
		});

		it("should use custom date format function", async () => {
			const { createHagen } = await import("../index.js");
			const customFormat = (date: Date) => `CUSTOM-${date.getFullYear()}`;
			const logger = createHagen({
				enableColor: false,
				showTimestamp: true,
				dateFormat: customFormat,
			});

			logger.log("TEST", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(label).toContain("CUSTOM-");
			expect(label).toMatch(/CUSTOM-\d{4}/);
		});

		it("should not include timestamp when disabled", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({
				enableColor: false,
				showTimestamp: false,
			});

			logger.log("TEST", "msg");

			const label = consoleLogSpy.mock.calls[0]?.[0] as string;

			// Should only have label brackets, not timestamp brackets
			const bracketMatches = label.match(/\[/g);
			expect(bracketMatches).toHaveLength(1); // Only the label bracket
		});
	});

	describe("Log Levels", () => {
		it("should use console.log for log()", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.log("TEST", "msg");

			expect(consoleLogSpy).toHaveBeenCalledOnce();
			expect(consoleWarnSpy).not.toHaveBeenCalled();
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it("should use console.log for info()", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.info("TEST", "msg");

			expect(consoleLogSpy).toHaveBeenCalledOnce();
			expect(consoleWarnSpy).not.toHaveBeenCalled();
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it("should use console.log for success()", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.success("TEST", "msg");

			expect(consoleLogSpy).toHaveBeenCalledOnce();
			expect(consoleWarnSpy).not.toHaveBeenCalled();
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it("should use console.warn for warn()", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.warn("TEST", "msg");

			expect(consoleWarnSpy).toHaveBeenCalledOnce();
			expect(consoleLogSpy).not.toHaveBeenCalled();
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it("should use console.error for error()", async () => {
			const { createHagen } = await import("../index.js");
			const logger = createHagen({ enableColor: true });

			logger.error("TEST", "msg");

			expect(consoleErrorSpy).toHaveBeenCalledOnce();
			expect(consoleLogSpy).not.toHaveBeenCalled();
			expect(consoleWarnSpy).not.toHaveBeenCalled();
		});
	});
});
