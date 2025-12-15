/**
 * Print function for Hagen logger.
 * Handles the actual output of formatted labels and data.
 */

import { createAnsiFormatter, getColorFromLabel } from "./colors";
import type { InternalConfig } from "./config";
import { fixedWidthFormat, formatLabel, formatTimestamp } from "./format";
import type { AnsiFormatter, Label } from "./types";
import { assertNever } from "./utils/assert-never";

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
	let color: AnsiFormatter;
	let finalLabel = config.defaultLabel ?? "";
	let customPrefix: string | undefined;
	let customSuffix: string | undefined;

	switch (true) {
		// if the label is undefined or null, use the default label
		case label === undefined:
		case label === null: {
			color = createAnsiFormatter({
				bgColor: getColorFromLabel(finalLabel),
				paletteSize: config.paletteSize,
				ansisInstance: config.ansisInstance,
				forceNoColor: !config.enableColor,
			});
			break;
		}

		// if the label is a string, use it as the label
		case typeof label === "string": {
			finalLabel = label.trim() || finalLabel;
			color = createAnsiFormatter({
				bgColor: getColorFromLabel(finalLabel),
				...(config.paletteSize !== undefined ? { paletteSize: config.paletteSize } : {}),
				ansisInstance: config.ansisInstance,
				forceNoColor: !config.enableColor,
			});
			break;
		}

		// if the label is an options object, extract the label, prefix, and suffix
		case typeof label === "object": {
			const labelText = typeof label.label === "string" ? label.label : "";
			finalLabel = labelText.trim() || finalLabel;
			customPrefix = label.prefix;
			customSuffix = label.suffix;

			const strategy = label.kind;

			switch (strategy) {
				// if the label options provide colors, create the ansi formatter
				case "color": {
					color = createAnsiFormatter({
						bgColor: label.bgColor ?? [0, 0, 0],
						fgColor: label.fgColor,
						paletteSize: config.paletteSize,
						ansisInstance: config.ansisInstance,
						forceNoColor: !config.enableColor,
					});
					break;
				}

				// if the label options provide a formatter, use it directly
				case "formatter": {
					color = label.ansiFormatter;
					break;
				}

				default:
					assertNever(strategy);
			}

			break;
		}

		default:
			assertNever(label);
	}

	// Apply formatting
	finalLabel = formatLabel({ labelText: finalLabel, customPrefix, customSuffix, config });

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
	} else {
		// Apply color
		finalLabel = color(` ${finalLabel} `);

		// Add timestamp
		if (config.showTimestamp) {
			const timestamp = formatTimestamp(config);
			const timestampLabel = config.ansisInstance.gray(`[ ${timestamp} ]`);
			finalLabel = `${finalLabel} ${timestampLabel}`;
		}

		logger(finalLabel, ...data);
	}
}
