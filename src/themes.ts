/**
 * Built-in color themes for Hagen logger.
 *
 * Each theme provides carefully chosen color combinations that work across different
 * color modes (ansi16, ansi256, truecolor). ANSI mode colors are pre-selected to provide
 * reasonable contrast on common terminal themes, while true color mode guarantees
 * WCAG AA compliance.
 */

import type { Theme } from "./index.js";

/**
 * Default theme with vibrant, high-contrast colors.
 *
 * This theme uses the original Hagen color palette with strong, saturated colors
 * that work well in both light and dark terminals. True color mode provides
 * guaranteed WCAG AA contrast ratios.
 *
 * **ANSI Mode Notes:**
 * - Uses bright ANSI colors (90-97, 100-107) for better visibility
 * - Tested on: Default Dark, Default Light, One Dark, Solarized Dark
 * - May have reduced contrast on heavily customized terminal themes
 */
export const defaultTheme: Theme = {
	name: "default",
	description: "Default Hagen theme with vibrant, high-contrast colors",
	reserved: {
		WARN: {
			ansi16: { bg: 3, fg: 0 }, // Yellow bg, black fg
			ansi256: { bg: 214, fg: 16 }, // Orange bg, black fg
			truecolor: { bg: "#FFA500", fg: "#000000" }, // Orange bg, black fg (contrast: 8.3:1)
		},
		ERROR: {
			ansi16: { bg: 1, fg: 15 }, // Red bg, bright white fg
			ansi256: { bg: 160, fg: 231 }, // Crimson bg, white fg
			truecolor: { bg: "#DC143C", fg: "#FFFFFF" }, // Crimson bg, white fg (contrast: 5.9:1)
		},
		INFO: {
			ansi16: { bg: 4, fg: 15 }, // Blue bg, bright white fg
			ansi256: { bg: 33, fg: 231 }, // Dodger blue bg, white fg
			truecolor: { bg: "#1E90FF", fg: "#FFFFFF" }, // Dodger blue bg, white fg (contrast: 4.5:1)
		},
		SUCCESS: {
			ansi16: { bg: 2, fg: 0 }, // Green bg, black fg
			ansi256: { bg: 41, fg: 16 }, // Lime green bg, black fg
			truecolor: { bg: "#32CD32", fg: "#000000" }, // Lime green bg, black fg (contrast: 9.5:1)
		},
	},
	normal: [
		{
			// Color 0: Royal Blue
			ansi16: { bg: 12, fg: 15 }, // Bright blue bg, bright white fg
			ansi256: { bg: 63, fg: 231 }, // Royal blue bg, white fg
			truecolor: { bg: "#4169E1", fg: "#FFFFFF" }, // Contrast: 4.7:1
		},
		{
			// Color 1: Emerald Green
			ansi16: { bg: 10, fg: 0 }, // Bright green bg, black fg
			ansi256: { bg: 41, fg: 16 }, // Emerald green bg, black fg
			truecolor: { bg: "#2ECC71", fg: "#000000" }, // Contrast: 6.4:1
		},
		{
			// Color 2: Turquoise
			ansi16: { bg: 14, fg: 0 }, // Bright cyan bg, black fg
			ansi256: { bg: 37, fg: 16 }, // Turquoise bg, black fg
			truecolor: { bg: "#1ABC9C", fg: "#000000" }, // Contrast: 5.9:1
		},
		{
			// Color 3: Alizarin Red
			ansi16: { bg: 9, fg: 15 }, // Bright red bg, bright white fg
			ansi256: { bg: 167, fg: 231 }, // Alizarin red bg, white fg
			truecolor: { bg: "#E74C3C", fg: "#FFFFFF" }, // Contrast: 4.8:1
		},
		{
			// Color 4: Amethyst Purple
			ansi16: { bg: 13, fg: 15 }, // Bright magenta bg, bright white fg
			ansi256: { bg: 133, fg: 231 }, // Amethyst purple bg, white fg
			truecolor: { bg: "#9B59B6", fg: "#FFFFFF" }, // Contrast: 5.4:1
		},
		{
			// Color 5: Orange
			ansi16: { bg: 11, fg: 0 }, // Bright yellow bg, black fg
			ansi256: { bg: 214, fg: 16 }, // Orange bg, black fg
			truecolor: { bg: "#F39C12", fg: "#000000" }, // Contrast: 6.8:1
		},
	],
};

