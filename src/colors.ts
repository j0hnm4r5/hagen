/**
 * Color utilities for Hagen logger.
 * Handles color parsing, quantization, contrast calculation, and formatter creation.
 */

import ansis, { Ansis } from "ansis";
import type { AnsiFormatter, Color, RGB } from "./types";

// ========= COLOR PARSING =========

/**
 * Parses a color value (hex string or RGB tuple) into RGB tuple.
 * @internal
 */
export function parseColor(color: Color): RGB {
	if (Array.isArray(color)) {
		return color as RGB;
	}

	// Hex string - color is now narrowed to string type
	const hexString = color as string;
	let cleanHex = hexString.replace("#", "");

	// Expand 3-digit hex to 6-digit
	if (cleanHex.length === 3) {
		cleanHex = cleanHex
			.split("")
			.map((c) => c + c)
			.join("");
	}

	const r = Number.parseInt(cleanHex.slice(0, 2), 16);
	const g = Number.parseInt(cleanHex.slice(2, 4), 16);
	const b = Number.parseInt(cleanHex.slice(4, 6), 16);
	return [r, g, b] as const;
}

// ========= COLOR QUANTIZATION =========

/**
 * Quantizes an RGB color to a reduced palette size.
 *
 * Divides the 256 levels per channel into equal steps based on the cube root
 * of the palette size, then snaps each channel to the nearest step.
 *
 * @param rgb - Original RGB color
 * @param paletteSize - Number of colors in the target palette
 * @returns Quantized RGB color
 * @internal
 */
export function quantizeColor(rgb: RGB, paletteSize: number): RGB {
	// Calculate levels per channel (cube root since RGB is 3D)
	const levels = Math.max(2, Math.round(Math.cbrt(paletteSize)));
	const step = 255 / (levels - 1);

	const quantize = (value: number): number => {
		const index = Math.round(value / step);
		return Math.round(index * step);
	};

	return [quantize(rgb[0]), quantize(rgb[1]), quantize(rgb[2])] as const;
}

// ========= LUMINANCE & CONTRAST =========

/**
 * Calculates relative luminance of an RGB color.
 * Uses sRGB formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 * @internal
 */
