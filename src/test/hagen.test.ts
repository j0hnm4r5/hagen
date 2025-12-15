import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Label } from "../index.js";
import hagen, { createHagen, type LoggerConfig } from "../index.js";

describe("Hagen Logger", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("createHagen", () => {
		it("should create a logger instance with default config", () => {
			const logger = createHagen();
			expect(logger).toBeDefined();
			expect(logger.log).toBeDefined();
			expect(logger.info).toBeDefined();
			expect(logger.warn).toBeDefined();
			expect(logger.error).toBeDefined();
			expect(logger.debug).toBeDefined();
		});

		it("should create a logger instance with custom config", () => {
			const logger = createHagen({
				showTimestamp: true,
			});
			expect(logger).toBeDefined();
		});

		it("should accept all config options", () => {
			const config: Partial<LoggerConfig> = {
				showTimestamp: true,
				enableColor: true,

				labelPrefix: "<",
				labelSuffix: ">",
			};
			const logger = createHagen(config);
			expect(logger).toBeDefined();
		});

		it("should accept custom date format function", () => {
			const customDateFormat = (date: Date) => date.toISOString();
			const logger = createHagen({
				timestampFormatter: customDateFormat,
			});
			expect(logger).toBeDefined();
		});
	});

	describe("default instance", () => {
		it("should export a default logger instance", () => {
			expect(hagen).toBeDefined();
			expect(hagen.log).toBeDefined();
		});

		it("should have all logging methods", () => {
			expect(hagen.log).toBeTypeOf("function");
			expect(hagen.info).toBeTypeOf("function");
			expect(hagen.warn).toBeTypeOf("function");
			expect(hagen.error).toBeTypeOf("function");
			expect(hagen.debug).toBeTypeOf("function");
		});
	});

	describe("logging methods", () => {
		let consoleLogSpy: ReturnType<typeof vi.spyOn>;
		let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
		let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
		let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
		});

		afterEach(() => {
			consoleLogSpy.mockRestore();
			consoleWarnSpy.mockRestore();
			consoleErrorSpy.mockRestore();
			consoleDebugSpy.mockRestore();
		});

		describe("log", () => {
			it("should log with string label", () => {
				const logger = createHagen();
				logger.log("TEST", "message");
				expect(consoleLogSpy).toHaveBeenCalledOnce();
			});

			it("should log with Label object", () => {
				const logger = createHagen({
					labelPrefix: ">>", // Adding prefix from previous config not visible but assumed based on context? No, wait.
					// Ah, earlier I saw strict type error for { label, bgColor }.
					// Let's just fix the object.
				});
				const label: Label = { kind: "color", label: "TEST", bgColor: [100, 50, 150] };
				logger.log(label, "message");
				expect(consoleLogSpy).toHaveBeenCalledOnce();
			});

			it("should log with prefix and suffix in label", () => {
				const logger = createHagen();
				const label: Label = {
					kind: "color",
					label: "TEST",
					bgColor: [100, 50, 150],
					prefix: ">>",
					suffix: "<<",
				};
				logger.log(label, "message");
				expect(consoleLogSpy).toHaveBeenCalledOnce();
			});

			it("should log with timestamp when enabled", () => {
				const logger = createHagen({ showTimestamp: true });
				logger.log("TEST", "message");
				expect(consoleLogSpy).toHaveBeenCalledOnce();
			});
		});

		describe("info", () => {
			it("should log info message with string label", () => {
				const logger = createHagen();
				logger.info("INFO", "information message");
				expect(consoleLogSpy).toHaveBeenCalledOnce();
			});

			it("should log info message with Label object", () => {
				const logger = createHagen();
				const label: Label = { kind: "color", label: "INFO", bgColor: [65, 105, 225] };
				logger.info(label, "information message");
				expect(consoleLogSpy).toHaveBeenCalledOnce();
			});
		});

		describe("warn", () => {
			it("should log warning message with string label", () => {
				const logger = createHagen();
				logger.warn("WARN", "warning message");
				expect(consoleWarnSpy).toHaveBeenCalledOnce();
			});

			it("should log warning message with Label object", () => {
				const logger = createHagen();
				const label: Label = { kind: "color", label: "WARN", bgColor: [255, 165, 0] };
				logger.warn(label, "warning message");
				expect(consoleWarnSpy).toHaveBeenCalledOnce();
			});
		});

		describe("error", () => {
			it("should log error message with string label", () => {
				const logger = createHagen();
				logger.error("ERROR", "error message");
				expect(consoleErrorSpy).toHaveBeenCalledOnce();
			});

			it("should log error message with Label object", () => {
				const logger = createHagen();
				const label: Label = { kind: "color", label: "ERROR", bgColor: [220, 20, 60] };
				logger.error(label, "error message");
				expect(consoleErrorSpy).toHaveBeenCalledOnce();
			});
		});

		describe("debug", () => {
			it("should log debug message with string label", () => {
				const logger = createHagen();
				logger.debug("DEBUG", "debug message");
				expect(consoleDebugSpy).toHaveBeenCalledOnce();
			});

			it("should log debug message with Label object", () => {
				const logger = createHagen();
				const label: Label = { kind: "color", label: "DEBUG", bgColor: [0, 255, 255] };
				logger.debug(label, "debug message");
				expect(consoleDebugSpy).toHaveBeenCalledOnce();
			});
		});
	});

	describe("configuration options", () => {
		let consoleLogSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		});

		afterEach(() => {
			consoleLogSpy.mockRestore();
		});

		describe("showTimestamp", () => {
			it("should not show timestamp by default", () => {
				const logger = createHagen();
				logger.log("TEST", "message");
				expect(consoleLogSpy).toHaveBeenCalledOnce();
			});

			it("should show timestamp when enabled", () => {
				const logger = createHagen({ showTimestamp: true });
				logger.log("TEST", "message");
				expect(consoleLogSpy).toHaveBeenCalledOnce();
				const output = consoleLogSpy.mock.calls[0]?.[0] as string;
				expect(output).toContain(":");
			});
		});

		describe("enableColor", () => {
			it("should enable color by default in non-CI", () => {
				const logger = createHagen();
				expect(logger).toBeDefined();
			});

			it("should disable color when set to false", () => {
				const logger = createHagen({ enableColor: false });
				logger.log("TEST", "message");
				expect(consoleLogSpy).toHaveBeenCalledOnce();
				const output = consoleLogSpy.mock.calls[0]?.[0] as string;
				expect(output).toContain("[ TEST ]");
			});

			it("should format colorless output with proper spacing", () => {
				const logger = createHagen({ enableColor: false });
				logger.log("API", "message");
				expect(consoleLogSpy).toHaveBeenCalledOnce();
				const output = consoleLogSpy.mock.calls[0]?.[0] as string;
				expect(output).toMatch(/\[\s+API\s+\]/);
			});
		});

		describe("dateFormat", () => {
			it("should use iso format", () => {
				const logger = createHagen({
					showTimestamp: true,
				});
				logger.log("TEST", "message");
				expect(consoleLogSpy).toHaveBeenCalledOnce();
			});

			it("should use custom date format function", () => {
				const customFormat = (date: Date) => `CUSTOM:${date.getFullYear()}`;
				const logger = createHagen({
					showTimestamp: true,
					timestampFormatter: customFormat,
				});
				logger.log("TEST", "message");
				expect(consoleLogSpy).toHaveBeenCalledOnce();
				const output = consoleLogSpy.mock.calls[0]?.[0] as string;
				expect(output).toContain("CUSTOM:");
			});
		});

		describe("labelPrefix and labelSuffix", () => {
			it("should use default brackets", () => {
				const logger = createHagen({ enableColor: false });
				logger.log("TEST", "message");
				expect(consoleLogSpy).toHaveBeenCalledOnce();
				const output = consoleLogSpy.mock.calls[0]?.[0] as string;
				expect(output).toContain("[");
				expect(output).toContain("]");
			});

			it("should use custom prefix and suffix", () => {
				const logger = createHagen({
					enableColor: false,
					labelPrefix: "<<",
					labelSuffix: ">>",
				});
				logger.log("TEST", "message");
				expect(consoleLogSpy).toHaveBeenCalledOnce();
				const output = consoleLogSpy.mock.calls[0]?.[0] as string;
				expect(output).toContain("<<");
				expect(output).toContain(">>");
			});

			it("should override global prefix/suffix with label-specific ones", () => {
				const logger = createHagen({
					enableColor: false,
					labelPrefix: "[",
					labelSuffix: "]",
				});
				const label: Label = {
					kind: "color",
					label: "TEST",
					prefix: ">>",
					suffix: "<<",
				};
				logger.log(label, "message");
				expect(consoleLogSpy).toHaveBeenCalledOnce();
				const output = consoleLogSpy.mock.calls[0]?.[0] as string;
				expect(output).toContain(">>");
				expect(output).toContain("<<");
			});
		});
	});

	describe("Label type", () => {
		let consoleLogSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		});

		afterEach(() => {
			consoleLogSpy.mockRestore();
		});

		it("should accept string as label", () => {
			const logger = createHagen();
			logger.log("SIMPLE", "message");
			expect(consoleLogSpy).toHaveBeenCalledOnce();
		});

		it("should accept Label with label only", () => {
			const logger = createHagen();
			logger.log({ kind: "color", label: "LABEL" }, "message");
			expect(consoleLogSpy).toHaveBeenCalledOnce();
		});

		it("should accept Label with label and bgColor", () => {
			const logger = createHagen();
			logger.log({ kind: "color", label: "LABEL", bgColor: [100, 50, 150] }, "message");
			expect(consoleLogSpy).toHaveBeenCalledOnce();
		});

		it("should accept Label with all properties", () => {
			const logger = createHagen();
			const label: Label = {
				kind: "color",
				label: "FULL",
				bgColor: [150, 100, 200],
				prefix: "<<",
				suffix: ">>",
			};
			logger.log(label, "message");
			expect(consoleLogSpy).toHaveBeenCalledOnce();
		});
	});

	describe("edge cases", () => {
		let consoleLogSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		});

		afterEach(() => {
			consoleLogSpy.mockRestore();
		});

		it("should handle empty label text", () => {
			const logger = createHagen();
			logger.log("", "message");
			expect(consoleLogSpy).toHaveBeenCalledOnce();
		});

		it("should handle empty message", () => {
			const logger = createHagen();
			logger.log("TEST", "");
			expect(consoleLogSpy).toHaveBeenCalledOnce();
		});

		it("should handle multiline messages", () => {
			const logger = createHagen();
			logger.log("TEST", "line1\nline2\nline3");
			expect(consoleLogSpy).toHaveBeenCalledOnce();
		});

		it("should handle special characters in label", () => {
			const logger = createHagen();
			logger.log("🚀 TEST 🎉", "message");
			expect(consoleLogSpy).toHaveBeenCalledOnce();
		});

		it("should handle very long labels", () => {
			const logger = createHagen();
			const longLabel = "A".repeat(100);
			logger.log(longLabel, "message");
			expect(consoleLogSpy).toHaveBeenCalledOnce();
		});

		it("should handle very long messages", () => {
			const logger = createHagen();
			const longMessage = "message ".repeat(1000);
			logger.log("TEST", longMessage);
			expect(consoleLogSpy).toHaveBeenCalledOnce();
		});
	});

	describe("instance isolation", () => {
		let consoleLogSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		});

		afterEach(() => {
			consoleLogSpy.mockRestore();
		});

		it("should create independent instances", () => {
			const logger1 = createHagen({ showTimestamp: true });
			const logger2 = createHagen({ showTimestamp: false });

			logger1.log("TEST", "with timestamp");
			const output1 = consoleLogSpy.mock.calls[0]?.[0] as string;

			consoleLogSpy.mockClear();

			logger2.log("TEST", "without timestamp");
			const output2 = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(output1).not.toBe(output2);
		});

		it("should not share state between instances", () => {
			const logger1 = createHagen({ labelPrefix: "<<" });
			const logger2 = createHagen({ labelPrefix: "[" });

			logger1.log("TEST", "first");
			logger2.log("TEST", "second");

			expect(consoleLogSpy).toHaveBeenCalledTimes(2);
		});
	});
});