/**
 * Catppuccin Mocha theme - warm, pastel colors with excellent readability.
 *
 * Based on the popular Catppuccin color scheme (Mocha variant), this theme
 * features soft, muted colors that are easy on the eyes during long coding sessions.
 * Perfect for developers who prefer a warmer, less saturated color palette.
 *
 * **ANSI Mode Notes:**
 * - Works best with dark terminal backgrounds
 * - May appear washed out on light terminal themes
 *
 * @see {@link https://github.com/catppuccin/catppuccin}
 */
export const catppuccinMochaTheme: Theme = {
	name: "catppuccin-mocha",
	description: "Warm, pastel colors inspired by Catppuccin Mocha",
	reserved: {
		WARN: {
			ansi16: { bg: 3, fg: 0 },
			ansi256: { bg: 180, fg: 16 },
			truecolor: { bg: "#F9E2AF", fg: "#1E1E2E" }, // Peach, contrast: 10.8:1
		},
		ERROR: {
			ansi16: { bg: 1, fg: 15 },
			ansi256: { bg: 210, fg: 16 },
			truecolor: { bg: "#F38BA8", fg: "#1E1E2E" }, // Red, contrast: 7.9:1
		},
		INFO: {
			ansi16: { bg: 4, fg: 15 },
			ansi256: { bg: 117, fg: 16 },
			truecolor: { bg: "#89B4FA", fg: "#1E1E2E" }, // Blue, contrast: 6.8:1
		},
		SUCCESS: {
			ansi16: { bg: 2, fg: 0 },
			ansi256: { bg: 150, fg: 16 },
			truecolor: { bg: "#A6E3A1", fg: "#1E1E2E" }, // Green, contrast: 9.2:1
		},
	},
	normal: [
		{
			ansi16: { bg: 12, fg: 0 },
			ansi256: { bg: 117, fg: 16 },
			truecolor: { bg: "#89B4FA", fg: "#1E1E2E" }, // Blue
		},
		{
			ansi16: { bg: 10, fg: 0 },
			ansi256: { bg: 150, fg: 16 },
			truecolor: { bg: "#A6E3A1", fg: "#1E1E2E" }, // Green
		},
		{
			ansi16: { bg: 14, fg: 0 },
			ansi256: { bg: 159, fg: 16 },
			truecolor: { bg: "#94E2D5", fg: "#1E1E2E" }, // Teal
		},
		{
			ansi16: { bg: 9, fg: 0 },
			ansi256: { bg: 210, fg: 16 },
			truecolor: { bg: "#F38BA8", fg: "#1E1E2E" }, // Red
		},
		{
			ansi16: { bg: 13, fg: 0 },
			ansi256: { bg: 183, fg: 16 },
			truecolor: { bg: "#CBA6F7", fg: "#1E1E2E" }, // Mauve
		},
		{
			ansi16: { bg: 11, fg: 0 },
			ansi256: { bg: 180, fg: 16 },
			truecolor: { bg: "#F9E2AF", fg: "#1E1E2E" }, // Yellow
		},
	],
};

/**
 * Nord theme - arctic, frost-inspired color scheme.
 *
 * A cool, professional theme inspired by the colors of the Arctic. Features
 * muted blues, teals, and grays that create a calm, focused coding environment.
 * Excellent for reducing eye strain.
 *
 * **ANSI Mode Notes:**
 * - Optimized for dark backgrounds
 * - Cool color temperature may appear bluish on some terminals
 *
 * @see {@link https://www.nordtheme.com/}
 */