export function getLuminance(rgb: RGB): number {
	const [r, g, b] = rgb.map((c) => {
		const sRGB = c / 255;
		return sRGB <= 0.039_28 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/**
 * Calculates optimal text color (black or white) for readability against a background.
 * Uses WCAG contrast ratio guidelines.
 * @internal
 */
export function getContrastingTextColor(bgColor: RGB): RGB {
	const luminance = getLuminance(bgColor);
	// Use white text on dark backgrounds, black on light
	return luminance > 0.179 ? [0, 0, 0] : [255, 255, 255];
}

// ========= COLOR FORMATTER CREATION =========

/**
 * Creates a color formatter function from a background color.
 * Text color is automatically calculated for optimal contrast AFTER quantization,
 * unless a custom fgColor is provided.
 * @internal
 */
export function createAnsiFormatter({
	bgColor,
	fgColor,
	paletteSize,
	ansisInstance = ansis,
	forceNoColor = false,
}: {
	bgColor: Color | undefined;
	fgColor?: Color | undefined;
	paletteSize?: number | undefined;
	ansisInstance?: Ansis | undefined;
	forceNoColor?: boolean | undefined;
}): AnsiFormatter {
	// Helper to apply named colors if they exist on the instance
	const applyNamed = (text: string, color: Color, isBg: boolean): string | undefined => {
		if (typeof color !== "string" || color.startsWith("#")) return undefined;

		const inst = ansisInstance as unknown as Record<string, (t: string) => string>;
		const method = inst[color];

		if (typeof method === "function") return method(text);

		// If it's a background color, also try bg[Color]
		if (isBg) {
			const bgName = "bg" + color.charAt(0).toUpperCase() + color.slice(1);
			const bgMethod = inst[bgName];
			if (typeof bgMethod === "function") return bgMethod(text);
		}
		return undefined;
	};

	// Handle transparent background
	if (bgColor === null || bgColor === undefined) {
		// If fgColor is null, we want hidden text on transparent background (invisible)
		if (fgColor === null) {
			return (text: string) => {
				const colored = ansisInstance.hidden(text);
				return forceNoColor ? ansisInstance.strip(colored) : colored;
			};
		}

		// If fgColor is provided, apply it
		if (fgColor) {
			return (text: string) => {
				let colored = applyNamed(text, fgColor, false);
				if (colored === undefined) {
					let fg = parseColor(fgColor);
					if (paletteSize !== undefined) {
						fg = quantizeColor(fg, paletteSize);
					}
					colored = ansisInstance.rgb(...fg)(text);
				}
				return forceNoColor ? ansisInstance.strip(colored) : colored;
			};
		}

		// Default: No formatting (transparent bg, default fg)
		return (text: string) => {
			const colored = text;
			return forceNoColor ? ansisInstance.strip(colored) : colored;
		};
	}

	// Handle foreground invisibility on colored background
	if (fgColor === null) {
		return (text: string) => {
			let colored = applyNamed(text, bgColor, true);
			if (colored === undefined) {
				const rgb = parseColor(bgColor);
				const qBg = paletteSize === undefined ? rgb : quantizeColor(rgb, paletteSize);
				colored = ansisInstance.bgRgb(...qBg).hidden(text);
			} else {
				colored = ansisInstance.hidden(ansisInstance.strip(colored));
			}
			return forceNoColor ? ansisInstance.strip(colored) : colored;
		};
	}

	// Handle named background color
	const namedBg = typeof bgColor === "string" && !bgColor.startsWith("#") ? bgColor : undefined;
	if (namedBg) {
		return (text: string) => {
			let res = text;
			
			// Apply named foreground if present
			const namedFg =
				fgColor && typeof fgColor === "string" && !fgColor.startsWith("#") ? fgColor : undefined;
			const inst = ansisInstance as unknown as Record<string, (t: string) => string>;

			if (namedFg && typeof inst[namedFg] === "function") {
				res = inst[namedFg](res);
			} else if (fgColor) {
				const fgRgb = parseColor(fgColor);
				const qFg = paletteSize === undefined ? fgRgb : quantizeColor(fgRgb, paletteSize);
				res = ansisInstance.rgb(...qFg)(res);
			}

			// Apply named background
			const bgName = namedBg.startsWith("bg")
				? namedBg
				: "bg" + namedBg.charAt(0).toUpperCase() + namedBg.slice(1);
			const bgMethod = inst[bgName];
			if (typeof bgMethod === "function") {
				res = bgMethod(res);
			}

			return forceNoColor ? ansisInstance.strip(res) : res;
		};
	}

	// Fallback to RGB logic for background
	const rgbBg = parseColor(bgColor);
	const qBg = paletteSize === undefined ? rgbBg : quantizeColor(rgbBg, paletteSize);

	if (fgColor) {
		const namedFg = typeof fgColor === "string" && !fgColor.startsWith("#") ? fgColor : undefined;
		if (namedFg) {
			const inst = ansisInstance as unknown as Record<string, (t: string) => string>;
			if (typeof inst[namedFg] === "function") {
				return (text: string) => {
					let res = inst[namedFg]!(text);
					res = ansisInstance.bgRgb(...qBg)(res);
					return forceNoColor ? ansisInstance.strip(res) : res;
				};
			}
		}

		// Regular RGB foreground
		const rgbFg = parseColor(fgColor);
		const qFg = paletteSize === undefined ? rgbFg : quantizeColor(rgbFg, paletteSize);
		return (text: string) => {
			const colored = ansisInstance.bgRgb(...qBg).rgb(...qFg)(text);
			return forceNoColor ? ansisInstance.strip(colored) : colored;
		};
	}

	// Auto-contrasting foreground
	const qFg = getContrastingTextColor(qBg);
	return (text: string) => {
		const colored = ansisInstance.bgRgb(...qBg).rgb(...qFg)(text);
		return forceNoColor ? ansisInstance.strip(colored) : colored;
	};
}

/**
 * Generates an RGB color from a label string.
 * Uses a hash function to deterministically map the label to a color.
 *
 * @param label - The label to generate a color for
 * @returns The generated RGB color
 * @internal
 */
export function getColorFromLabel(label: string): RGB {
	// FNV-1a Hash
	let hash = 2_166_136_261;
	for (let index = 0; index < label.length; index++) {
		hash ^= label.charCodeAt(index);
		hash = Math.imul(hash, 16_777_619);
	}

	// Final mixing
	hash = Math.imul(hash ^ (hash >>> 16), 2_246_822_507);
	hash = Math.imul(hash ^ (hash >>> 13), 3_266_489_909);
	hash ^= hash >>> 16;

	// Generate RGB from hash
	const r = (hash & 0xFF_00_00) >>> 16;
	const g = (hash & 0x00_FF_00) >>> 8;
	const b = hash & 0x00_00_FF;

	return [r, g, b];
}
