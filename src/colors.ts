/**
 * Color utilities for Hagen logger.
 * Handles color parsing, quantization, contrast calculation, and formatter creation.
 */

import ansis from "ansis";
import type { Color, ColorFormatter, RGB } from "./types";

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
	const cleanHex = hexString.replace("#", "");
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
export function createColorFormatter(
	bgColor: Color,
	fgColor?: Color,
	paletteSize?: number
): ColorFormatter {
	let bg = parseColor(bgColor);

	// Apply quantization if palette size is specified
	if (paletteSize !== undefined) {
		bg = quantizeColor(bg, paletteSize);
	}

	// Use custom fg color if provided, otherwise calculate for contrast
	let fg: RGB;
	if (fgColor !== undefined) {
		fg = parseColor(fgColor);
		if (paletteSize !== undefined) {
			fg = quantizeColor(fg, paletteSize);
		}
	} else {
		fg = getContrastingTextColor(bg);
	}

	return (text: string) => ansis.bgRgb(bg[0], bg[1], bg[2]).rgb(fg[0], fg[1], fg[2])(text);
}

// ========= RESERVED COLORS =========

/** Reserved colors for log levels with explicit bg and fg */
export const RESERVED_COLORS = {
	INFO: { bg: [65, 105, 225] as const, fg: [255, 255, 255] as const }, // Royal Blue, white text
	SUCCESS: { bg: [34, 139, 34] as const, fg: [255, 255, 255] as const }, // Forest Green, white text
	WARN: { bg: [255, 165, 0] as const, fg: [0, 0, 0] as const }, // Orange, black text
	ERROR: { bg: [220, 20, 60] as const, fg: [255, 255, 255] as const }, // Crimson, white text
} as const;

// ========= COLOR CACHE =========

/** Color cache for performance - stores generated formatters by label+paletteSize */
const colorCache = new Map<string, ColorFormatter>();

/**
 * Clears the color cache.
 *
 * Hagen caches color assignments for performance. Call this function to reset
 * the cache if you want labels to potentially receive different colors, or for
 * memory management in long-running applications with many unique labels.
 *
 * @example
 * ```typescript
 * import { clearColorCache } from "hagen";
 *
 * // Clear cache after processing batch of logs
 * clearColorCache();
 * ```
 */
export function clearColorCache(): void {
	colorCache.clear();
}

/**
 * Generates a color formatter based on a hash of the label text.
 * Uses caching for performance - identical labels always get the same color.
 * Color is generated from the hash and quantized if paletteSize is specified.
 *
 * @param label - The label text to hash
 * @param paletteSize - Optional palette size for quantization
 * @returns A ColorFormatter with the generated color
 *
 * @internal
 */
export function calculateLabelColor(label: string, paletteSize?: number): ColorFormatter {
	const cacheKey = `${label}:${paletteSize ?? "full"}`;
	if (colorCache.has(cacheKey)) {
		return colorCache.get(cacheKey)!;
	}

	// Generate a hash from the label
	const hash = [...label].reduce((acc, char) => {
		return ((acc << 5) - acc + char.codePointAt(0)!) | 0;
	}, 0);

	// Generate RGB from hash (use different bits for each channel)
	const r = Math.abs(hash) % 256;
	const g = Math.abs(hash >> 8) % 256;
	const b = Math.abs(hash >> 16) % 256;

	const color = createColorFormatter([r, g, b], undefined, paletteSize);
	colorCache.set(cacheKey, color);
	return color;
}

/**
 * Generates color formatters for reserved log level colors.
 * @internal
 */
export function generateReservedColors(paletteSize?: number) {
	const createReserved = (color: { bg: RGB; fg: RGB }) => {
		let bg = color.bg;
		let fg = color.fg;
		if (paletteSize !== undefined) {
			bg = quantizeColor(bg, paletteSize);
			fg = quantizeColor(fg, paletteSize);
		}
		// Create background formatter
		const bgFormatter = ansis.bgRgb(bg[0], bg[1], bg[2]);

		// Create foreground formatter - use pure black/white for contrast
		let fgFormatter;
		if (fg[0] === 0 && fg[1] === 0 && fg[2] === 0) {
			// Pure black - use ansis.black for consistent black text
			fgFormatter = ansis.black;
		} else if (fg[0] === 255 && fg[1] === 255 && fg[2] === 255) {
			// Pure white - use ansis.whiteBright for consistent white text
			fgFormatter = ansis.whiteBright;
		} else {
			// Custom color - use RGB
			fgFormatter = ansis.rgb(fg[0], fg[1], fg[2]);
		}

		return (text: string) => bgFormatter(fgFormatter(text));
	};

	return {
		INFO: createReserved(RESERVED_COLORS.INFO),
		SUCCESS: createReserved(RESERVED_COLORS.SUCCESS),
		WARN: createReserved(RESERVED_COLORS.WARN),
		ERROR: createReserved(RESERVED_COLORS.ERROR),
	};
}
