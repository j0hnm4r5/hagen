import { createAnsiFormatter, getColorFromLabel } from "./colors";
import type { InternalConfig } from "./config";
import { fixedWidthFormat, formatTimestamp } from "./format";
import type {
	AnsiFormatter,
	Color,
	ColorLabel,
	FormatterLabel,
	Label,
	LayoutItem,
	SegmentDefinition,
	SegmentType,
} from "./types";
import { TOKEN_CONFIG } from "./types";

/**
 * Context for rendering a single segment.
 */
export interface SegmentContext {
	label: Label;
	data: unknown[];
	config: InternalConfig;
	segmentIndex: number;
	totalSegments: number;
	// Track label usage for %l slots
	labelIndex: number;
	incrementLabelIndex: () => void;
}

/**
 * Intermediate representation of a segment before final ANSI formatting.
 */
export interface PreparedSegment {
	text: string;
	bgColor: Color | undefined;
	fgColor: Color | undefined;
	padding: number;
	ansiFormatter?: AnsiFormatter | undefined;
	// Store original item for stitch phase (separators)
	item: LayoutItem;
}

/**
 * Default styles for each segment type.
 */
export const defaultSegmentStyles: Partial<Record<SegmentType, Partial<SegmentDefinition>>> = {
	label: {
		// No default bgColor means it falls back to auto-coloring
		padding: 1,
	},
	timestamp: {
		bgColor: undefined, // Transparent
		padding: 0,
	},
	message: {
		bgColor: undefined, // Transparent
		padding: 0,
	},
};

/**
 * Parses a template string layout into a LayoutItem array.
 */
export function parseTemplateLayout(template: string): LayoutItem[] {
	const result: LayoutItem[] = [];
	let currentIndex = 0;

	// Regex to capture % followed by word characters
	const regex = /%(?:[a-zA-Z0-9_-]+|%)/g;
	let match;

	while ((match = regex.exec(template)) !== null) {
		// Add text before the match as a literal string
		if (match.index > currentIndex) {
			result.push(template.slice(currentIndex, match.index));
		}

		const token = match[0];

		// Handle generic tokens from config
		const matchedTokenConfig = TOKEN_CONFIG.find((c) =>
			(c.aliases as readonly string[]).includes(token)
		);

		if (matchedTokenConfig) {
			result.push({ type: matchedTokenConfig.type });
		} else if (token === "%%") {
			result.push("%");
		} else {
			// Unknown token, keep as literal string
			result.push(token);
		}

		currentIndex = regex.lastIndex;
	}

	// Add remaining text
	if (currentIndex < template.length) {
		result.push(template.slice(Math.max(0, currentIndex)));
	}

	return result;
}

/**
 * Merges default styles, config styles, and segment definition styles.
 */
function resolveSegmentStyle(
	type: SegmentType,
	definition: SegmentDefinition,
	config: InternalConfig
): SegmentDefinition {
	const defaults = defaultSegmentStyles[type] || {};
	const configStyles = config.segmentStyles;
	const configStyle = configStyles[type] || {};

	return {
		type: definition.type,
		// Merge order: definition > config > default
		bgColor: definition.bgColor ?? configStyle.bgColor ?? defaults.bgColor ?? undefined,
		fgColor: definition.fgColor ?? configStyle.fgColor ?? defaults.fgColor ?? undefined,
		padding: definition.padding ?? configStyle.padding ?? defaults.padding ?? (type === "message" ? 0 : 0),
		fixedWidth:
			definition.fixedWidth ??
			configStyle.fixedWidth ??
			defaults.fixedWidth ??
			(type === "label" ? config.labelOptions?.fixedWidth : undefined),
		truncationMethod:
			definition.truncationMethod ??
			configStyle.truncationMethod ??
			defaults.truncationMethod ??
			(type === "label" ? config.labelOptions?.truncationMethod : undefined),
		ansiFormatter: definition.ansiFormatter ?? configStyle.ansiFormatter ?? defaults.ansiFormatter,
	};
}

/**
 * Resolve the actual text content for a label segment based on input.
 */
