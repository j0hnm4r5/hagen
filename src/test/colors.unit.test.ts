import { describe, expect, it } from "vitest";
import { getContrastingTextColor, getLuminance, parseColor, quantizeColor } from "../colors.js";

describe("Colors Logic", () => {
	describe("parseColor", () => {
		it("should pass through RGB tuples", () => {
			expect(parseColor([255, 0, 0])).toEqual([255, 0, 0]);
			expect(parseColor([0, 255, 0])).toEqual([0, 255, 0]);
		});

		it("should parse 6-digit hex strings", () => {
			expect(parseColor("#FF0000")).toEqual([255, 0, 0]);
			expect(parseColor("00FF00")).toEqual([0, 255, 0]);
			expect(parseColor("#0000FF")).toEqual([0, 0, 255]);
		});

		it("should parse 3-digit hex strings", () => {
			expect(parseColor("#F00")).toEqual([255, 0, 0]);
			expect(parseColor("0F0")).toEqual([0, 255, 0]);
			expect(parseColor("#00F")).toEqual([0, 0, 255]);
			expect(parseColor("#ABC")).toEqual([170, 187, 204]);
		});
	});

	describe("quantizeColor", () => {
		it("should not change color if palette size is undefined (logic handled by caller usually, but function assumes size)", () => {
			// Actually the function signature requires paletteSize.
			// If we pass a large palette size it should be precise.
			expect(quantizeColor([100, 150, 200], 16000000)).toEqual([100, 150, 200]);
		});

		it("should quantize to nearest step for small palette (size 8 -> 2 levels: 0, 255)", () => {
			// 2 levels: values snap to 0 or 255
			expect(quantizeColor([10, 10, 10], 8)).toEqual([0, 0, 0]);
			expect(quantizeColor([200, 200, 200], 8)).toEqual([255, 255, 255]);
			expect(quantizeColor([100, 10, 200], 8)).toEqual([0, 0, 255]); // 100 closest to 0 or 255? 127.5 is mid. 100->0? Wait.

			// 255 / (2-1) = 255 step.
			// 100 / 255 = 0.39 -> round to 0 -> 0. Correct.
			expect(quantizeColor([128, 128, 128], 8)).toEqual([255, 255, 255]); // 0.501 -> 1 -> 255
		});

		it("should quantize to 27 colors (3x3x3 -> 3 levels: 0, 128, 255)", () => {
			// 255 / 2 = 127.5 step.
			// Levels: 0, 128, 255 (approx)
			// Let's check logic: 255 / (3-1) = 127.5.
			// value 0 -> 0
			// value 127.5 -> 1 * 127.5 = 127.5 -> round to 128
			// value 255 -> 2 * 127.5 = 255

			expect(quantizeColor([0, 0, 0], 27)).toEqual([0, 0, 0]);
			expect(quantizeColor([120, 120, 120], 27)).toEqual([128, 128, 128]);
			expect(quantizeColor([255, 255, 255], 27)).toEqual([255, 255, 255]);
		});
	});

	describe("getLuminance", () => {
		it("should return correct luminance for primary colors", () => {
			expect(getLuminance([0, 0, 0])).toBe(0); // Black
			expect(getLuminance([255, 255, 255])).toBe(1); // White

			// Per WCAG formula approx values
			expect(getLuminance([255, 0, 0])).toBeCloseTo(0.2126, 4);
			expect(getLuminance([0, 255, 0])).toBeCloseTo(0.7152, 4);
			expect(getLuminance([0, 0, 255])).toBeCloseTo(0.0722, 4);
		});
	});

	describe("getContrastingTextColor", () => {
		it("should return white for dark backgrounds", () => {
			expect(getContrastingTextColor([0, 0, 0])).toEqual([255, 255, 255]); // Black bg -> White text

			// Dark Blue (0.0722) < 0.179 -> White
			expect(getContrastingTextColor([0, 0, 255])).toEqual([255, 255, 255]);
		});

		it("should return black for light backgrounds", () => {
			expect(getContrastingTextColor([255, 255, 255])).toEqual([0, 0, 0]); // White bg -> Black text
			expect(getContrastingTextColor([0, 255, 0])).toEqual([0, 0, 0]); // Green bg (0.71) -> Black text
			expect(getContrastingTextColor([255, 255, 0])).toEqual([0, 0, 0]); // Yellow bg -> Black text

			// Red (0.2126) > 0.179 -> Black (Technically high enough luminance for black text by this formula)
			expect(getContrastingTextColor([255, 0, 0])).toEqual([0, 0, 0]);
		});
	});
});
