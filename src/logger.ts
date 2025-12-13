/**
 * Logger factory for Hagen.
 * Creates logger instances with configurable options.
 */

import { generateReservedColors } from "./colors";
import { defaultConfig, type InternalConfig, type LoggerConfig } from "./config";
import { formatLabel } from "./format";
import { print } from "./print";
import type { HagenInstance, Label } from "./types";

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
export function createHagen(config?: Partial<LoggerConfig>): HagenInstance {
	// Merge with defaults
	const mergedConfig: LoggerConfig = { ...defaultConfig, ...config };

	// Generate colors with optional quantization
	const colors = generateReservedColors(mergedConfig.paletteSize);

	const instanceConfig: InternalConfig = {
		...mergedConfig,
		colors: { reserved: colors },
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
				color: instanceConfig.colors.reserved.INFO,
			};
		} else if ("bgColor" in label) {
			processedLabel = {
				label: formatLabel(label.label, label.prefix ?? "i", label.suffix, instanceConfig),
				bgColor: label.bgColor,
			};
		} else {
			processedLabel = {
				label: formatLabel(label.label, label.prefix ?? "i", label.suffix, instanceConfig),
				color: label.color ?? instanceConfig.colors.reserved.INFO,
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
		} else if ("bgColor" in label) {
			processedLabel = {
				label: formatLabel(label.label, label.prefix ?? "✓", label.suffix, instanceConfig),
				bgColor: label.bgColor,
			};
		} else {
			processedLabel = {
				label: formatLabel(label.label, label.prefix ?? "✓", label.suffix, instanceConfig),
				color: label.color ?? instanceConfig.colors.reserved.SUCCESS,
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
		} else if ("bgColor" in label) {
			processedLabel = {
				label: formatLabel(label.label, label.prefix ?? "!", label.suffix, instanceConfig),
				bgColor: label.bgColor,
			};
		} else {
			processedLabel = {
				label: formatLabel(label.label, label.prefix ?? "!", label.suffix, instanceConfig),
				color: label.color ?? instanceConfig.colors.reserved.WARN,
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
		} else if ("bgColor" in label) {
			processedLabel = {
				label: formatLabel(label.label, label.prefix ?? "✕", label.suffix, instanceConfig),
				bgColor: label.bgColor,
			};
		} else {
			processedLabel = {
				label: formatLabel(label.label, label.prefix ?? "✕", label.suffix, instanceConfig),
				color: label.color ?? instanceConfig.colors.reserved.ERROR,
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
