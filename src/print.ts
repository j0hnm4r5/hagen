/**
 * Print function for Hagen logger.
 * Handles the actual output of formatted labels and data.
 */

import { calculateLabelColor, createAnsiFormatter } from "./colors";
import type { InternalConfig } from "./config";
import { fixedWidthFormat, formatLabel, formatTimestamp } from "./format";
import type { AnsiFormatter, Color, Label } from "./types";

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
		case label === undefined:
		case label === null: {
			color = calculateLabelColor({
				label: finalLabel,
				paletteSize: config.paletteSize,
				ansisInstance: config.ansisInstance,
				forceNoColor: !config.enableColor,
			});
			break;
		}
		case typeof label === "string": {
			finalLabel = label.trim() || finalLabel;
			color = calculateLabelColor({
				label: finalLabel,
				paletteSize: config.paletteSize,
				ansisInstance: config.ansisInstance,
				forceNoColor: !config.enableColor,
			});
			break;
		}
		case typeof label === "object": {
			const labelText = typeof label.label === "string" ? label.label : "";
			finalLabel = labelText.trim() || finalLabel;
			customPrefix = label.prefix;
			customSuffix = label.suffix;

			const { kind } = label;
			switch (kind) {
				case "color":
					color = createAnsiFormatter(
						label.bgColor ?? [0, 0, 0], // Fallback if undefined (should be caught by type check if strict)
						label.fgColor,
						config.paletteSize,
						config.ansisInstance,
						!config.enableColor
					);
					break;
				case "formatter":
					color = label.ansiFormatter;
					break;
				default:
					// Check for loose object types (backward compatibility or missing kind)
					if ("bgColor" in label || "fgColor" in label) {
						color = createAnsiFormatter(
							((label as { bgColor?: unknown }).bgColor as Color | undefined) ?? [0, 0, 0],
							(label as { fgColor?: unknown }).fgColor as Color | undefined,
							config.paletteSize,
							config.ansisInstance,
							!config.enableColor
						);
					} else if ("ansiFormatter" in label) {
						color = (label as { ansiFormatter: AnsiFormatter }).ansiFormatter;
					} else {
						// Fallback to calculating from label text
						color = calculateLabelColor({
							label: finalLabel,
							paletteSize: config.paletteSize,
							ansisInstance: config.ansisInstance,
							forceNoColor: !config.enableColor,
						});
					}
					break;
			}
			break;
		}
		default:
			// Should be unreachable
			color = calculateLabelColor({
				label: finalLabel,
				paletteSize: config.paletteSize,
				ansisInstance: config.ansisInstance,
				forceNoColor: !config.enableColor,
			});
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
