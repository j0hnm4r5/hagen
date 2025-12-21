import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultConfig } from "../config.js";
import { parseTemplateLayout, prepareSegment, type SegmentContext } from "../segments.js";
import type { LayoutItem } from "../types.js";

describe("Segments Logic", () => {
	beforeEach(() => {
		vi.stubEnv("CI", "");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
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

		it("should keep unknown tokens as literal strings", () => {
			const items = parseTemplateLayout("%t%unknown%l");
			expect(items).toHaveLength(3);
			expect(items[1]).toBe("%unknown");
		});
	});

	describe("prepareSegment", () => {
		const mockContext: SegmentContext = {
			label: "TEST",
			data: ["message"],
			config: { ...defaultConfig, colorOptions: { enabled: true } } as any,
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
			expect(prepared.fgColor).toBeUndefined(); // Inherits normal text color by default
		});

		it("should prepare message segment", () => {
			const item: LayoutItem = { type: "message" };
			const prepared = prepareSegment(item, mockContext);

			expect(prepared.text).toBe("");
		});

		it("should prepare literal string", () => {
			const item: LayoutItem = " | ";
			const prepared = prepareSegment(item, mockContext);

			expect(prepared.text).toBe(" | ");
			expect(prepared.bgColor).toBeUndefined(); // Transparent by default
		});

		it("should prepare powerline symbol as literal string", () => {
			const item: LayoutItem = "\uE0B0"; // Left hard divider
			const prepared = prepareSegment(item, mockContext);

			expect(prepared.text).toBe("\uE0B0");
		});
	});
});
