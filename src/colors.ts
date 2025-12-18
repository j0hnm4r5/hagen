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
		return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
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
	// Handle transparent background
	if (bgColor === null || bgColor === undefined) {
		// If fgColor is null, we want hidden text on transparent background (invisible)
		if (fgColor === null) {
			return (text: string) => {
				const colored = ansisInstance.hidden(text);
				return forceNoColor ? ansis.strip(colored) : colored;
			};
		}

		// If fgColor is provided, apply it
		if (fgColor) {
			let fg = parseColor(fgColor);
			if (paletteSize !== undefined) {
				fg = quantizeColor(fg, paletteSize);
			}
			return (text: string) => {
				const colored = ansisInstance.rgb(...fg)(text);
				return forceNoColor ? ansis.strip(colored) : colored;
			};
		}

		// Default: No formatting (transparent bg, default fg)
		return (text: string) => {
			const colored = text;
			return forceNoColor ? ansis.strip(colored) : colored;
		};
	}

	// Handle colored background
	let bg = parseColor(bgColor);
	if (paletteSize !== undefined) {
		bg = quantizeColor(bg, paletteSize);
	}

	// Handle foreground
	if (fgColor === null) {
		// Hidden text on colored background
		return (text: string) => {
			const colored = ansisInstance.bgRgb(...bg).hidden(text);
			return forceNoColor ? ansis.strip(colored) : colored;
		};
	}

	let fg: RGB;
	if (fgColor) {
		fg = parseColor(fgColor);
		if (paletteSize !== undefined) {
			fg = quantizeColor(fg, paletteSize);
		}
	} else {
		fg = getContrastingTextColor(bg);
	}

	return (text: string) => {
		const colored = ansisInstance.bgRgb(...bg).rgb(...fg)(text);
		// Strip colors if no-color mode is forced
		return forceNoColor ? ansis.strip(colored) : colored;
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
	// Generate a hash from the label
	let hash = 0;
	for (let i = 0; i < label.length; i++) {
		hash = ((hash << 5) - hash + label.charCodeAt(i)) | 0;
	}

	// Generate RGB from hash (use different bits for each channel)
	const r = hash & 0xff;
	const g = (hash >> 8) & 0xff;
	const b = (hash >> 16) & 0xff;

	return [r, g, b];
}
