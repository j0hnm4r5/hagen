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

	// Check if we actually replaced the message token
	// We need to know if the layout CONTAINED %m
	const hasMessageToken = layoutItems.some(
		(item) =>
			item === "%m" || item === "%message" || (typeof item === "object" && item.type === "message")
	);

	let finalLabel: string;

	if (hasMessageToken) {
		// Re-render, but this time we substitute the format string for the message segment
		// Wait, I can just map and join.
		finalLabel = preparedSegments
			.map((ps) => {
				const isMessage =
					ps.item === "%m" ||
					ps.item === "%message" ||
					(typeof ps.item === "object" && "type" in ps.item && ps.item.type === "message");

				if (isMessage) {
					if (data.length === 0) return "";
					// Use %s for strings to avoid quotes, %o for everything else
					return data.map((arg) => (typeof arg === "string" ? "%s" : "%o")).join(" ");
				}
				return renderPreparedSegment(ps, config);
			})
			.join("");

		// Substituted logic: logger(format, ...args)
		logger(finalLabel, ...data);
	} else {
		// Legacy logic: logger(label, ...args)
		finalLabel = preparedSegments.map((ps) => renderPreparedSegment(ps, config)).join("");
		logger(finalLabel, ...data);
	}
}