function resolveLabelContent(
	label: Label,
	index: number,
	config: InternalConfig
): {
	text: string;
	color?: Color | undefined;
	bgColor?: Color | undefined;
	customFormatter?: AnsiFormatter | undefined;
} {
	// Fallback text
	const fallback = config.labelOptions?.defaultText ?? "*";

	// Normalize to array
	const labels = (Array.isArray(label) ? label : [label]) as unknown[];

	// Get the item at index (or fallback)
	const rawItem = labels[index];

	if (rawItem === undefined || rawItem === null) {
		return { text: fallback };
	}

	if (typeof rawItem === "string") {
		return { text: rawItem };
	}

	// It's a FormatterLabel or ColorLabel (both extend BaseLabel)
	const item = rawItem as FormatterLabel | ColorLabel;
	const prefix = item.prefix ? `${item.prefix} ` : "";
	const content = item.label ?? fallback;
	const suffix = item.suffix ?? "";
	const text = prefix + content + suffix;

	if ("kind" in item && item.kind === "formatter") {
		return { text, customFormatter: item.ansiFormatter };
	}

	// It's a ColorLabel
	const colorLabel = item as ColorLabel;
	return {
		text,
		color: colorLabel.fgColor,
		bgColor: colorLabel.bgColor,
	};
}

/**
 * Step 1: Prepare a segment by resolving its content and styles.
 * This determines the final text and "intended" colors before any neighbor stitching.
 */
export function prepareSegment(item: LayoutItem, context: SegmentContext): PreparedSegment {
	// Handle string literals (e.g., " | ", powerline symbols, etc.)
	if (typeof item === "string") {
		return {
			text: item,
			bgColor: undefined,
			fgColor: undefined,
			padding: 0,
			item,
		};
	}

	// Handle SegmentDefinition
	const segmentDefinition = item;
	const style = resolveSegmentStyle(segmentDefinition.type, segmentDefinition, context.config);

	let text = "";
	let effectiveBg = style.bgColor;
	let effectiveFg = style.fgColor;
	let customFormatter = style.ansiFormatter;

	switch (segmentDefinition.type) {
		case "label": {
			const resolved = resolveLabelContent(context.label, context.labelIndex, context.config);
			text = resolved.text;

			if (style.bgColor === undefined && resolved.bgColor !== undefined) {
				effectiveBg = resolved.bgColor;
			}
			if (style.fgColor === undefined && resolved.color !== undefined) {
				effectiveFg = resolved.color;
			}
			if (resolved.customFormatter) customFormatter = resolved.customFormatter;

			context.incrementLabelIndex();
			break;
		}
		case "timestamp": {
			text = formatTimestamp(context.config);
			break;
		}
		case "message": {
			// Message is handled elsewhere/later, but we still need a placeholder
			text = "";
			break;
		}
	}

	// Apply fixed width
	if (style.fixedWidth) {
		text = fixedWidthFormat(text, style.fixedWidth, style.truncationMethod);
	}

	// Resolve auto-color for labels IF not explicitly set
	if (effectiveBg === undefined && segmentDefinition.type === "label") {
		effectiveBg = getColorFromLabel(text);
	}

	return {
		text,
		bgColor: effectiveBg,
		fgColor: effectiveFg,
		padding: style.padding ?? 0,
		ansiFormatter: customFormatter,
		item,
	};
}

/**
 * Step 2: Render a prepared segment into final ANSI string.
 */
export function renderPreparedSegment(prepared: PreparedSegment, config: InternalConfig): string {
	const { text, bgColor, fgColor, padding, ansiFormatter } = prepared;

	if (config.colorOptions?.enabled) {
		if (ansiFormatter) {
			const padded = " ".repeat(padding) + text + " ".repeat(padding);
			return ansiFormatter(padded);
		}

		const fmt = createAnsiFormatter({
			bgColor: bgColor ?? undefined, // Default to transparent if still undefined
			fgColor: fgColor,
			paletteSize: config.colorOptions.paletteSize,
			ansisInstance: config.ansisInstance,
			forceNoColor: false,
		});

		const padded = " ".repeat(padding) + text + " ".repeat(padding);
		return fmt(padded);
	}

	// No color mode
	return " ".repeat(padding) + text + " ".repeat(padding);
}

/**
 * Legacy single-pass renderer (now uses two-pass internally).
 */
export function renderSegment(item: LayoutItem, context: SegmentContext): string {
	const prepared = prepareSegment(item, context);
	return renderPreparedSegment(prepared, context.config);
}
