/**
 * Formatting utilities for Hagen logger.
 * Handles label formatting, fixed width, and timestamps.
 */

import type { LoggerConfig } from "./config";

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
export function fixedWidthFormat(
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
export function formatTimestamp(config: LoggerConfig): string {
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
 * @internal
 */
export function formatLabel(
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
