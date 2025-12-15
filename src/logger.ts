/**
 * Logger factory for Hagen.
 * Creates logger instances with configurable options.
 */

import ansis, { Ansis } from "ansis";
import { generateReservedColors } from "./colors";
import { defaultConfig, type InternalConfig, type LoggerConfig } from "./config";
import { formatLabel } from "./format";
import { print } from "./print";
import type { AnsiFormatter, HagenInstance, Label } from "./types";
import { assertNever } from "./utils/assert-never";

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
 *   showTimestamp: true,
 *   dateFormat: "iso"
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
		switch (true) {
			case label === undefined:
			case label === null: {
				return {
					kind: "formatter",
					label: formatLabel({
						labelText: "",
						customPrefix: defaultPrefix,
						customSuffix: undefined,
						config: instanceConfig,
					}),
					ansiFormatter: defaultFormatter,
				};
			}

			case typeof label === "string": {
				return {
					kind: "formatter",
					label: formatLabel({
						labelText: label,
						customPrefix: defaultPrefix,
						customSuffix: undefined,
						config: instanceConfig,
					}),
					ansiFormatter: defaultFormatter,
				};
			}

			case typeof label === "object": {
				const strategy = label.kind;

				switch (strategy) {
					case "color": {
						return {
							kind: "color",
							label: formatLabel({
								labelText: label.label,
								customPrefix: label.prefix ?? defaultPrefix,
								customSuffix: label.suffix,
								config: instanceConfig,
							}),
							bgColor: label.bgColor,
							fgColor: label.fgColor,
						};
					}

					case "formatter": {
						return {
							kind: "formatter",
							label: formatLabel({
								labelText: label.label,
								customPrefix: label.prefix ?? defaultPrefix,
								customSuffix: label.suffix,
								config: instanceConfig,
							}),
							ansiFormatter: label.ansiFormatter,
						};
					}

					default:
						return assertNever(strategy);
				}
			}

			default:
				return assertNever(label);
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

	const error = (label: Label, ...data: unknown[]): void => {
		const processedLabel = createProcessedLabel(label, "×", instanceConfig.colors.reserved.ERROR);

		print({
			logger: console.error,
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

	const info = (label: Label, ...data: unknown[]): void => {
		const processedLabel = createProcessedLabel(label, "i", instanceConfig.colors.reserved.INFO);

		print({
			logger: console.info,
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

	return { log, error, warn, info, debug };
}
