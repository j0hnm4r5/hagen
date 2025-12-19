import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("CLI Environment Variables", () => {
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		vi.resetModules();
		vi.unstubAllEnvs();
		// Ensure CI doesn't interfere, as it often forces colors
		vi.stubEnv("CI", "false");
		// Clear any existing color envs to ensure clean state
		vi.stubEnv("NO_COLOR", "");
		vi.stubEnv("FORCE_COLOR", "");
		vi.stubEnv("COLORTERM", "");
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	// Helper to check if output has ANSI codes
	const hasAnsiCodes = (text: string) => /\u001B\[[\d;]+m/.test(text);

	describe("NO_COLOR", () => {
		it("should disable colors when NO_COLOR is set to '1'", async () => {
			vi.stubEnv("NO_COLOR", "1");

			const { createHagen } = await import("../index.js");

			const logger = createHagen(); // default config (auto detect)
			logger.log("TEST", "test message");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(hasAnsiCodes(output)).toBe(false);
		});

		it("should disable colors when NO_COLOR is set to 'true'", async () => {
			vi.stubEnv("NO_COLOR", "true");

			const { createHagen } = await import("../index.js");
			const logger = createHagen();
			logger.log("TEST", "test message");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(hasAnsiCodes(output)).toBe(false);
		});

		it("should allow colors when NO_COLOR is empty string", async () => {
			vi.stubEnv("FORCE_COLOR", "1");
			vi.stubEnv("NO_COLOR", "");

			const { createHagen } = await import("../index.js");
			const logger = createHagen();
			logger.log("TEST", "test message");

			const output = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(hasAnsiCodes(output)).toBe(true);
		});
	});

	describe("FORCE_COLOR", () => {
		it("should disable colors when FORCE_COLOR is '0'", async () => {
			vi.stubEnv("FORCE_COLOR", "0");
			const { createHagen } = await import("../index.js");
			const logger = createHagen();
			logger.log("TEST", "test message");
			const output = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(hasAnsiCodes(output)).toBe(false);
		});

		it("should disable colors when FORCE_COLOR is 'false'", async () => {
			vi.stubEnv("FORCE_COLOR", "false");
			const { createHagen } = await import("../index.js");
			const logger = createHagen();
			logger.log("TEST", "test message");
			const output = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(hasAnsiCodes(output)).toBe(false);
		});

		it("should enable colors when FORCE_COLOR is '1'", async () => {
			vi.stubEnv("FORCE_COLOR", "1");

			const { createHagen } = await import("../index.js");
			const logger = createHagen();
			logger.log("TEST", "test message");
			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			expect(hasAnsiCodes(output)).toBe(true);
		});

		it("should enable colors when FORCE_COLOR is '2'", async () => {
			vi.stubEnv("FORCE_COLOR", "2");
			const { createHagen } = await import("../index.js");
			const logger = createHagen();
			logger.log("TEST", "test message");
			const output = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(hasAnsiCodes(output)).toBe(true);
		});

		it("should enable colors when FORCE_COLOR is '3'", async () => {
			vi.stubEnv("FORCE_COLOR", "3");
			const { createHagen } = await import("../index.js");
			const logger = createHagen();
			logger.log("TEST", "test message");
			const output = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(hasAnsiCodes(output)).toBe(true);
		});

		it("should enable colors when FORCE_COLOR is 'true'", async () => {
			vi.stubEnv("FORCE_COLOR", "true");
			const { createHagen } = await import("../index.js");
			const logger = createHagen();
			logger.log("TEST", "test message");
			const output = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(hasAnsiCodes(output)).toBe(true);
		});

		it("should enable colors when FORCE_COLOR is empty string (if set)", async () => {
			vi.stubEnv("FORCE_COLOR", "");
			const { createHagen } = await import("../index.js");
			const logger = createHagen();
			logger.log("TEST", "test message");
			const output = consoleLogSpy.mock.calls[0]?.[0] as string;

			// Empty string should enable auto-detection (which usually enables colors in this test setup)
			expect(hasAnsiCodes(output)).toBe(true);
		});
	});

	describe("COLORTERM", () => {
		it("should enable colors when COLORTERM is 'truecolor'", async () => {
			vi.stubEnv("FORCE_COLOR", ""); // Ensure FORCE_COLOR doesn't interfere
			vi.stubEnv("COLORTERM", "truecolor");

			const { createHagen } = await import("../index.js");
			const logger = createHagen();
			logger.log("TEST", "test message");
			const output = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(hasAnsiCodes(output)).toBe(true);
		});

		it("should enable colors when COLORTERM is '24bit'", async () => {
			vi.stubEnv("FORCE_COLOR", "");
			vi.stubEnv("COLORTERM", "24bit");

			const { createHagen } = await import("../index.js");
			const logger = createHagen();
			logger.log("TEST", "test message");
			const output = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(hasAnsiCodes(output)).toBe(true);
		});
	});

	describe("Precedence", () => {
		it("should let NO_COLOR disable colors even if FORCE_COLOR is set", async () => {
			vi.stubEnv("FORCE_COLOR", "1");
			vi.stubEnv("NO_COLOR", "1");

			const { createHagen } = await import("../index.js");
			const logger = createHagen();
			logger.log("TEST", "test message");
			const output = consoleLogSpy.mock.calls[0]?.[0] as string;
			expect(hasAnsiCodes(output)).toBe(false);
		});
	});
});
