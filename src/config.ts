/**
 * Configuration types and defaults for Hagen logger.
 */

import { Ansis } from "ansis";
import type { Layout, LayoutItem, LogLevelConfig, SegmentDefinition, SegmentType } from "./types";

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
	 * Configuration for specific log levels (info, warn, error, debug).
	 * Allows overriding colors, prefixes, suffixes, and default text.
	 */
	logLevels?: {
		info?: LogLevelConfig;
		warn?: LogLevelConfig;
		error?: LogLevelConfig;
		debug?: LogLevelConfig;
	};

	/**
	 * Whether to enable colored output.
	 * Automatically detects terminal color support.
	 */
	labelOptions?: {
		/** Fixed width configuration for labels */
		fixedWidth?: number;
		/** Where to truncate if label exceeds width */
		truncationMethod?: "start" | "end" | "middle";
		/**
		 * Default label to use when label is empty, undefined, or null.
		 * Default: "*"
		 */
		defaultText?: string;
	};

	colorOptions?: {
		/**
		 * Whether to enable colored output.
		 * Automatically detects terminal color support.
		 */
		enabled?: boolean;

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
	};

	timestampOptions?: {
		/**
		 * Date/time format for timestamps.
		 *
		 * Default: ISO 8601
		 *
		 * For complex formatting, use a custom function with your preferred library
		 * (e.g. date-fns, moment, or Intl.DateTimeFormat).
		 */
		formatter?: (date: Date) => string;
	};
}

/** Internal config with resolved defaults */
export interface InternalConfig extends LoggerConfig {
	/** Ansis instance for generating codes */
	ansisInstance: Ansis;
	layout: LayoutItem[];
	segmentStyles: Partial<Record<SegmentType, Partial<SegmentDefinition>>>;
	logLevels: {
		info: LogLevelConfig;
		warn: LogLevelConfig;
		error: LogLevelConfig;
		debug: LogLevelConfig;
	};
}

/** Default configuration values */
export const defaultConfig: LoggerConfig = {
	labelOptions: {
		defaultText: "*",
	},
	colorOptions: {
		paletteSize: undefined,
	},
	timestampOptions: {
		formatter: (date: Date) => date.toISOString(),
	},
	layout: "%l",
	segmentStyles: {},
	logLevels: {
		info: {
			prefix: "i",
			bgColor: "#4169E1", // Royal Blue
			fgColor: "#FFFFFF",
			defaultText: "INFO",
		},
		warn: {
			prefix: "!",
			bgColor: "#FFA500", // Orange
			fgColor: "#000000",
			defaultText: "WARN",
		},
		error: {
			prefix: "×",
			bgColor: "#DC143C", // Crimson
			fgColor: "#FFFFFF",
			defaultText: "ERROR",
		},
		debug: {
			prefix: "?",
			bgColor: "#e000dc",
			fgColor: "#000000",
			defaultText: "DEBUG",
		},
	},
};
