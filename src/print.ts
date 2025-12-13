/**
 * Print function for Hagen logger.
 * Handles the actual output of formatted labels and data.
 */

import ansis from "ansis";
import { isCI } from "std-env";
import { calculateLabelColor, createColorFormatter } from "./colors";
import type { InternalConfig } from "./config";
import { fixedWidthFormat, formatLabel, formatTimestamp } from "./format";
import type { ColorFormatter, Label } from "./types";

/** Parameters for the print function */
export interface PrintParams {
	logger: (...parameters: unknown[]) => void;
	label: Label;
	data: unknown[];
	config: InternalConfig;
}

/**
 * Prints the formatted label and data to the console.
 * @internal
 */
export function print({ logger, label, data, config }: PrintParams): void {
	let color: ColorFormatter;
	let finalLabel = config.defaultLabel ?? "";
	let customPrefix: string | undefined;
	let customSuffix: string | undefined;

	// Handle undefined, null, or non-object labels
	if (label === undefined || label === null || typeof label !== "object") {
		// For string labels, use them if non-empty, otherwise use default
		const labelText = typeof label === "string" ? label : "";
		finalLabel = labelText.trim() || finalLabel;
		color = calculateLabelColor(finalLabel, config.paletteSize);
	} else {
		// Object label
		const labelText = typeof label.label === "string" ? label.label : "";
		finalLabel = labelText.trim() || finalLabel;
		customPrefix = label.prefix;
		customSuffix = label.suffix;

		if ("bgColor" in label) {
			// Custom background color - optional custom foreground
			color = createColorFormatter(label.bgColor, label.fgColor, config.paletteSize);
		} else if (label.color !== undefined) {
			// Use provided ColorFormatter
			color = label.color;
		} else {
			color = calculateLabelColor(finalLabel, config.paletteSize);
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

	// Apply color (no bold to avoid bright color interpretation)
	finalLabel = color(` ${finalLabel} `);

	// Add border in CI mode
	if (isCI) {
		finalLabel = `[${finalLabel}]`;
	}

	// Add timestamp
	if (config.showTimestamp) {
		const timestamp = formatTimestamp(config);
		const timestampLabel = ansis.gray(`[ ${timestamp} ]`);
		finalLabel = `${finalLabel} ${timestampLabel}`;
	}

	logger(finalLabel, ...data);
}
