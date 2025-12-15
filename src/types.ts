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
export type AnsiFormatter = (text: string) => string;

/**
 * Label configuration for log messages.
 *
 * Labels can be specified in multiple ways:
 * 1. Simple string: `"API"` - uses automatic color selection based on hash
 * 2. Object with AnsiFormatter: `{ label: "API", color: myFormatter }` - uses provided formatter
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
export interface BaseLabel {
	/** The text content of the label */
	label: string;
	/** Custom prefix to override global labelPrefix */
	prefix?: string;
	/** Custom suffix to override global labelSuffix */
	suffix?: string;
}

export interface FormatterLabel extends BaseLabel {
	kind?: "formatter";

	/** A function that applies ANSI codes to input text. */
	ansiFormatter: AnsiFormatter;
}

export interface ColorLabel extends BaseLabel {
	kind?: "color";

	/** Background color as hex string or RGB tuple. If not specified, auto-calculated from the label text. */
	bgColor?: Color;
	/** Foreground (text) color as hex string or RGB tuple. If not specified, auto-calculated for contrast. */
	fgColor?: Color;
}

export type Label =
	| string
	| undefined
	| null
	| FormatterLabel
	| ColorLabel
	| (BaseLabel & { kind?: never; bgColor?: Color; fgColor?: Color; ansiFormatter?: never });

export type Logger = (label: Label, ...data: unknown[]) => void;

/**
 * Logger instance with methods for different log levels.
 *
 * Each method accepts a label (string or Label object) followed by any number of data arguments.
 */
export interface HagenInstance {
	/**
	 * Outputs a message to the console, using `console.log`.
	 * The label defaults to automatic color selection.
	 *
	 * In Node.js, `console.log` prints to `stdout`.
	 */
	log: Logger;

	/**
	 * Outputs a message to the console with the error log level, using `console.error`.
	 * Defaults to red label color and is prefixed with '!!'.
	 *
	 * In Node.js, `console.error` prints to `stderr`.
	 */
	error: Logger;

	/**
	 * Outputs a message to the console with the warning log level, using `console.warn`.
	 * Defaults to yellow label color and is prefixed with '!'.
	 *
	 * In Node.js, `console.warn` is an alias for `console.error`, and will print to `stderr`.
	 */
	warn: Logger;

	/**
	 * Outputs a message to the console with the info log level, using `console.info`.
	 * Defaults to blue label color and is prefixed with 'i'.
	 *
	 * In Node.js, `console.info` is an alias for `console.log`, and will print to `stdout`.
	 */
	info: Logger;

	/**
	 * Outputs a message to the console with the debug log level, using `console.debug`.
	 * Defaults to cyan label color and is prefixed with '?'.
	 *
	 * In Node.js, `console.debug` is an alias for `console.log`, and will print to `stdout`.
	 */
	debug: Logger;
}
