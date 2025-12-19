/**
 * Logger factory for Hagen.
 * Creates logger instances with configurable options.
 */

import ansis, { Ansis } from "ansis";
import { defaultConfig, type InternalConfig, type LoggerConfig } from "./config";

import { print } from "./print";
import type { Color, HagenInstance, Label } from "./types";

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
 * // Create logger with custom layout including timestamps
 * const logger = createHagen({
 *   layout: "[%t] %l %m"
 * });
 *
 * logger.log("API", "Request received");
 * logger.info("AUTH", "User logged in");
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
 * // Create multiple independent loggers with custom layouts
 * const apiLogger = createHagen({ layout: "[API] %l %m" });
 * const dbLogger = createHagen({ layout: "[DB] %l %m" });
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

	// Determine final layout
	let finalLayout = mergedConfig.layout ?? (defaultConfig.layout as string);

	// Apply brackets for colorless mode if not already present
	if (!enableColor && typeof finalLayout === "string") {
		if (finalLayout.includes("%l") && !finalLayout.includes("[%l]")) {
			finalLayout = finalLayout.replace("%l", "[%l]");
		}
		if (finalLayout.includes("%t") && !finalLayout.includes("[%t]")) {
			finalLayout = finalLayout.replace("%t", "[%t]");
		}
	}

	const instanceConfig: InternalConfig = {
		...mergedConfig,
		enableColor: enableColor, // Final resolved value
		ansisInstance,
		layout: finalLayout,
		segmentStyles: mergedConfig.segmentStyles || {},
	};

	// Helper to create common label logic
	const buildSpecializedLabel = (
		label: Label,
		defaults: {
			prefix: string;
			bgColor: Color;
			fgColor: Color;
			defaultText: string;
		}
	): Label => {
		// If it's an object, we just return it (it already has its own colors/labels)
		if (typeof label === "object" && label !== null) {
			return label;
		}

		// Wrap string/null/undefined in a ColorLabel with the specialized styling
		return {
			kind: "color",
			label: typeof label === "string" ? label : defaults.defaultText,
			prefix: defaults.prefix,
			bgColor: defaults.bgColor,
			fgColor: defaults.fgColor,
		};
	};

	const log = (label: Label, ...data: unknown[]): void => {
		print({
			logger: console.log,
			label: label,
			data,
			config: instanceConfig,
		});
	};

	const error = (label: Label, ...data: unknown[]): void => {
		const resolvedLabel = buildSpecializedLabel(label, {
			prefix: "×",
			bgColor: "#DC143C", // Crimson
			fgColor: "#FFFFFF",
			defaultText: "ERROR",
		});
		print({
			logger: console.error,
			label: resolvedLabel,
			data,
			config: instanceConfig,
		});
	};

	const warn = (label: Label, ...data: unknown[]): void => {
		const resolvedLabel = buildSpecializedLabel(label, {
			prefix: "!",
			bgColor: "#FFA500", // Orange
			fgColor: "#000000",
			defaultText: "WARN",
		});
		print({
			logger: console.warn,
			label: resolvedLabel,
			data,
			config: instanceConfig,
		});
	};

	const info = (label: Label, ...data: unknown[]): void => {
		const resolvedLabel = buildSpecializedLabel(label, {
			prefix: "i",
			bgColor: "#4169E1", // Royal Blue
			fgColor: "#FFFFFF",
			defaultText: "INFO",
		});
		print({
			logger: console.info,
			label: resolvedLabel,
			data,
			config: instanceConfig,
		});
	};

	const debug = (label: Label, ...data: unknown[]): void => {
		const resolvedLabel = buildSpecializedLabel(label, {
			prefix: "?",
			bgColor: "#e000dc",
			fgColor: "#000000",
			defaultText: "DEBUG",
		});
		print({
			logger: console.debug,
			label: resolvedLabel,
			data,
			config: instanceConfig,
		});
	};

	return { log, error, warn, info, debug };
}
