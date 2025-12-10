/**
 * A colorful logger for JS in Node and in the Browser
 *
 * Named after Hagen the colorful Lumberjack from Synthie Forest
 * https://vimeo.com/90995716
 */

import { Chalk, type ChalkInstance } from "chalk";
import { isCI } from "std-env";
import { defaultTheme, getTheme } from "./themes.js";

// ========= TYPES =========

/**
 * Color mode for terminal output.
 *
 * - `'ansi16'`: Basic 16-color ANSI mode (colors 0-15). Colors are controlled by the user's
 *   terminal theme and may vary significantly. Cannot guarantee contrast or specific appearance.
 * - `'ansi256'`: 256-color ANSI mode. Colors 0-15 are theme-dependent, colors 16-231 form a
 *   standardized 6×6×6 RGB cube, colors 232-255 are grayscale. More consistent than ansi16
 *   but still affected by terminal configuration.
 * - `'truecolor'`: True color mode with 16 million colors (24-bit RGB). Provides exact color
 *   values and guaranteed contrast ratios. **Recommended for accessibility and WCAG compliance.**
 *
 * @see {@link https://gist.github.com/sindresorhus/bed863fb8bedf023b833c88c322e44f9} for ANSI color reference
 *
 * **Note:** When using ANSI modes (ansi16/ansi256), colors depend on the user's terminal theme.
 * Hagen provides carefully chosen defaults, but contrast may vary. Use `'truecolor'` mode for
 * guaranteed readability and accessibility compliance.
 */
export type ColorMode = "ansi16" | "ansi256" | "truecolor";

/**
 * Color definition for a single label color across different color modes.
 *
 * Each color definition provides background and foreground color specifications for all three
 * color modes. ANSI modes use predetermined color pairs to ensure reasonable contrast across
 * common terminal themes. True color mode uses hex values with automatic luminance-based
 * text color selection for guaranteed contrast.
 *
 * **ANSI Mode Assumptions:**
 * - ANSI-16 codes (30-37, 40-47, 90-97, 100-107) assume standard terminal color mappings
 * - ANSI-256 codes assume the standard 256-color palette (6×6×6 RGB cube + grayscale)
 * - Actual rendered colors depend on user's terminal theme and cannot be controlled
 * - Pre-defined fg/bg pairs are chosen to work well with common terminal themes
 *
 * **True Color Mode:**
 * - Hex colors (e.g., "#FF0000") render exactly as specified
 * - Text color (fg) is automatically calculated based on background luminance
 * - Ensures WCAG AA contrast compliance (4.5:1 minimum for normal text)
 *
 * @example
 * ```typescript
 * const blueColor: ColorDefinition = {
 *   ansi16: { bg: 44, fg: 97 },      // Bright blue bg, bright white fg
 *   ansi256: { bg: 33, fg: 231 },    // Blue bg, white fg
 *   truecolor: { bg: "#4169E1", fg: "#FFFFFF" }  // Royal blue bg, white fg
 * };
 * ```
 */
export interface ColorDefinition {
	/**
	 * ANSI-16 color codes (basic 16 colors).
	 * - bg: Background color code (40-47 for normal, 100-107 for bright)
	 * - fg: Foreground/text color code (30-37 for normal, 90-97 for bright)
	 *
	 * **Warning:** These colors are controlled by the user's terminal theme.
	 * The actual RGB values are unknowable and may have poor contrast.
	 */
	ansi16: { bg: number; fg: number };

	/**
	 * ANSI-256 color codes (256 colors: 16 basic + 216 RGB cube + 24 grayscale).
	 * - bg: Background color index (0-255)
	 * - fg: Foreground/text color index (0-255)
	 *
	 * Colors 0-15 are theme-dependent. Colors 16-231 form a standardized 6×6×6 RGB cube.
	 * Colors 232-255 are a 24-step grayscale ramp.
	 *
	 * **Note:** While more consistent than ansi16, contrast still depends on terminal settings.
	 */
	ansi256: { bg: number; fg: number };

	/**
	 * True color hex values (24-bit RGB).
	 * - bg: Background color (e.g., "#FF0000")
	 * - fg: Foreground/text color (e.g., "#FFFFFF")
	 *
	 * These colors render exactly as specified. Text color should be chosen to provide
	 * adequate contrast with the background (WCAG AA: 4.5:1 for normal text, 3:1 for bold).
	 */
	truecolor: { bg: string; fg: string };
}

/**
 * Complete theme definition with colors for all log levels.
 *
 * A theme provides color definitions for both reserved log levels (info, warn, error, success)
 * and the normal color palette used for automatic label coloring. Each color is defined for
 * all three color modes (ansi16, ansi256, truecolor).
 *
 * **Creating Custom Themes:**
 * 1. Define ColorDefinitions for all 10 colors (4 reserved + 6 normal)
 * 2. Test in all three color modes across different terminal themes
 * 3. Verify contrast ratios in true color mode (WCAG AA recommended)
 * 4. Document any known issues with specific terminal themes
 *
 * @example
 * ```typescript
 * const myTheme: Theme = {
 *   name: "my-theme",
 *   description: "A custom color theme",
 *   reserved: {
 *     WARN: { ... },
 *     ERROR: { ... },
 *     INFO: { ... },
 *     SUCCESS: { ... }
 *   },
 *   normal: [
 *     { ... }, // Color 0
 *     { ... }, // Color 1
 *     { ... }, // Color 2
 *     { ... }, // Color 3
 *     { ... }, // Color 4
 *     { ... }  // Color 5
 *   ]
 * };
 * ```
 */
