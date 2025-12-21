import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock ansis using Proxy to handle chaining
const mockIsSupported = vi.fn();

const createMockAnsis = () => {
	const chain = (text: any) => `[ANSI]${text}[/ANSI]`;
	const proxy: any = new Proxy(chain, {
		get: (_target, property, receiver) => {
			if (property === "isSupported") {
				return () => {
					const value = mockIsSupported();
					return value;
				};
			}
			// Handle strip specifically
			if (property === "strip") return (t: string) => t.replaceAll(/\[ANSI\]|\[\/ANSI\]/g, "");
			// Return a function that returns the proxy itself for chaining
			return () => receiver;
		},
		apply: (_target, _thisArgument, arguments_) => {
			return `[ANSI]${arguments_[0]}[/ANSI]`;
		},
	});
	return proxy;
};

vi.mock("ansis", () => {
	const mock = createMockAnsis();
	return {
		Ansis: class {
			constructor() {
				return mock;
			}
			isSupported() {
				return mockIsSupported();
			}
		},
		default: mock,
	};
});

describe("Environment Variables Integration", () => {
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		vi.resetModules();
		mockIsSupported.mockReset();
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
		vi.resetModules();
	});

	// Helper to check if output has mocked ANSI codes
	const hasAnsiCodes = (text: string) => text.includes("[ANSI]");

	it("should enable color when Ansis reports supported", async () => {
		mockIsSupported.mockReturnValue(true);
		const { createHagen } = await import("../index.js");

		// Default config (enabled: undefined)
		const logger = createHagen();
		logger.log("TEST", "test message");

		const output = consoleLogSpy.mock.calls[0]?.[0] as string;
		expect(hasAnsiCodes(output)).toBe(true);
	});

	it("should disable color when Ansis reports unsupported", async () => {
		mockIsSupported.mockReturnValue(false);
		const { createHagen } = await import("../index.js");

		const logger = createHagen();
		logger.log("TEST", "test message");

		const output = consoleLogSpy.mock.calls[0]?.[0] as string;
		expect(hasAnsiCodes(output)).toBe(false);
	});

	it("should override detection with enabled: false", async () => {
		mockIsSupported.mockReturnValue(true); // Supported by env
		const { createHagen } = await import("../index.js");

		// Explicitly disabled
		const logger = createHagen({ colorOptions: { enabled: false } });
		logger.log("TEST", "test message");

		const output = consoleLogSpy.mock.calls[0]?.[0] as string;
		expect(hasAnsiCodes(output)).toBe(false);
	});

	it("should override detection with enabled: true", async () => {
		mockIsSupported.mockReturnValue(false); // Unsupported by env
		const { createHagen } = await import("../index.js");

		// Explicitly enabled
		const logger = createHagen({ colorOptions: { enabled: true } });
		logger.log("TEST", "test message");

		const output = consoleLogSpy.mock.calls[0]?.[0] as string;
		expect(hasAnsiCodes(output)).toBe(true);
	});
});
