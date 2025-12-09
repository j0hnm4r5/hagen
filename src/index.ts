/**
 * A colorful logger for JS in Node and in the Browser
 *
 * Named after Hagen the colorful Lumberjack from Synthie Forest
 * https://vimeo.com/90995716
 */

import { Chalk, type ChalkInstance } from "chalk";
import { isCI } from "std-env";

// ========= TYPES =========

/**
 * Label configuration for log messages.
 *
 * Labels can be specified in three ways:
 * 1. Simple string: `"API"` - uses automatic color selection
 * 2. Object with color index: `{ label: "API", color: 3 }` - uses specific color from palette
 * 3. Object with hex colors: `{ label: "API", bgColor: "#ff0000", fgColor: "#ffffff" }` - custom colors
 *
 * @example
 * ```typescript
 * // Simple string label
 * logger.log("API", "Request received");
 *
 * // Label with color index (0-5)
 * logger.log({ label: "DB", color: 2 }, "Query executed");
 *
 * // Label with custom hex colors
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
 *   enableColor: true
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

	/** Color schemes for different log types */
	colors: {
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

// Lazy Chalk initialization
let chalkInstance: InstanceType<typeof Chalk> | undefined;
function getChalk(): InstanceType<typeof Chalk> {
	if (!chalkInstance) {
		chalkInstance = new Chalk({ level: isCI ? 0 : 3 });
	}
	return chalkInstance;
}

/**
 * Default configuration for Hagen instances.
 *
 * This configuration is used when no custom config is provided to createHagen().
 * Colors are automatically disabled in CI environments.
 *
 * @example
 * ```typescript
 * import { defaultConfig } from "hagen";
 *
 * // Inspect default settings
 * console.log(defaultConfig.showTimestamp); // false
 * console.log(defaultConfig.dateFormat); // "iso"
 * ```
 */
export const defaultConfig: LoggerConfig = {
	showTimestamp: false,
	enableColor: !isCI,
	colors: {
		reserved: {
			WARN: getChalk().bgYellowBright.black,
			ERROR: getChalk().bgRedBright.black,
			INFO: getChalk().bgBlack.white,
			SUCCESS: getChalk().bgBlack.greenBright,
		},
		normal: [
			getChalk().bgBlue.white, // blue
			getChalk().bgGreen.black, // green
			getChalk().bgCyan.black, // cyan
			getChalk().bgRed.white, // red
			getChalk().bgMagenta.white, // magenta
			getChalk().bgYellow.black, // yellow
		],
	},
	dateFormat: "iso",
	timeFormat: "24h",
	defaultLabel: "■",
};

// ========= HELPERS =========

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
	let finalLabel = config.defaultLabel ?? "■";
	let customPrefix: string | undefined;
	let customSuffix: string | undefined;

	// Handle undefined, null, or non-object labels
	if (label === undefined || label === null || typeof label !== "object") {
		// For string labels, use them if non-empty, otherwise use default
		const labelText = typeof label === "string" ? label : "";
		finalLabel = labelText.trim() || finalLabel;
		color = calculateLabelColor(finalLabel, config.colors.normal);
	} else {
		// Object label
		const labelText = typeof label.label === "string" ? label.label : "";
		finalLabel = labelText.trim() || finalLabel;
		customPrefix = label.prefix;
		customSuffix = label.suffix;

		if ("color" in label && label.color) {
			if (typeof label.color === "number") {
				color = config.colors.normal[label.color]!;
			} else {
				color = label.color;
			}
		} else if ("bgColor" in label && "fgColor" in label) {
			color = getChalk().bgHex(label.bgColor).hex(label.fgColor);
		} else {
			color = calculateLabelColor(finalLabel, config.colors.normal);
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
	const instanceConfig: LoggerConfig = { ...defaultConfig, ...config };

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