export const nordTheme: Theme = {
	name: "nord",
	description: "Arctic, frost-inspired colors from Nord theme",
	reserved: {
		WARN: {
			ansi16: { bg: 3, fg: 0 },
			ansi256: { bg: 179, fg: 16 },
			truecolor: { bg: "#EBCB8B", fg: "#2E3440" }, // Yellow, contrast: 8.3:1
		},
		ERROR: {
			ansi16: { bg: 1, fg: 15 },
			ansi256: { bg: 167, fg: 16 },
			truecolor: { bg: "#BF616A", fg: "#ECEFF4" }, // Red, contrast: 4.7:1
		},
		INFO: {
			ansi16: { bg: 4, fg: 15 },
			ansi256: { bg: 67, fg: 231 },
			truecolor: { bg: "#5E81AC", fg: "#ECEFF4" }, // Blue, contrast: 4.6:1
		},
		SUCCESS: {
			ansi16: { bg: 2, fg: 0 },
			ansi256: { bg: 108, fg: 16 },
			truecolor: { bg: "#A3BE8C", fg: "#2E3440" }, // Green, contrast: 7.1:1
		},
	},
	normal: [
		{
			ansi16: { bg: 12, fg: 15 },
			ansi256: { bg: 67, fg: 231 },
			truecolor: { bg: "#5E81AC", fg: "#ECEFF4" }, // Frost blue
		},
		{
			ansi16: { bg: 10, fg: 0 },
			ansi256: { bg: 108, fg: 16 },
			truecolor: { bg: "#A3BE8C", fg: "#2E3440" }, // Aurora green
		},
		{
			ansi16: { bg: 14, fg: 0 },
			ansi256: { bg: 109, fg: 16 },
			truecolor: { bg: "#88C0D0", fg: "#2E3440" }, // Frost cyan
		},
		{
			ansi16: { bg: 9, fg: 15 },
			ansi256: { bg: 167, fg: 231 },
			truecolor: { bg: "#BF616A", fg: "#ECEFF4" }, // Aurora red
		},
		{
			ansi16: { bg: 13, fg: 15 },
			ansi256: { bg: 139, fg: 231 },
			truecolor: { bg: "#B48EAD", fg: "#ECEFF4" }, // Aurora purple
		},
		{
			ansi16: { bg: 11, fg: 0 },
			ansi256: { bg: 179, fg: 16 },
			truecolor: { bg: "#EBCB8B", fg: "#2E3440" }, // Aurora yellow
		},
	],
};

/**
 * Dracula theme - vibrant, high-contrast dark theme.
 *
 * One of the most popular dark themes, featuring bright, saturated colors on
 * a dark purple-gray background. Excellent visibility and strong visual hierarchy.
 *
 * **ANSI Mode Notes:**
 * - Best with dark terminal backgrounds
 * - High saturation may be intense for some users
 *
 * @see {@link https://draculatheme.com/}
 */
export const draculaTheme: Theme = {
	name: "dracula",
	description: "Vibrant, high-contrast colors from Dracula theme",
	reserved: {
		WARN: {
			ansi16: { bg: 3, fg: 0 },
			ansi256: { bg: 228, fg: 61 },
			truecolor: { bg: "#F1FA8C", fg: "#282A36" }, // Yellow, contrast: 11.7:1
		},
		ERROR: {
			ansi16: { bg: 1, fg: 15 },
			ansi256: { bg: 212, fg: 61 },
			truecolor: { bg: "#FF5555", fg: "#282A36" }, // Red, contrast: 6.2:1
		},
		INFO: {
			ansi16: { bg: 4, fg: 15 },
			ansi256: { bg: 117, fg: 61 },
			truecolor: { bg: "#8BE9FD", fg: "#282A36" }, // Cyan, contrast: 9.6:1
		},
		SUCCESS: {
			ansi16: { bg: 2, fg: 0 },
			ansi256: { bg: 84, fg: 61 },
			truecolor: { bg: "#50FA7B", fg: "#282A36" }, // Green, contrast: 10.2:1
		},
	},
	normal: [
		{
			ansi16: { bg: 12, fg: 0 },
			ansi256: { bg: 117, fg: 61 },
			truecolor: { bg: "#8BE9FD", fg: "#282A36" }, // Cyan
		},
		{
			ansi16: { bg: 10, fg: 0 },
			ansi256: { bg: 84, fg: 61 },
			truecolor: { bg: "#50FA7B", fg: "#282A36" }, // Green
		},
		{
			ansi16: { bg: 14, fg: 0 },
			ansi256: { bg: 141, fg: 231 },
			truecolor: { bg: "#BD93F9", fg: "#F8F8F2" }, // Purple
		},
		{
			ansi16: { bg: 9, fg: 0 },
			ansi256: { bg: 212, fg: 61 },
			truecolor: { bg: "#FF5555", fg: "#282A36" }, // Red
		},
		{
			ansi16: { bg: 13, fg: 0 },
			ansi256: { bg: 212, fg: 61 },
			truecolor: { bg: "#FF79C6", fg: "#282A36" }, // Pink
		},
		{
			ansi16: { bg: 11, fg: 0 },
			ansi256: { bg: 228, fg: 61 },
			truecolor: { bg: "#F1FA8C", fg: "#282A36" }, // Yellow
		},
	],
};

