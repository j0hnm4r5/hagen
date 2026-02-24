/**
 * Test utilities for validating ANSI color codes in output strings.
 */

import stripAnsiImport from "strip-ansi";

/**
 * Common ANSI escape codes used in terminal output.
 */
export const ANSI_CODES = {
	// Reset/Control
	reset: "\u001B[0m",
	bold: "\u001B[1m",
	dim: "\u001B[2m",
	italic: "\u001B[3m",
	underline: "\u001B[4m",
	inverse: "\u001B[7m",
	hidden: "\u001B[8m",
	strikethrough: "\u001B[9m",

	// Reset specific
	resetBold: "\u001B[22m",
	resetDim: "\u001B[22m",
	resetItalic: "\u001B[23m",
	resetUnderline: "\u001B[24m",
	resetInverse: "\u001B[27m",
	resetHidden: "\u001B[28m",
	resetStrikethrough: "\u001B[29m",

	// Foreground colors (30-37)
	black: "\u001B[30m",
	red: "\u001B[31m",
	green: "\u001B[32m",
	yellow: "\u001B[33m",
	blue: "\u001B[34m",
	magenta: "\u001B[35m",
	cyan: "\u001B[36m",
	white: "\u001B[37m",

	// Foreground reset
	fgReset: "\u001B[39m",

	// Background colors (40-47)
	bgBlack: "\u001B[40m",
	bgRed: "\u001B[41m",
	bgGreen: "\u001B[42m",
	bgYellow: "\u001B[43m",
	bgBlue: "\u001B[44m",
	bgMagenta: "\u001B[45m",
	bgCyan: "\u001B[46m",
	bgWhite: "\u001B[47m",

	// Background reset
	bgReset: "\u001B[49m",

	// Bright foreground colors (90-97)
	brightBlack: "\u001B[90m",
	brightRed: "\u001B[91m",
	brightGreen: "\u001B[92m",
	brightYellow: "\u001B[93m",
	brightBlue: "\u001B[94m",
	brightMagenta: "\u001B[95m",
	brightCyan: "\u001B[96m",
	brightWhite: "\u001B[97m",

	// Bright background colors (100-107)
	bgBrightBlack: "\u001B[100m",
	bgBrightRed: "\u001B[101m",
	bgBrightGreen: "\u001B[102m",
	bgBrightYellow: "\u001B[103m",
	bgBrightBlue: "\u001B[104m",
	bgBrightMagenta: "\u001B[105m",
	bgBrightCyan: "\u001B[106m",
	bgBrightWhite: "\u001B[107m",
} as const;

/**
 * Checks if a string contains any ANSI escape codes.
 *
 * @param str - The string to check
 * @returns True if the string contains ANSI codes
 *
 * @example
 * ```typescript
 * hasAnsiCodes('\u001B[31mRed\u001B[0m') // true
 * hasAnsiCodes('Plain text') // false
 * ```
 */
export function hasAnsiCodes(string_: string): boolean {
	const esc = String.fromCharCode(27);
	return new RegExp(`${esc}\[[0-9;]+m`).test(string_);
}

/**
 * Extracts all ANSI escape codes from a string.
 *
 * @param str - The string to extract codes from
 * @returns Array of ANSI escape codes found
 *
 * @example
 * ```typescript
 * extractAnsiCodes('\u001B[31mRed\u001B[0m')
 * // Returns: ['\u001B[31m', '\u001B[0m']
 * ```
 */
export function extractAnsiCodes(string_: string): string[] {
	const esc = String.fromCharCode(27);
	return string_.match(new RegExp(`${esc}\[[0-9;]+m`, "g")) || [];
}

/**
 * Removes all ANSI escape codes from a string.
 * This is a wrapper around the strip-ansi library.
 *
 * @param str - The string to strip ANSI codes from
 * @returns The string with all ANSI codes removed
 *
 * @example
 * ```typescript
 * stripAnsi('\u001B[31mRed Text\u001B[0m')
 * // Returns: 'Red Text'
 * ```
 */
export function stripAnsi(string_: string): string {
	return stripAnsiImport(string_);
}

/**
 * Checks if a string has bold formatting.
 *
 * @param str - The string to check
 * @returns True if the string contains bold codes
 */
export function hasBold(string_: string): boolean {
	return string_.includes(ANSI_CODES.bold);
}

/**
 * Checks if a string has any foreground color code (30-39, 90-97, or 38;x).
 *
 * @param str - The string to check
 * @returns True if the string contains foreground color codes
 */
export function hasForegroundColor(string_: string): boolean {
	// Match 30-39, 90-97, or 38;x (256/RGB colors)
	const esc = String.fromCharCode(27);
	return new RegExp(`${esc}\[(?:3[0-9]|9[0-7]|38;[0-9;]+)m`).test(string_);
}

/**
 * Checks if a string has any background color code (40-49, 100-107, or 48;x).
 *
 * @param str - The string to check
 * @returns True if the string contains background color codes
 */
export function hasBackgroundColor(string_: string): boolean {
	// Match 40-49, 100-107, or 48;x (256/RGB colors)
	const esc = String.fromCharCode(27);
	return new RegExp(`${esc}\[(?:4[0-9]|10[0-7]|48;[0-9;]+)m`).test(string_);
}

/**
 * Checks if a string has any color (foreground or background).
 *
 * @param str - The string to check
 * @returns True if the string contains any color codes
 */
export function hasColor(string_: string): boolean {
	return hasForegroundColor(string_) || hasBackgroundColor(string_);
}

/**
 * Gets the color type from ANSI code number.
 *
 * @param code - The ANSI code number (e.g., 31 for red)
 * @returns The color type or undefined
 */
export function getColorName(code: number): string | undefined {
	const colorMap: Record<number, string> = {
		30: "black",
		31: "red",
		32: "green",
		33: "yellow",
		34: "blue",
		35: "magenta",
		36: "cyan",
		37: "white",
		90: "brightBlack",
		91: "brightRed",
		92: "brightGreen",
		93: "brightYellow",
		94: "brightBlue",
		95: "brightMagenta",
		96: "brightCyan",
		97: "brightWhite",
	};
	return colorMap[code];
}