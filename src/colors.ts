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
		cleanHex = [...cleanHex].map((c) => c + c).join("");
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
	return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
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

const ANSI_COLORS = new Set([
	"black",
	"red",
	"green",
	"yellow",
	"blue",
	"magenta",
	"cyan",
	"white",
	"gray",
	"redBright",
	"greenBright",
	"yellowBright",
	"blueBright",
	"magentaBright",
	"cyanBright",
	"whiteBright",
	"bgBlack",
	"bgRed",
	"bgGreen",
	"bgYellow",
	"bgBlue",
	"bgMagenta",
	"bgCyan",
	"bgWhite",
	"bgGray",
	"bgRedBright",
	"bgGreenBright",
	"bgYellowBright",
	"bgBlueBright",
	"bgMagentaBright",
	"bgCyanBright",
	"bgWhiteBright",
	// Styles
	"reset",
	"inverse",
	"hidden",
	"visible",
	"bold",
	"dim",
	"italic",
	"underline",
	"strikethrough",
]);

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
	// 1. Resolve Background Formatter
	let backgroundFormatter: AnsiFormatter | undefined;
	let computedBgRgb: RGB | undefined;

	if (bgColor !== null && bgColor !== undefined) {
		if (typeof bgColor === "string" && !bgColor.startsWith("#")) {
			// Named Background
			const bgName = bgColor.startsWith("bg")
				? bgColor
				: "bg" + bgColor.charAt(0).toUpperCase() + bgColor.slice(1);

			if (ANSI_COLORS.has(bgName)) {
				const method = (ansisInstance as unknown as Record<string, unknown>)[bgName];
				if (typeof method === "function") {
					backgroundFormatter = method as AnsiFormatter;
				}
			}
		}

		// Fallback to RGB if not named or named lookup failed
		if (!backgroundFormatter) {
			const rgb = parseColor(bgColor);
			computedBgRgb = paletteSize === undefined ? rgb : quantizeColor(rgb, paletteSize);
			backgroundFormatter = ansisInstance.bgRgb(...computedBgRgb);
		}
	}

	// 2. Resolve Foreground Formatter
	let foregroundFormatter: AnsiFormatter | undefined;

	if (fgColor !== null && fgColor !== undefined) {
		if (typeof fgColor === "string" && !fgColor.startsWith("#") && ANSI_COLORS.has(fgColor)) {
			// Named Foreground
			const method = (ansisInstance as unknown as Record<string, unknown>)[fgColor];
			if (typeof method === "function") {
				foregroundFormatter = method as AnsiFormatter;
			}
		} else {
			// RGB Foreground
			const rgb = parseColor(fgColor);
			const qFg = paletteSize === undefined ? rgb : quantizeColor(rgb, paletteSize);
			foregroundFormatter = ansisInstance.rgb(...qFg);
		}
	} else if (fgColor === null) {
		// Explicitly hidden text
		foregroundFormatter = ansisInstance.hidden;
	} else if (computedBgRgb) {
		// Auto-contrast foreground (only if BG was RGB)
		const qFg = getContrastingTextColor(computedBgRgb);
		foregroundFormatter = ansisInstance.rgb(...qFg);
	}

	// 3. Return composed formatter
	return (text: string) => {
		let result = text;
		if (foregroundFormatter) result = foregroundFormatter(result);
		if (backgroundFormatter) result = backgroundFormatter(result);
		return forceNoColor ? ansisInstance.strip(result) : result;
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
		hash ^= label.codePointAt(index) ?? 0;
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