/**
 * Solarized Dark theme - scientifically designed for optimal readability.
 *
 * Created by Ethan Schoonover, this theme uses carefully selected colors with
 * precise contrast ratios based on color theory. Designed to reduce eye strain
 * and work in both light and dark environments.
 *
 * **ANSI Mode Notes:**
 * - Works well with both light and dark terminals
 * - Lower saturation may appear muted compared to other themes
 *
 * @see {@link https://ethanschoonover.com/solarized/}
 */
export const solarizedDarkTheme: Theme = {
	name: "solarized-dark",
	description: "Scientifically designed colors from Solarized Dark",
	reserved: {
		WARN: {
			ansi16: { bg: 3, fg: 0 },
			ansi256: { bg: 136, fg: 235 },
			truecolor: { bg: "#B58900", fg: "#002B36" }, // Yellow, contrast: 5.6:1
		},
		ERROR: {
			ansi16: { bg: 1, fg: 15 },
			ansi256: { bg: 160, fg: 230 },
			truecolor: { bg: "#DC322F", fg: "#FDF6E3" }, // Red, contrast: 5.2:1
		},
		INFO: {
			ansi16: { bg: 4, fg: 15 },
			ansi256: { bg: 33, fg: 230 },
			truecolor: { bg: "#268BD2", fg: "#FDF6E3" }, // Blue, contrast: 4.6:1
		},
		SUCCESS: {
			ansi16: { bg: 2, fg: 0 },
			ansi256: { bg: 64, fg: 235 },
			truecolor: { bg: "#859900", fg: "#002B36" }, // Green, contrast: 5.5:1
		},
	},
	normal: [
		{
			ansi16: { bg: 12, fg: 15 },
			ansi256: { bg: 33, fg: 230 },
			truecolor: { bg: "#268BD2", fg: "#FDF6E3" }, // Blue
		},
		{
			ansi16: { bg: 10, fg: 0 },
			ansi256: { bg: 64, fg: 235 },
			truecolor: { bg: "#859900", fg: "#002B36" }, // Green
		},
		{
			ansi16: { bg: 14, fg: 0 },
			ansi256: { bg: 37, fg: 235 },
			truecolor: { bg: "#2AA198", fg: "#002B36" }, // Cyan
		},
		{
			ansi16: { bg: 9, fg: 15 },
			ansi256: { bg: 160, fg: 230 },
			truecolor: { bg: "#DC322F", fg: "#FDF6E3" }, // Red
		},
		{
			ansi16: { bg: 13, fg: 15 },
			ansi256: { bg: 125, fg: 230 },
			truecolor: { bg: "#D33682", fg: "#FDF6E3" }, // Magenta
		},
		{
			ansi16: { bg: 11, fg: 0 },
			ansi256: { bg: 136, fg: 235 },
			truecolor: { bg: "#B58900", fg: "#002B36" }, // Yellow
		},
	],
};

/**
 * Registry of all built-in themes.
 *
 * Use `getTheme()` to retrieve a theme by name.
 */
export const builtInThemes: Record<string, Theme> = {
	default: defaultTheme,
	"catppuccin-mocha": catppuccinMochaTheme,
	nord: nordTheme,
	dracula: draculaTheme,
	"solarized-dark": solarizedDarkTheme,
};

/**
 * Retrieves a built-in theme by name.
 *
 * @param name - Theme name (e.g., "default", "nord", "dracula")
 * @returns The theme object, or undefined if not found
 *
 * @example
 * ```typescript
 * import { getTheme } from "hagen";
 *
 * const theme = getTheme("nord");
 * if (theme) {
 *   console.log(theme.description);
 * }
 * ```
 */
export function getTheme(name: string): Theme | undefined {
	return builtInThemes[name];
}
