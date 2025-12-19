/**
 * Print function for Hagen logger.
 * Handles the actual output of formatted labels and data.
 */

import type { InternalConfig } from "./config";
import {
	getPowerlineDirection,
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

	// Pass 1: Preparation (resolve content and basic colors)
	const preparedSegments = layoutItems.map((item, i) => {
		context.segmentIndex = i;
		return prepareSegment(item, context);
	});

	// Pass 2: Stitching (resolve Powerline colors based on neighbors)
	for (let i = 0; i < preparedSegments.length; i++) {
		const current = preparedSegments[i]!;
		const item = current.item;

		// We only stitch explicit separators with Powerline presets
		if (typeof item === "object" && "type" in item && item.type === "separator" && item.preset) {
			const direction = getPowerlineDirection(item.preset);

			if (direction) {
				const prev = preparedSegments[i - 1];
				const next = preparedSegments[i + 1];

				if (direction === "left") {
					// Left-pointing (e.g. \ue0b0):
					// FG color comes from previous segment's background
					// BG color comes from next segment's background
					if (prev?.bgColor !== undefined) {
						current.fgColor = prev.bgColor;
					}
					if (next?.bgColor !== undefined) {
						current.bgColor = next.bgColor;
					}
				} else {
					// Right-pointing (e.g. \ue0b2):
					// FG color comes from next segment's background
					// BG color comes from previous segment's background
					if (next?.bgColor !== undefined) {
						current.fgColor = next.bgColor;
					}
					if (prev?.bgColor !== undefined) {
						current.bgColor = prev.bgColor;
					}
				}
			}
		}
	}

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