export interface Theme {
	/** Unique identifier for the theme */
	name: string;

	/** Human-readable description of the theme */
	description?: string;

	/** Reserved colors for specific log levels */
	reserved: {
		/** Warning level color (yellow/orange tones recommended) */
		WARN: ColorDefinition;
		/** Error level color (red tones recommended) */
		ERROR: ColorDefinition;
		/** Info level color (blue tones recommended) */
		INFO: ColorDefinition;
		/** Success level color (green tones recommended) */
		SUCCESS: ColorDefinition;
	};

	/**
	 * Normal color palette for automatic label coloring (6 colors, indexed 0-5).
	 * Colors should be visually distinct and provide good contrast across all modes.
	 */
	normal: [
		ColorDefinition,
		ColorDefinition,
		ColorDefinition,
		ColorDefinition,
		ColorDefinition,
		ColorDefinition,
	];
}

/**
 * Label configuration for log messages.
 *
 * Labels can be specified in three ways:
 * 1. Simple string: `"API"` - uses automatic color selection
 * 2. Object with color index: `{ label: "API", color: 3 }` - uses specific color from palette
 * 3. Object with hex colors: `{ label: "API", bgColor: "#ff0000", fgColor: "#ffffff" }` - custom colors
 *
 * **Custom Hex Colors in ANSI Modes:**
 * When using `bgColor`/`fgColor` with ANSI color modes (ansi16/ansi256), the hex values will be
 * quantized to the nearest ANSI color using RGB Euclidean distance. This process makes assumptions
 * about the terminal's color palette:
 * - ANSI-16: Assumes standard terminal colors (which vary by terminal theme)
 * - ANSI-256: Assumes standard 6×6×6 RGB cube mapping
 *
 * **Contrast Limitations:**
 * Quantized colors cannot guarantee contrast ratios because the actual rendered colors depend on
 * the user's terminal theme. For guaranteed accessibility and WCAG compliance, use `colorMode: 'truecolor'`
 * or use a predefined theme instead of custom hex colors.
 *
 * @example
 * ```typescript
 * // Simple string label
 * logger.log("API", "Request received");
 *
 * // Label with color index (0-5)
 * logger.log({ label: "DB", color: 2 }, "Query executed");
 *
 * // Label with custom hex colors (best in truecolor mode)
 * logger.log({
 *   label: "CUSTOM",
 *   bgColor: "#ff0000",
 *   fgColor: "#ffffff"
 * }, "Custom colored message");
 *
 * // Label with custom prefix/suffix
 * logger.log({
 *   label: "API",
 *   prefix: ">>",
 *   suffix: "<<"
 * }, "Message");
 * ```
 */
export type Label =
	| string
	| undefined
	| null
	| {
			/** The text content of the label */
			label: string;
			/** Color index (0-5) or ChalkInstance for styling */
			color?: ChalkInstance | number;
			/** Custom prefix to override global labelPrefix */
			prefix?: string;
			/** Custom suffix to override global labelSuffix */
			suffix?: string;
	  }
	| {
			/** The text content of the label */
			label: string;
			/** Background color in hex format (e.g., "#ff0000") */
			bgColor: string;
			/** Foreground/text color in hex format (e.g., "#ffffff") */
			fgColor: string;
			/** Custom prefix to override global labelPrefix */
			prefix?: string;
			/** Custom suffix to override global labelSuffix */
			suffix?: string;
	  };

interface PrintParams {
	logger: (...parameters: unknown[]) => void;
	label: Label;
	data: unknown[];
	config: LoggerConfig;
}

// ========= COLOR UTILITIES =========

/**
 * Calculates the relative luminance of a color using the WCAG formula.
 * Returns a value between 0 (black) and 1 (white).
 *
 * @param hex - Hex color string (e.g., "#FF0000" or "FF0000")
 * @returns Relative luminance (0-1)
 * @internal
 */
function calculateLuminance(hex: string): number {
	// Remove # if present
	const cleanHex = hex.replace("#", "");

	// Convert to RGB
	const r = Number.parseInt(cleanHex.slice(0, 2), 16);
	const g = Number.parseInt(cleanHex.slice(2, 4), 16);
	const b = Number.parseInt(cleanHex.slice(4, 6), 16);

	// Calculate relative luminance using WCAG formula
	// https://www.w3.org/TR/WCAG20/#relativeluminancedef
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

	return luminance;
}

/**
 * Determines whether to use black or white text based on background luminance.
 * Uses a threshold of 0.5 (midpoint between black and white).
 *
 * @param bgHex - Background hex color
 * @returns "black" for light backgrounds, "white" for dark backgrounds
 * @internal
 */
function _getTextColorForBackground(bgHex: string): "black" | "white" {
	const luminance = calculateLuminance(bgHex);
	return luminance > 0.5 ? "black" : "white";
}

