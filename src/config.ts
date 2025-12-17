/**
 * Configuration types and defaults for Hagen logger.
 */

import ansis, { Ansis } from "ansis";

/**
 * Configuration options for Hagen logger instances.
 *
 * @example
 * ```typescript
 * import { createHagen } from "hagen";
 *
 * const logger = createHagen({
 *   showTimestamp: true,
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
	 * Automatically detects terminal color support.
	 * Can be explicitly overridden to force enable/disable colors.
	 * Default: true if terminal supports colors, false otherwise
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
	 * - Custom function: (date) => string
	 *
	 * For complex formatting, use a custom function with your preferred library
	 * (e.g. date-fns, moment, or Intl.DateTimeFormat).
	 *
	 * Default: "iso"
	 */
	timestampFormatter?: (date: Date) => string;

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
	 * Default: "*"
	 */
	defaultLabelText?: string;
}

/** Internal config with resolved color formatters */

/** Internal config with resolved color formatters */
export interface InternalConfig extends LoggerConfig {
	ansisInstance: Ansis;
	colors?: unknown;
}

/**
 * Default configuration for Hagen instances.
 *
 * This configuration is used when no custom config is provided to createHagen().
 * Colors are automatically enabled based on terminal color support detection.
 *
 * @example
 * ```typescript
 * import { defaultConfig } from "hagen";
 *
 * // Inspect default settings
 * console.log(defaultConfig.showTimestamp); // false
 * console.log(defaultConfig.enableColor); // true if terminal supports colors
 * ```
 */
export const defaultConfig: LoggerConfig = {
	showTimestamp: false,
	enableColor: ansis.isSupported(),
	defaultLabelText: "*",
};
