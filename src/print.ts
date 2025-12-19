/**
 * Print function for Hagen logger.
 * Handles the actual output of formatted labels and data.
 */

import type { InternalConfig } from "./config";
import {
	parseTemplateLayout,
	prepareSegment,
	renderPreparedSegment,
	type SegmentContext,
} from "./segments";
import { type Label, TOKEN_CONFIG } from "./types";

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

	// Prepare segments (resolve content and colors)
	const preparedSegments = layoutItems.map((item, i) => {
		context.segmentIndex = i;
		return prepareSegment(item, context);
	});

	// Check if the layout contains the message token
	const messageAliases = TOKEN_CONFIG.find((t) => t.type === "message")?.aliases || [];
	const hasMessageToken = layoutItems.some(
		(item) =>
			(typeof item === "string" && (messageAliases as readonly string[]).includes(item)) ||
			(typeof item === "object" && item.type === "message")
	);

	let finalLabel: string;

	if (hasMessageToken) {
		// Re-render, but this time we substitute the format string for the message segment
		let dataIndex = 0;
		finalLabel = preparedSegments
			.map((ps) => {
				const isMessage =
					(typeof ps.item === "string" &&
						(messageAliases as readonly string[]).includes(ps.item)) ||
					(typeof ps.item === "object" && "type" in ps.item && ps.item.type === "message");

				if (isMessage) {
					if (dataIndex >= data.length) return ""; // No more data to show

					const arg = data[dataIndex];
					dataIndex++;

					// Use %s for strings to avoid quotes, %o for everything else
					return typeof arg === "string" ? "%s" : "%o";
				}
				return renderPreparedSegment(ps, config);
			})
			.join("");

		logger(finalLabel, ...data);
	} else {
		finalLabel = preparedSegments.map((ps) => renderPreparedSegment(ps, config)).join("");
		logger(finalLabel, ...data);
	}
}
