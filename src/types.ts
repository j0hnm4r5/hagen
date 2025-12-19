/**
 * Core type definitions for Hagen logger.
 */

/** RGB color tuple [red, green, blue] where each value is 0-255 */
export type RGB = readonly [number, number, number];

/** Color value: hex string, named ANSI color, RGB tuple, or null for transparent/hidden */
export type Color = string | RGB | null;

/**
 * A function that applies ANSI color formatting to text.
 * Returns the formatted string with ANSI escape codes.
 */
export type AnsiFormatter = (text: string) => string;

/**
 * Label configuration for log messages.
 *
 * Labels can be specified in multiple ways:
 * 1. Simple string: `"API"` - uses deterministic coloring based on the label text
 * 2. Object with custom colors: `{ label: "API", bgColor: "#ff0000", fgColor: "#ffffff" }` - custom colors
 * 3. Object with AnsiFormatter: `{ label: "API", ansiFormatter: myFormatter }` - uses a user-provided formatter, like one from Ansis, Picocolors, or Chalk
 *
 * Colors can be specified as:
 * - Hex strings: `"#FF0000"`
 * - RGB tuples: `[255, 0, 0]`
 * - Null (Transparent/Hidden): `null`
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
 * // Label with Transparent background (visible text)
 * logger.log({
 *   label: "Transp",
 *   bgColor: null,
 *   fgColor: "#FF0000"
 * }, "Red text, no background block");
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
	prefix?: string | undefined;
	/** Custom suffix to override global labelSuffix */
	suffix?: string | undefined;
}

export interface FormatterLabel extends BaseLabel {
	kind: "formatter";

	/** A function that applies ANSI codes to input text. */
	ansiFormatter: AnsiFormatter;
}

export interface ColorLabel extends BaseLabel {
	kind: "color";

	/**
	 * Background color as hex string, RGB tuple, or null.
	 * - `null`: Transparent background (no background color applied).
	 * - `undefined`: Auto-calculated from the label text.
	 */
	bgColor?: Color | undefined;
	/**
	 * Foreground (text) color as hex string, RGB tuple, or null.
	 * - `null`: Invisible text (ANSI hidden).
	 * - `undefined`: Auto-calculated for contrast against background.
	 */
	fgColor?: Color | undefined;
}

/** Segment type identifiers */
export type SegmentType = "icon" | "label" | "timestamp" | "message";

/** Configuration for segment tokens and their aliases */
export const TOKEN_CONFIG = [
	{
		type: "label",
		aliases: ["%l", "%label"],
	},
	{
		type: "timestamp",
		aliases: ["%t", "%timestamp"],
	},
	{
		type: "message",
		aliases: ["%m", "%message"],
	},
	{
		type: "icon",
		aliases: ["%i", "%icon"],
	},
] as const;

/** Separator preset names */
/** Configuration for separator presets and their aliases */
export const SEPARATOR_CONFIG = [
	{
		name: "pl-left",
		aliases: ["pl", "powerline", "pll"],
		symbol: "\ue0b0",
	},
	{
		name: "pl-right",
		aliases: ["plr"],
		symbol: "\ue0b2",
	},
	{
		name: "pl-left-rounded",
		aliases: ["pllo"],
		symbol: "\ue0b4",
	},
	{
		name: "pl-right-rounded",
		aliases: ["plro"],
		symbol: "\ue0b6",
	},
	{
		name: "arrow",
		aliases: ["->"],
		symbol: "→",
	},
	{
		name: "arrow-double",
		aliases: [">>"],
		symbol: "»",
	},
	{
		name: "dot",
		aliases: ["."],
		symbol: "•",
	},
] as const;

/**
 * Presets for separator glyphs.
 * Programmatically derived from SEPARATOR_CONFIG names and aliases.
 */
export type SeparatorPreset =
	| `%${(typeof SEPARATOR_CONFIG)[number]["name"]}`
	| `%${(typeof SEPARATOR_CONFIG)[number]["aliases"][number]}`;

/** Full segment definition */
export interface SegmentDefinition {
	type: SegmentType;
	bgColor?: Color | undefined;
	fgColor?: Color | undefined;
	ansiFormatter?: AnsiFormatter | undefined;
	fixedWidth?: number | undefined;
	truncationMethod?: "start" | "end" | "middle" | undefined;
	padding?: number | undefined;
}

/** Separator definition */
export interface SeparatorDefinition {
	type: "separator";
	preset?: SeparatorPreset | undefined;
	content?: string | undefined;
	fgColor?: Color | undefined;
	bgColor?: Color | undefined;
}

/** Layout item types */
export type LayoutItem = SegmentDefinition | SeparatorDefinition | string;

/** Layout: template string or array */
export type Layout = string | LayoutItem[];

/** Label array for multiple labels */
export type LabelArray = (string | FormatterLabel | ColorLabel)[];

export type Label = string | undefined | null | FormatterLabel | ColorLabel | LabelArray;

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
	 * Defaults to red label color and is prefixed with '×'.
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
