import { describe, expect, it } from "vitest";
import {
	getColorFromLabel,
	getContrastingTextColor,
	getLuminance,
	parseColor,
	quantizeColor,
} from "../colors.js";

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
			expect(quantizeColor([100, 150, 200], 16_000_000)).toEqual([100, 150, 200]);
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
	describe("getColorFromLabel", () => {
		it("should return the same color for the same label (deterministic)", () => {
			const color1 = getColorFromLabel("Test Label");
			const color2 = getColorFromLabel("Test Label");
			expect(color1).toEqual(color2);
		});

		it("should produce distinct colors for similar labels (hashing quality)", () => {
			// These labels previously produced nearly identical colors (differing only by 1 in Red channel)
			// with simple additive hashing. FNV-1a should spread them out widely.
			const color0 = getColorFromLabel("Level 0");
			const color1 = getColorFromLabel("Level 1");
			const color2 = getColorFromLabel("Level 2");

			// Check that they are not equal
			expect(color0).not.toEqual(color1);
			expect(color1).not.toEqual(color2);
			expect(color0).not.toEqual(color2);

			// Check that they are significantly different in at least one channel
			// Calculating Euclidean distance would be precise, but simple channel diff is enough for this test
			const diff01 =
				Math.abs(color0[0] - color1[0]) +
				Math.abs(color0[1] - color1[1]) +
				Math.abs(color0[2] - color1[2]);

			const diff12 =
				Math.abs(color1[0] - color2[0]) +
				Math.abs(color1[1] - color2[1]) +
				Math.abs(color1[2] - color2[2]);

			// With additive hash, diff was 1. With FNV-1a, it should be much larger (usually > 50 or 100)
			expect(diff01).toBeGreaterThan(20);
			expect(diff12).toBeGreaterThan(20);
		});
	});
});
