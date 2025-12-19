import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("Prefix Spacing Regression", () => {
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;
	let consoleInfoSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
		consoleInfoSpy.mockRestore();
	});

	it("should add a space after the default prefix (e.g. 'i' for info)", async () => {
		const { createHagen } = await import("../index");
		const logger = createHagen({ enableColor: false, layout: ">>%l<<" });

		logger.info("TEST", "message");

		const label = consoleInfoSpy.mock.calls[0]?.[0] as string;
		// After fix: ">> i TEST <<" (padding 1 + prefix space)
		// Default padding for label is 1.
		// Prefix "i" -> "i "
		// Label "TEST"
		// Padded: " i TEST "
		// Layout: ">>" + " i TEST " + "<<"
		expect(label).toContain("i TEST");
	});

	it("should add a space after a custom prefix", async () => {
		const { createHagen } = await import("../index");
		const logger = createHagen({ enableColor: false, segmentStyles: { label: { padding: 0 } } });

		logger.log(
			{
				kind: "color",
				label: "LABEL",
				prefix: "PREFIX",
			},
			"msg"
		);

		const label = consoleLogSpy.mock.calls[0]?.[0] as string;
		// Should be "PREFIX LABEL"
		expect(label).toContain("PREFIX LABEL");
	});

	it("should not add a space if prefix is empty", async () => {
		const { createHagen } = await import("../index");
		const logger = createHagen({ enableColor: false, segmentStyles: { label: { padding: 0 } } });

		logger.log(
			{
				kind: "color",
				label: "LABEL",
				prefix: "",
			},
			"msg"
		);

		const label = consoleLogSpy.mock.calls[0]?.[0] as string;
		// With padding 0 and empty prefix, should be just "LABEL" inside brackets/layout
		// But here we just check it doesn't have leading space
		expect(label).not.toContain(" LABEL");
		expect(label).toContain("LABEL");
	});
});
