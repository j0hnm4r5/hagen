import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultConfig } from "../config.js";
import {
	getPowerlineDirection,
	getSeparatorGlyph,
	parseTemplateLayout,
	prepareSegment,
	type SegmentContext,
} from "../segments.js";
import type { LayoutItem } from "../types.js";

describe("Segments Logic", () => {
	beforeEach(() => {
		vi.stubEnv("CI", "");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	describe("getSeparatorGlyph", () => {
		it("should return literal strings as-is", () => {
			expect(getSeparatorGlyph("|")).toBe("|");
			expect(getSeparatorGlyph(" - ")).toBe(" - ");
			expect(getSeparatorGlyph("")).toBe("");
		});

		it("should resolve powerline presets", () => {
			expect(getSeparatorGlyph("%pl")).toBe("\ue0b0");
			expect(getSeparatorGlyph("%powerline")).toBe("\ue0b0");
			expect(getSeparatorGlyph("%pl-left")).toBe("\ue0b0");
			expect(getSeparatorGlyph("%pl-right")).toBe("\ue0b2");
			expect(getSeparatorGlyph("%plr")).toBe("\ue0b2");
		});

		it("should resolve rounded powerline presets", () => {
			expect(getSeparatorGlyph("%pllo")).toBe("\ue0b4");
			expect(getSeparatorGlyph("%pl-left-rounded")).toBe("\ue0b4");
			expect(getSeparatorGlyph("%plro")).toBe("\ue0b6");
			expect(getSeparatorGlyph("%pl-right-rounded")).toBe("\ue0b6");
		});

		it("should resolve arrow presets", () => {
			expect(getSeparatorGlyph("%->")).toBe("→");
			expect(getSeparatorGlyph("%arrow")).toBe("→");
			expect(getSeparatorGlyph("%>>")).toBe("»");
			expect(getSeparatorGlyph("%arrow-double")).toBe("»");
		});

		it("should treat unknown presets as literals", () => {
			expect(getSeparatorGlyph("%unknown")).toBe("%unknown");
			expect(getSeparatorGlyph("%foo")).toBe("%foo");
		});
	});

	describe("getPowerlineDirection", () => {
		it("should identify left-pointing separators", () => {
			expect(getPowerlineDirection("%pl")).toBe("left");
			expect(getPowerlineDirection("%pl-left")).toBe("left");
			expect(getPowerlineDirection("%pllo")).toBe("left");
		});

		it("should identify right-pointing separators", () => {
			expect(getPowerlineDirection("%plr")).toBe("right");
			expect(getPowerlineDirection("%pl-right")).toBe("right");
			expect(getPowerlineDirection("%plro")).toBe("right");
		});

		it("should return undefined for non-directional separators", () => {
			expect(getPowerlineDirection("%arrow")).toBeUndefined();
			expect(getPowerlineDirection("|")).toBeUndefined();
			expect(getPowerlineDirection("%unknown")).toBeUndefined();
		});
	});

	describe("parseTemplateLayout", () => {
		it("should parse standard tokens", () => {
			const items = parseTemplateLayout("%t %l %m");
			expect(items).toHaveLength(5);

			// %t
			expect(items[0]).toEqual(expect.objectContaining({ type: "timestamp" }));
			// space
			expect(items[1]).toBe(" ");
			// %l
			expect(items[2]).toEqual(expect.objectContaining({ type: "label" }));
			// space
			expect(items[3]).toBe(" ");
			// %m
			expect(items[4]).toEqual(expect.objectContaining({ type: "message" }));
		});

		it("should parse powerline separators", () => {
			const items = parseTemplateLayout("%pl");
			expect(items).toHaveLength(1);
			expect(items[0]).toBe("%pl");
		});

		it("should parse complex layouts", () => {
			const items = parseTemplateLayout("[%t] >>%l<<");
			expect(items).toHaveLength(5);

			// [%t]
			expect(items[0]).toBe("[");
			expect(items[1]).toEqual(expect.objectContaining({ type: "timestamp" }));
			expect(items[2]).toBe("] >>");

			// %l
			expect(items[3]).toEqual(expect.objectContaining({ type: "label" }));

			// <<
			expect(items[4]).toBe("<<");
		});

		it("should handle mixed presets and literals", () => {
			const items = parseTemplateLayout("%t%pl%l");
			expect(items).toHaveLength(3);
			expect(items[1]).toBe("%pl");
		});
	});

	describe("prepareSegment", () => {
		const mockContext: SegmentContext = {
			label: "TEST",
			data: ["message"],
			config: { ...defaultConfig, enableColor: true } as any,
			segmentIndex: 0,
			totalSegments: 1,
			labelIndex: 0,
			incrementLabelIndex: () => {},
		};

		it("should prepare basic label segment", () => {
			const item: LayoutItem = { type: "label" };
			const prepared = prepareSegment(item, mockContext);

			expect(prepared.text).toBe("TEST");
			expect(prepared.padding).toBe(1); // Default padding
			expect(prepared.bgColor).toBeDefined(); // Auto-colored
		});

		it("should prepare timestamp segment", () => {
			const item: LayoutItem = { type: "timestamp" };
			const prepared = prepareSegment(item, mockContext);

			expect(prepared.text).toMatch(/\d{4}-\d{2}-\d{2}T/);
			expect(prepared.fgColor).toBe("gray");
		});

		it("should prepare message segment", () => {
			const item: LayoutItem = { type: "message" };
			const prepared = prepareSegment(item, mockContext);

			expect(prepared.text).toBe("");
		});

		it("should prepare literal separator", () => {
			const item: LayoutItem = { type: "separator", content: " | " };
			const prepared = prepareSegment(item, mockContext);

			expect(prepared.text).toBe(" | ");
			expect(prepared.bgColor).toBeUndefined(); // Transparent by default
		});

		it("should prepare powerline separator", () => {
			const item: LayoutItem = { type: "separator", preset: "%pl" };
			const prepared = prepareSegment(item, mockContext);

			expect(prepared.text).toBe("\ue0b0");
		});
	});
});
