/**
 * Configuration types and defaults for Hagen logger.
 */

import { isCI } from "std-env";
import type { ColorFormatter } from "./types";

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
 *   enableColor: true,
 *   paletteSize: 256
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

	/**
	 * Palette size for color quantization.
	 *
	 * When specified, colors are quantized to this many distinct colors.
	 * The quantization divides each RGB channel into equal steps.
	 *
	 * Common values:
	 * - 8: Very limited palette (2 levels per channel)
	 * - 27: 3×3×3 cube
	 * - 64: 4×4×4 cube
	 * - 216: 6×6×6 cube (similar to ANSI-256 color cube)
	 * - undefined: No quantization (full 24-bit color)
	 *
	 * Default: undefined (no quantization)
	 */
	paletteSize?: number;

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
	 * Default: "·"
	 */
	defaultLabel?: string;
}

/** Internal config with resolved color formatters */
export interface InternalConfig extends LoggerConfig {
	colors: {
		reserved: {
			WARN: ColorFormatter;
			ERROR: ColorFormatter;
			INFO: ColorFormatter;
			SUCCESS: ColorFormatter;
		};
	};
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
 * console.log(defaultConfig.enableColor); // true (false in CI)
 * ```
 */
export const defaultConfig: LoggerConfig = {
	showTimestamp: false,
	enableColor: !isCI,
	dateFormat: "iso",
	timeFormat: "24h",
	defaultLabel: "·",
};