/**
 * Quantizes a hex color to the nearest ANSI-16 color code.
 * Maps to one of the 16 basic ANSI colors (0-15).
 *
 * **Note:** This assumes standard ANSI color mappings. Actual terminal
 * colors may vary based on the user's theme.
 *
 * @param hex - Hex color string
 * @returns ANSI color code (0-15)
 * @internal
 */
function _hexToAnsi16(hex: string): number {
	const cleanHex = hex.replace("#", "");
	const r = Number.parseInt(cleanHex.slice(0, 2), 16);
	const g = Number.parseInt(cleanHex.slice(2, 4), 16);
	const b = Number.parseInt(cleanHex.slice(4, 6), 16);

	// Standard ANSI 16-color palette (approximate RGB values)
	// Colors 0-7: black, red, green, yellow, blue, magenta, cyan, white
	// Colors 8-15: bright variants of the above
	const ansi16Palette = [
		[0, 0, 0], // 0: black
		[128, 0, 0], // 1: red
		[0, 128, 0], // 2: green
		[128, 128, 0], // 3: yellow
		[0, 0, 128], // 4: blue
		[128, 0, 128], // 5: magenta
		[0, 128, 128], // 6: cyan
		[192, 192, 192], // 7: white
		[128, 128, 128], // 8: bright black (gray)
		[255, 0, 0], // 9: bright red
		[0, 255, 0], // 10: bright green
		[255, 255, 0], // 11: bright yellow
		[0, 0, 255], // 12: bright blue
		[255, 0, 255], // 13: bright magenta
		[0, 255, 255], // 14: bright cyan
		[255, 255, 255], // 15: bright white
	];

	// Find nearest color using RGB Euclidean distance
	let minDistance = Number.POSITIVE_INFINITY;
	let closestIndex = 0;

	for (let i = 0; i < ansi16Palette.length; i++) {
		const color = ansi16Palette[i]!;
		const pr = color[0]!;
		const pg = color[1]!;
		const pb = color[2]!;
		const distance = Math.sqrt((r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2);

		if (distance < minDistance) {
			minDistance = distance;
			closestIndex = i;
		}
	}

	return closestIndex;
}

/**
 * Quantizes a hex color to the nearest ANSI-256 color code.
 * Maps to the 216-color RGB cube (colors 16-231) or grayscale (232-255).
 *
 * **Note:** This assumes the standard 256-color palette. Some terminals
 * allow customization of even these colors.
 *
 * @param hex - Hex color string
 * @returns ANSI-256 color code (16-255)
 * @internal
 */
function _hexToAnsi256(hex: string): number {
	const cleanHex = hex.replace("#", "");
	const r = Number.parseInt(cleanHex.slice(0, 2), 16);
	const g = Number.parseInt(cleanHex.slice(2, 4), 16);
	const b = Number.parseInt(cleanHex.slice(4, 6), 16);

	// Check if it's a grayscale color (r ≈ g ≈ b)
	const isGrayscale = Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10;

	if (isGrayscale) {
		// Map to 24-step grayscale ramp (colors 232-255)
		// Each step represents roughly 10.7 intensity units
		const gray = (r + g + b) / 3;
		if (gray < 8) return 16; // Black from RGB cube
		if (gray > 247) return 231; // White from RGB cube

		const index = Math.round(((gray - 8) / 247) * 23);
		return 232 + Math.max(0, Math.min(23, index));
	}

	// Map to 6×6×6 RGB cube (colors 16-231)
	// Each channel: 0, 95, 135, 175, 215, 255 (6 levels)
	const levels = [0, 95, 135, 175, 215, 255];

	const rIndex = levels.reduce(
		(prev, curr, idx) => (Math.abs(curr - r) < Math.abs(levels[prev]! - r) ? idx : prev),
		0
	);
	const gIndex = levels.reduce(
		(prev, curr, idx) => (Math.abs(curr - g) < Math.abs(levels[prev]! - g) ? idx : prev),
		0
	);
	const bIndex = levels.reduce(
		(prev, curr, idx) => (Math.abs(curr - b) < Math.abs(levels[prev]! - b) ? idx : prev),
		0
	);

	// Formula: 16 + 36×r + 6×g + b
	return 16 + 36 * rIndex + 6 * gIndex + bIndex;
}

/**
 * Creates a ChalkInstance from a ColorDefinition based on the active color mode.
 *
 * @param colorDef - Color definition with mode-specific values
 * @param mode - Active color mode
 * @param chalk - Chalk instance to use
 * @returns Configured ChalkInstance
 * @internal
 */
function applyColorDefinition(
	colorDef: ColorDefinition,
	mode: ColorMode,
	chalk: InstanceType<typeof Chalk>
): ChalkInstance {
	switch (mode) {
		case "ansi16": {
			const { bg, fg } = colorDef.ansi16;
			// Convert to ANSI codes: 30-37 (fg), 40-47 (bg), 90-97 (bright fg), 100-107 (bright bg)
			const bgCode = bg >= 8 ? 100 + (bg - 8) : 40 + bg;
			const fgCode = fg >= 8 ? 90 + (fg - 8) : 30 + fg;
			return chalk.ansi256(bgCode).ansi256(fgCode);
		}
		case "ansi256": {
			const { bg, fg } = colorDef.ansi256;
			return chalk.bgAnsi256(bg).ansi256(fg);
		}
		case "truecolor": {
			const { bg, fg } = colorDef.truecolor;
			return chalk.bgHex(bg).hex(fg);
		}
		default: {
			throw new Error(`Unknown color mode: ${mode as string}`);
		}
	}
}

/**
 * Configuration options for Hagen logger instances.
 *
 * @example
 * ```typescript
 * import { createHagen } from "hagen";
 *
 * const logger = createHagen({
 *   showTimestamp: true,
 *   dateFormat: "time",
 *   timeFormat: "12h",
 *   labelPrefix: "<<",
 *   labelSuffix: ">>",
 *   enableColor: true,
 *   colorMode: 'truecolor',
 *   theme: 'nord'
 * });
 * ```
 */
export interface LoggerConfig {
	/** Whether to include timestamps in log output. Default: false */
	showTimestamp: boolean;

	/**
	 * Whether to enable colored output.
	 * Automatically disabled in CI environments.
	 * Default: true (false in CI)
	 */
	enableColor: boolean;

	/**
	 * Color mode for terminal output.
	 *
	 * - `'ansi16'`: Basic 16 colors (theme-dependent, may have poor contrast)
	 * - `'ansi256'`: 256 colors (more consistent, still theme-affected)
	 * - `'truecolor'`: 16 million colors (guaranteed contrast, WCAG compliant)
	 *
	 * Default: `'truecolor'`
	 *
	 * **Recommendation:** Use `'truecolor'` for guaranteed accessibility.
	 * ANSI modes depend on terminal theme and cannot guarantee contrast ratios.
	 *
	 * @see {@link ColorMode}
	 */
	colorMode?: ColorMode;

	/**
	 * Theme to use for color selection.
	 *
	 * Can be either a built-in theme name or a custom Theme object.
	 * Built-in themes: 'default', 'catppuccin-mocha', 'nord', 'dracula', 'solarized-dark'
	 *
	 * Default: `'default'`
	 *
	 * @example
	 * ```typescript
	 * // Use built-in theme
	 * const logger = createHagen({ theme: 'nord' });
	 *
	 * // Use custom theme
	 * const logger = createHagen({ theme: myCustomTheme });
	 * ```
	 */
	theme?: string | Theme;

	/**
	 * Color schemes for different log types.
	 *
	 * **DEPRECATED:** Use `theme` and `colorMode` instead. This field is maintained
	 * for backward compatibility but will be removed in a future major version.
	 *
	 * If provided, this takes precedence over `theme` but a deprecation warning
	 * will be emitted.
	 *
	 * @deprecated Use `theme` and `colorMode` instead
	 */
	colors?: {
		/** Reserved colors for specific log levels (info, warn, error, success) */
		reserved: {
			WARN: ChalkInstance;
			ERROR: ChalkInstance;
			INFO: ChalkInstance;
			SUCCESS: ChalkInstance;
		};
		/** Color palette for regular log() calls (6 colors, indexed 0-5) */
		normal: ChalkInstance[];
	};

	/** Fixed width configuration for labels (advanced feature) */
	fixedWidth?: {
		/** Target width in characters */
		width: number;
		/** Where to truncate if label exceeds width */
		truncationMethod?: "start" | "end" | "middle";
	};

	/**
	 * Date/time format for timestamps.
	 * - "iso": ISO 8601 format (2024-03-15T10:30:00.000Z)
	 * - "locale": Locale-specific format
	 * - "time": Time only (HH:MM:SS)
	 * - Custom function: (date) => string
	 * Default: "iso"
	 */
	dateFormat?: "iso" | "locale" | "time" | ((date: Date) => string);

	/**
	 * Time format when dateFormat is "time".
	 * - "12h": 12-hour format with AM/PM
	 * - "24h": 24-hour format
	 * Default: "24h"
	 */
	timeFormat?: "12h" | "24h";

	/**
	 * Global prefix to add before all labels.
	 * Can be overridden per-label.
	 * Default: none
	 */
	labelPrefix?: string;

	/**
	 * Global suffix to add after all labels.
	 * Can be overridden per-label.
	 * Default: none
	 */
	labelSuffix?: string;

	/**
	 * Default label to use when label is empty, undefined, or null.
	 * Default: "■" (black square)
	 */
	defaultLabel?: string;
}

/**
 * Logger instance with methods for different log levels.
 *
 * Each method accepts a label (string or Label object) followed by any number of data arguments.
 *
 * @example
 * ```typescript
 * const logger = createHagen();
 *
 * // General logging
 * logger.log("API", "Request received", { userId: 123 });
 *
 * // Informational messages (blue by default, prefixed with 'i')
 * logger.info("SYSTEM", "Service started");
 *
 * // Success messages (green by default, prefixed with '✓')
 * logger.success("DATABASE", "Connection established");
 *
 * // Warnings (yellow by default, prefixed with '!', uses console.warn)
 * logger.warn("AUTH", "Token expires soon");
 *
 * // Errors (red by default, prefixed with '✕', uses console.error)
 * logger.error("API", "Request failed", error);
 * ```
 */
export interface HagenInstance {
	/**
	 * General purpose logging with automatic color selection.
	 * @param label - String label or Label object for categorization
	 * @param data - Any number of values to log
	 */
	log: (label: Label, ...data: unknown[]) => void;

	/**
	 * Informational logging (defaults to blue, prefixed with 'i').
	 * @param label - String label or Label object for categorization
	 * @param data - Any number of values to log
	 */
	info: (label: Label, ...data: unknown[]) => void;

	/**
	 * Success logging (defaults to green, prefixed with '✓').
	 * @param label - String label or Label object for categorization
	 * @param data - Any number of values to log
	 */
	success: (label: Label, ...data: unknown[]) => void;

	/**
	 * Warning logging (defaults to yellow, prefixed with '!', uses console.warn).
	 * @param label - String label or Label object for categorization
	 * @param data - Any number of values to log
	 */
	warn: (label: Label, ...data: unknown[]) => void;

	/**
	 * Error logging (defaults to red, prefixed with '✕', uses console.error).
	 * @param label - String label or Label object for categorization
	 * @param data - Any number of values to log
	 */
	error: (label: Label, ...data: unknown[]) => void;
}

// ========= CONFIGURATION =========

// Color cache for performance
const colorCache = new Map<string, ChalkInstance>();

// Lazy Chalk initialization with dynamic level
const chalkInstances = new Map<number, InstanceType<typeof Chalk>>();

function getChalk(level: 0 | 1 | 2 | 3 = isCI ? 0 : 3): InstanceType<typeof Chalk> {
	if (!chalkInstances.has(level)) {
		chalkInstances.set(level, new Chalk({ level }));
	}
	return chalkInstances.get(level)!;
}

/**
 * Default configuration for Hagen instances.
 *
 * This configuration is used when no custom config is provided to createHagen().
 * Colors are automatically disabled in CI environments.
 * Uses true color mode by default for guaranteed contrast and accessibility.
 *
 * @example
 * ```typescript
 * import { defaultConfig } from "hagen";
 *
 * // Inspect default settings
 * console.log(defaultConfig.showTimestamp); // false
 * console.log(defaultConfig.colorMode); // "truecolor"
 * console.log(defaultConfig.theme); // "default"
 * ```
 */
export const defaultConfig: LoggerConfig = {
	showTimestamp: false,
	enableColor: !isCI,
	colorMode: "truecolor",
	theme: "default",
	dateFormat: "iso",
	timeFormat: "24h",
	defaultLabel: "·",
};

// ========= HELPERS =========

/**
 * Resolves a theme from a string name or Theme object.
 * @internal
 */
function resolveTheme(themeInput: string | Theme | undefined): Theme {
	if (!themeInput) {
		return defaultTheme;
	}

	if (typeof themeInput === "string") {
		const theme = getTheme(themeInput);
		if (!theme) {
			console.warn(
				`[Hagen] Theme "${themeInput}" not found. Using default theme. Available themes: default, catppuccin-mocha, nord, dracula, solarized-dark`
			);
			return defaultTheme;
		}
		return theme;
	}

	return themeInput;
}

/**
 * Generates color ChalkInstances from a theme based on the active color mode.
 * @internal
 */
function generateColorsFromTheme(
	theme: Theme,
	mode: ColorMode
): {
	reserved: {
		WARN: ChalkInstance;
		ERROR: ChalkInstance;
		INFO: ChalkInstance;
		SUCCESS: ChalkInstance;
	};
	normal: ChalkInstance[];
} {
	const chalkLevel = mode === "ansi16" ? 1 : mode === "ansi256" ? 2 : 3;
	const chalk = getChalk(chalkLevel);

	return {
		reserved: {
			WARN: applyColorDefinition(theme.reserved.WARN, mode, chalk),
			ERROR: applyColorDefinition(theme.reserved.ERROR, mode, chalk),
			INFO: applyColorDefinition(theme.reserved.INFO, mode, chalk),
			SUCCESS: applyColorDefinition(theme.reserved.SUCCESS, mode, chalk),
		},
		normal: theme.normal.map((colorDef) => applyColorDefinition(colorDef, mode, chalk)),
	};
}

/**
 * Tracks whether deprecation warning has been shown (once per process).
 * @internal
 */
let deprecationWarningShown = false;

/**
 * Shows a deprecation warning for the old colors config format.
 * @internal
 */
function showDeprecationWarning(): void {
	if (!deprecationWarningShown) {
		deprecationWarningShown = true;
		console.warn(
			"\n[Hagen] Deprecation Warning: The 'colors' config field is deprecated.\n" +
				"Please use 'theme' and 'colorMode' instead for better accessibility and theme support.\n" +
				"See migration guide: https://github.com/j0hnm4r5/hagen#migration\n" +
				"This warning will only appear once.\n"
		);
	}
}

/**
 * Returns a default color based on a hash of the label text.
 * Uses caching for performance - identical labels always get the same color.
 *
 * @param label - The label text to hash
 * @param colors - Array of available colors to choose from
 * @returns A ChalkInstance with the selected color
 *
 * @internal
 */
function calculateLabelColor(label: string, colors: ChalkInstance[]): ChalkInstance {
	if (colorCache.has(label)) {
		return colorCache.get(label)!;
	}

	const charSum = [...label].reduce((sum, character) => sum + character.codePointAt(0)!, 0);
	const color = colors[charSum % colors.length]!;

	colorCache.set(label, color);
	return color;
}

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
 * Formats text to a fixed width with optional truncation.
 * Centers text if shorter than width, truncates if longer.
 *
 * @param text - Text to format
 * @param width - Target width in characters
 * @param truncationMethod - Where to truncate: "start", "end", or "middle"
 * @returns Formatted text at exact width
 *
 * @internal
 */
function fixedWidthFormat(
	text: string,
	width: number,
	truncationMethod: "start" | "end" | "middle" = "end"
): string {
	if (text.length === width) {
		return text;
	}

	if (text.length < width) {
		const spacesTotal = width - text.length;
		const leftPadding = Math.floor(spacesTotal / 2);
		const rightPadding = spacesTotal - leftPadding;
		return " ".repeat(leftPadding) + text + " ".repeat(rightPadding);
	}

	const ellipsis = "…";
	const charsToShow = width - 1;

	switch (truncationMethod) {
		case "start": {
			return `${ellipsis}${text.slice(Math.max(0, text.length - charsToShow))}`;
		}
		case "end": {
			return `${text.slice(0, charsToShow)}${ellipsis}`;
		}
		case "middle": {
			const frontChars = Math.ceil(charsToShow / 2);
			const backChars = Math.floor(charsToShow / 2);
			return `${text.slice(0, frontChars)}${ellipsis}${text.slice(Math.max(0, text.length - backChars))}`;
		}
		default: {
			throw new Error(`Invalid truncation method: ${truncationMethod as string}`);
		}
	}
}

/**
 * Formats timestamp according to configuration settings.
 *
 * @param config - Logger configuration containing date/time format settings
 * @returns Formatted timestamp string
 *
 * @internal
 */
function formatTimestamp(config: LoggerConfig): string {
	const date = new Date();

	if (typeof config.dateFormat === "function") {
		return config.dateFormat(date);
	}

	switch (config.dateFormat) {
		case "iso": {
			return date.toISOString();
		}
		case "locale": {
			return date.toLocaleString();
		}
		case "time": {
			const hours = config.timeFormat === "12h" ? date.getHours() % 12 || 12 : date.getHours();
			const minutes = date.getMinutes().toString().padStart(2, "0");
			const seconds = date.getSeconds().toString().padStart(2, "0");
			const ampm = config.timeFormat === "12h" ? (date.getHours() >= 12 ? "PM" : "AM") : "";
			return `${hours}:${minutes}:${seconds}${ampm ? ` ${ampm}` : ""}`;
		}
		default: {
			return date.toISOString();
		}
	}
}

/**
 * Formats the label with prefix and suffix.
 */
function formatLabel(
	labelText: string,
	customPrefix?: string,
	customSuffix?: string,
	config?: LoggerConfig
): string {
	const prefix = customPrefix ?? config?.labelPrefix ?? "";
	const suffix = customSuffix ?? config?.labelSuffix ?? "";

	let result = labelText;
	if (prefix) result = `${prefix} ${result}`;
	if (suffix) result = `${result} ${suffix}`;

	return result.trim();
}

/**
 * Prints the formatted label and data to the console.
 */
function print({ logger, label, data, config }: PrintParams): void {
	let color: ChalkInstance;
	let finalLabel = config.defaultLabel ?? "·";
	let customPrefix: string | undefined;
	let customSuffix: string | undefined;

	// Handle undefined, null, or non-object labels
	if (label === undefined || label === null || typeof label !== "object") {
		// For string labels, use them if non-empty, otherwise use default
		const labelText = typeof label === "string" ? label : "";
		finalLabel = labelText.trim() || finalLabel;
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		color = calculateLabelColor(finalLabel, config.colors!.normal);
	} else {
		// Object label
		const labelText = typeof label.label === "string" ? label.label : "";
		finalLabel = labelText.trim() || finalLabel;
		customPrefix = label.prefix;
		customSuffix = label.suffix;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if ("color" in label && label.color !== undefined) {
			if (typeof label.color === "number") {
				// eslint-disable-next-line @typescript-eslint/no-deprecated
				color = config.colors!.normal[label.color]!;
			} else {
				color = label.color;
			}
		} else if ("bgColor" in label) {
			color = getChalk().bgHex(label.bgColor).hex(label.fgColor);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-deprecated
			color = calculateLabelColor(finalLabel, config.colors!.normal);
		}
	}

	// Apply formatting
	finalLabel = formatLabel(finalLabel, customPrefix, customSuffix, config);

	// Apply fixed width if configured
	if (config.fixedWidth) {
		finalLabel = fixedWidthFormat(
			finalLabel,
			config.fixedWidth.width,
			config.fixedWidth.truncationMethod
		);
	}

	// Handle colorless mode
	if (!config.enableColor) {
		finalLabel = `[ ${finalLabel} ]`;

		if (config.showTimestamp) {
			const timestamp = formatTimestamp(config);
			finalLabel = `${finalLabel} [ ${timestamp} ]`;
		}

		logger(finalLabel, ...data);
		return;
	}

	// Apply color and make bold
	finalLabel = color.bold(` ${finalLabel} `);

	// Add border in CI mode
	if (isCI) {
		finalLabel = `[${finalLabel}]`;
	}

	// Add timestamp
	if (config.showTimestamp) {
		const timestamp = formatTimestamp(config);
		const timestampLabel = getChalk().gray(`[ ${timestamp} ]`);
		finalLabel = `${finalLabel} ${timestampLabel}`;
	}

	logger(finalLabel, ...data);
}

// ========= LOGGER FACTORY =========

/**
 * Creates a new Hagen logger instance with custom configuration.
 *
 * Each instance has its own configuration and doesn't affect other instances.
 * This allows you to create different loggers for different parts of your application.
 *
 * @param config - Optional partial configuration to override defaults
 * @returns A new HagenInstance with log, info, success, warn, and error methods
 *
 * @example
 * ```typescript
 * import { createHagen } from "hagen";
 *
 * // Create logger with timestamps
 * const logger = createHagen({
 *   showTimestamp: true,
 *   dateFormat: "time",
 *   timeFormat: "12h"
 * });
 *
 * logger.log("API", "Request received");
 * logger.info("AUTH", "User logged in");
 * logger.success("DB", "Connection established");
 * logger.warn("CACHE", "High memory usage");
 * logger.error("API", "Request failed", error);
 * ```
 *
 * @example
 * ```typescript
 * // Create multiple independent loggers
 * const apiLogger = createHagen({ labelPrefix: "[API]" });
 * const dbLogger = createHagen({ labelPrefix: "[DB]" });
 *
 * apiLogger.log("FETCH", "Fetching data...");
 * dbLogger.log("QUERY", "Running query...");
 * ```
 *
 * @example
 * ```typescript
 * // Disable colors for testing or CI
 * const testLogger = createHagen({ enableColor: false });
 * testLogger.log("TEST", "Running tests");
 * ```
 */
export function createHagen(config?: Partial<LoggerConfig>): HagenInstance {
	// Merge with defaults
	const mergedConfig: LoggerConfig = { ...defaultConfig, ...config };

	// Check for deprecated colors field
	// eslint-disable-next-line @typescript-eslint/no-deprecated
	if (config?.colors) {
		showDeprecationWarning();
		// Keep using the old colors format for backward compatibility
	} else {
		// Use new theme system
		const theme = resolveTheme(mergedConfig.theme);
		const mode = mergedConfig.colorMode ?? "truecolor";
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		mergedConfig.colors = generateColorsFromTheme(theme, mode);
	}

	// Ensure colors is defined at this point
	const instanceConfig = mergedConfig as LoggerConfig & {
		colors: {
			reserved: {
				WARN: ChalkInstance;
				ERROR: ChalkInstance;
				INFO: ChalkInstance;
				SUCCESS: ChalkInstance;
			};
			normal: ChalkInstance[];
		};
	};

	const log = (label: Label, ...data: unknown[]): void => {
		print({
			logger: console.log,
			label,
			data,
			config: instanceConfig,
		});
	};

	const info = (label: Label, ...data: unknown[]): void => {
		let processedLabel: Label;

		if (label === undefined || label === null || typeof label === "string") {
			const labelText = typeof label === "string" ? label : "";
			processedLabel = {
				label: formatLabel(labelText, "i", undefined, instanceConfig),
				// eslint-disable-next-line @typescript-eslint/no-deprecated
				color: instanceConfig.colors.reserved.INFO,
			};
		} else if ("bgColor" in label && "fgColor" in label) {
			processedLabel = {
				label: formatLabel(label.label, label.prefix ?? "i", label.suffix, instanceConfig),
				bgColor: label.bgColor,
				fgColor: label.fgColor,
				...(label.prefix && { prefix: label.prefix }),
				...(label.suffix && { suffix: label.suffix }),
			};
		} else {
			processedLabel = {
				label: formatLabel(label.label, label.prefix ?? "i", label.suffix, instanceConfig),
				// eslint-disable-next-line @typescript-eslint/no-deprecated
				color: label.color ?? instanceConfig.colors.reserved.INFO,
				...(label.prefix && { prefix: label.prefix }),
				...(label.suffix && { suffix: label.suffix }),
			};
		}

		print({
			logger: console.log,
			label: processedLabel,
			data,
			config: instanceConfig,
		});
	};

	const success = (label: Label, ...data: unknown[]): void => {
		let processedLabel: Label;

		if (label === undefined || label === null || typeof label === "string") {
			const labelText = typeof label === "string" ? label : "";
			processedLabel = {
				label: formatLabel(labelText, "✓", undefined, instanceConfig),
				// eslint-disable-next-line @typescript-eslint/no-deprecated
				color: instanceConfig.colors.reserved.SUCCESS,
			};
		} else if ("bgColor" in label && "fgColor" in label) {
			processedLabel = {
				label: formatLabel(label.label, label.prefix ?? "✓", label.suffix, instanceConfig),
				bgColor: label.bgColor,
				fgColor: label.fgColor,
				...(label.prefix && { prefix: label.prefix }),
				...(label.suffix && { suffix: label.suffix }),
			};
		} else {
			processedLabel = {
				label: formatLabel(label.label, label.prefix ?? "✓", label.suffix, instanceConfig),
				// eslint-disable-next-line @typescript-eslint/no-deprecated
				color: label.color ?? instanceConfig.colors.reserved.SUCCESS,
				...(label.prefix && { prefix: label.prefix }),
				...(label.suffix && { suffix: label.suffix }),
			};
		}

		print({
			logger: console.log,
			label: processedLabel,
			data,
			config: instanceConfig,
		});
	};

	const warn = (label: Label, ...data: unknown[]): void => {
		let processedLabel: Label;

		if (label === undefined || label === null || typeof label === "string") {
			const labelText = typeof label === "string" ? label : "";
			processedLabel = {
				label: formatLabel(labelText, "!", undefined, instanceConfig),
				// eslint-disable-next-line @typescript-eslint/no-deprecated
				color: instanceConfig.colors.reserved.WARN,
			};
		} else if ("bgColor" in label && "fgColor" in label) {
			processedLabel = {
				label: formatLabel(label.label, label.prefix ?? "!", label.suffix, instanceConfig),
				bgColor: label.bgColor,
				fgColor: label.fgColor,
				...(label.prefix && { prefix: label.prefix }),
				...(label.suffix && { suffix: label.suffix }),
			};
		} else {
			processedLabel = {
				label: formatLabel(label.label, label.prefix ?? "!", label.suffix, instanceConfig),
				// eslint-disable-next-line @typescript-eslint/no-deprecated
				color: label.color ?? instanceConfig.colors.reserved.WARN,
				...(label.prefix && { prefix: label.prefix }),
				...(label.suffix && { suffix: label.suffix }),
			};
		}

		print({
			logger: console.warn,
			label: processedLabel,
			data,
			config: instanceConfig,
		});
	};

	const error = (label: Label, ...data: unknown[]): void => {
		let processedLabel: Label;

		if (label === undefined || label === null || typeof label === "string") {
			const labelText = typeof label === "string" ? label : "";
			processedLabel = {
				label: formatLabel(labelText, "✕", undefined, instanceConfig),
				// eslint-disable-next-line @typescript-eslint/no-deprecated
				color: instanceConfig.colors.reserved.ERROR,
			};
		} else if ("bgColor" in label && "fgColor" in label) {
			processedLabel = {
				label: formatLabel(label.label, label.prefix ?? "✕", label.suffix, instanceConfig),
				bgColor: label.bgColor,
				fgColor: label.fgColor,
				...(label.prefix && { prefix: label.prefix }),
				...(label.suffix && { suffix: label.suffix }),
			};
		} else {
			processedLabel = {
				label: formatLabel(label.label, label.prefix ?? "✕", label.suffix, instanceConfig),
				// eslint-disable-next-line @typescript-eslint/no-deprecated
				color: label.color ?? instanceConfig.colors.reserved.ERROR,
				...(label.prefix && { prefix: label.prefix }),
				...(label.suffix && { suffix: label.suffix }),
			};
		}

		print({
			logger: console.error,
			label: processedLabel,
			data,
			config: instanceConfig,
		});
	};

	return { log, info, success, warn, error };
}

// ========= DEFAULT INSTANCE =========

/**
 * Default Hagen logger instance with default configuration.
 *
 * This is a pre-configured instance ready to use immediately without any setup.
 * Perfect for quick logging needs or when you don't need custom configuration.
 *
 * For custom configuration, use {@link createHagen} instead.
 *
 * @example
 * ```typescript
 * // Default import
 * import hagen from "hagen";
 *
 * hagen.log("TEST", "Hello, world!");
 * hagen.info("INFO", "This is informational");
 * hagen.success("SUCCESS", "Operation completed");
 * hagen.warn("WARNING", "Be careful!");
 * hagen.error("ERROR", "Something went wrong");
 * ```
 *
 * @example
 * ```typescript
 * // Named imports (same instance)
 * import { log, info, success, warn, error } from "hagen";
 *
 * log("API", "Request received");
 * info("SYSTEM", "Service started");
 * success("DB", "Connected");
 * warn("MEMORY", "High usage");
 * error("API", "Failed", error);
 * ```
 */
const defaultInstance = createHagen();

// ========= EXPORTS =========

/**
 * Named export: General purpose logging method from the default instance.
 * @see {@link HagenInstance.log}
 */
export const log = defaultInstance.log;

/**
 * Named export: Informational logging method from the default instance.
 * @see {@link HagenInstance.info}
 */
export const info = defaultInstance.info;

/**
 * Named export: Success logging method from the default instance.
 * @see {@link HagenInstance.success}
 */
export const success = defaultInstance.success;

/**
 * Named export: Warning logging method from the default instance.
 * @see {@link HagenInstance.warn}
 */
export const warn = defaultInstance.warn;

/**
 * Named export: Error logging method from the default instance.
 * @see {@link HagenInstance.error}
 */
export const error = defaultInstance.error;

// Default export
export default defaultInstance;
