/**
 * Logger factory for Hagen.
 * Creates logger instances with configurable options.
 */

import ansis, { Ansis } from "ansis";
import { generateReservedColors } from "./colors";
import { defaultConfig, type InternalConfig, type LoggerConfig } from "./config";
import { formatLabel } from "./format";
import { print } from "./print";
import type { AnsiFormatter, ColorLabel, FormatterLabel, HagenInstance, Label } from "./types";

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
 * // Create logger with quantized colors (for limited color terminals)
 * const logger = createHagen({ paletteSize: 216 });
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
/**
 * Determines effective color support based on user preference and terminal capabilities
 */
function determineColorSupport(userSetting?: boolean): boolean {
	// User explicitly disabled colors
	if (userSetting === false) {
		return false;
	}

	// User explicitly enabled colors, but terminal doesn't support them
	if (userSetting === true && !ansis.isSupported()) {
		return false; // Force no-color mode regardless of user preference
	}

	// Default to automatic detection
	return ansis.isSupported();
}

export function createHagen(config?: Partial<LoggerConfig>): HagenInstance {
	// Merge with defaults
	const mergedConfig: LoggerConfig = { ...defaultConfig, ...config };

	// Determine final color support
	const enableColor = determineColorSupport(mergedConfig.enableColor);

	// Create appropriate ansis instance
	// Use the same ansis instance but handle no-color mode in formatters
	const ansisInstance = enableColor ? new Ansis() : new Ansis(0);

	const instanceConfig: InternalConfig = {
		...mergedConfig,
		enableColor: enableColor, // Final resolved value
		ansisInstance,
		colors: {
			reserved: generateReservedColors(mergedConfig.paletteSize, ansisInstance, !enableColor),
		},
	};

	// Helper to create common label logic
	const createProcessedLabel = (
		label: Label,
		defaultPrefix: string,
		defaultFormatter: AnsiFormatter
	): Label => {
		if (label === undefined || label === null || typeof label === "string") {
			const labelText = typeof label === "string" ? label : "";
			return {
				kind: "formatter",
				label: formatLabel(labelText, defaultPrefix, undefined, instanceConfig),
				ansiFormatter: defaultFormatter,
			};
		}

		// Handle object labels
		if (label.kind === "color") {
			return {
				kind: "color",
				label: formatLabel(
					label.label,
					label.prefix ?? defaultPrefix,
					label.suffix,
					instanceConfig
				),
				...(label.bgColor ? { bgColor: label.bgColor } : {}),
				...(label.fgColor ? { fgColor: label.fgColor } : {}),
			};
		} else if (label.kind === "formatter") {
			return {
				kind: "formatter",
				label: formatLabel(
					label.label,
					label.prefix ?? defaultPrefix,
					label.suffix,
					instanceConfig
				),
				ansiFormatter: label.ansiFormatter,
			};
		} else {
			// Fallback for objects that might be missing 'kind' (backward compatibility or loose types)
			// checking for properties to guess
			if ("bgColor" in label || "fgColor" in label) {
				return {
					kind: "color",
					label: formatLabel(
						label.label,
						label.prefix ?? defaultPrefix,
						label.suffix,
						instanceConfig
					),
					...((label as ColorLabel).bgColor ? { bgColor: (label as ColorLabel).bgColor } : {}),
					...((label as ColorLabel).fgColor ? { fgColor: (label as ColorLabel).fgColor } : {}),
				};
			}

			return {
				kind: "formatter",
				label: formatLabel(
					label.label,
					label.prefix ?? defaultPrefix,
					label.suffix,
					instanceConfig
				),
				ansiFormatter: (label as FormatterLabel).ansiFormatter,
			};
		}
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
		const processedLabel = createProcessedLabel(label, "i", instanceConfig.colors.reserved.INFO);

		print({
			logger: console.log,
			label: processedLabel,
			data,
			config: instanceConfig,
		});
	};

	const warn = (label: Label, ...data: unknown[]): void => {
		const processedLabel = createProcessedLabel(label, "!", instanceConfig.colors.reserved.WARN);

		print({
			logger: console.warn,
			label: processedLabel,
			data,
			config: instanceConfig,
		});
	};

	const error = (label: Label, ...data: unknown[]): void => {
		const processedLabel = createProcessedLabel(label, "✕", instanceConfig.colors.reserved.ERROR);

		print({
			logger: console.error,
			label: processedLabel,
			data,
			config: instanceConfig,
		});
	};

	const debug = (label: Label, ...data: unknown[]): void => {
		const processedLabel = createProcessedLabel(label, "?", instanceConfig.colors.reserved.DEBUG);

		print({
			logger: console.debug,
			label: processedLabel,
			data,
			config: instanceConfig,
		});
	};

	return { log, info, warn, error, debug };
}
