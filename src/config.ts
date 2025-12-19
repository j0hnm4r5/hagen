/**
 * Configuration types and defaults for Hagen logger.
 */

import { Ansis } from "ansis";
import type { Layout, SegmentDefinition, SegmentType } from "./types";

/**
 * Configuration options for Hagen logger instances.
 */
export interface LoggerConfig {
	/**
	 * Output segment layout.
	 *
	 * Can be a template string or an array of segments.
	 * Default: "%l %m"
	 */
	layout?: Layout;

	/**
	 * Default styles for each segment type.
	 * Merged with per-segment overrides.
	 */
	segmentStyles?: Partial<Record<SegmentType, Partial<SegmentDefinition>>>;

	/**
	 * Whether to enable colored output.
	 * Automatically detects terminal color support.
	 */
	enableColor?: boolean;

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
	paletteSize?: number | undefined;

	/** Fixed width configuration for labels */
	fixedWidth?: {
		/** Target width in characters */
		width: number;
		/** Where to truncate if label exceeds width */
		truncationMethod?: "start" | "end" | "middle";
	};

	/**
	 * Date/time format for timestamps.
	 *
	 * Default: ISO 8601
	 *
	 * For complex formatting, use a custom function with your preferred library
	 * (e.g. date-fns, moment, or Intl.DateTimeFormat).
	 */
	timestampFormatter?: (date: Date) => string;

	/**
	 * Default label to use when label is empty, undefined, or null.
	 * Default: "*"
	 */
	defaultLabelText?: string;
}

/** Internal config with resolved defaults */
export interface InternalConfig extends LoggerConfig {
	/** Ansis instance for generating codes */
	ansisInstance: Ansis;
	layout: Layout;
	segmentStyles: Partial<Record<SegmentType, Partial<SegmentDefinition>>>;
}

/** Default configuration values */
export const defaultConfig: LoggerConfig = {
	paletteSize: undefined,
	timestampFormatter: (date: Date) => date.toISOString(),
	defaultLabelText: "*",
	layout: "%l",
	segmentStyles: {},
};
