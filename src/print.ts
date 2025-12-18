/**
 * Print function for Hagen logger.
 * Handles the actual output of formatted labels and data.
 */

import type { InternalConfig } from "./config";
import { parseTemplateLayout, renderSegment, type SegmentContext } from "./segments";
import type { Label } from "./types";

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
	const layoutInput = config.layout;
	const layoutItems =
		typeof layoutInput === "string" ? parseTemplateLayout(layoutInput) : layoutInput;

	const context: SegmentContext = {
		label,
		data,
		config,
		segmentIndex: 0,
		totalSegments: layoutItems.length,
		labelIndex: 0,
		incrementLabelIndex: () => {
			context.labelIndex++;
		},
	};

	const parts: string[] = [];

	for (let i = 0; i < layoutItems.length; i++) {
		context.segmentIndex = i;
		parts.push(renderSegment(layoutItems[i]!, context));
	}

	// Join parts
	const finalLabel = parts.join("");

	// Log with data
	logger(finalLabel, ...data);
}
