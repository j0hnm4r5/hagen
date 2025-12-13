/**
 * Core type definitions for Hagen logger.
 */

/** RGB color tuple [red, green, blue] where each value is 0-255 */
export type RGB = readonly [number, number, number];

/** HEX: Hexadecimal color string */
type HEX = `#${string}`;

/** Color value: valid hex string or RGB tuple ([255, 0, 0]) */
export type Color = HEX | RGB;

/**
 * A function that applies ANSI color formatting to text.
 * Returns the formatted string with ANSI escape codes.
 */
export type ColorFormatter = (text: string) => string;

/**
 * Label configuration for log messages.
 *
 * Labels can be specified in multiple ways:
 * 1. Simple string: `"API"` - uses automatic color selection based on hash
 * 2. Object with ColorFormatter: `{ label: "API", color: myFormatter }` - uses provided formatter
 * 3. Object with custom colors: `{ label: "API", bgColor: "#ff0000", fgColor: "#ffffff" }` - custom colors
 *
 * Colors can be specified as:
 * - Hex strings: `"#FF0000"` or `"FF0000"`
 * - RGB tuples: `[255, 0, 0]`
 *
 * @example
 * ```typescript
 * // Simple string label
 * logger.log("API", "Request received");
 *
 * // Label with custom hex colors
 * logger.log({
 *   label: "CUSTOM",
 *   bgColor: "#ff0000",
 *   fgColor: "#ffffff"
 * }, "Custom colored message");
 *
 * // Label with RGB tuples
 * logger.log({
 *   label: "RGB",
 *   bgColor: [255, 100, 50],
 *   fgColor: [0, 0, 0]
 * }, "RGB colored message");
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
			/** ColorFormatter for styling */
			color?: ColorFormatter;
			/** Custom prefix to override global labelPrefix */
			prefix?: string;
			/** Custom suffix to override global labelSuffix */
			suffix?: string;
	  }
	| {
			/** The text content of the label */
			label: string;
			/** Background color as hex string or RGB tuple. */
			bgColor: Color;
			/** Foreground (text) color as hex string or RGB tuple. If not specified, auto-calculated for contrast. */
			fgColor?: Color;
			/** Custom prefix to override global labelPrefix */
			prefix?: string;
			/** Custom suffix to override global labelSuffix */
			suffix?: string;
	  };

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
 * // Warnings (yellow/orange by default, prefixed with '!', uses console.warn)
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
	 * Warning logging (defaults to orange, prefixed with '!', uses console.warn).
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
