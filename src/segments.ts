import { createAnsiFormatter, getColorFromLabel } from "./colors";
import type { InternalConfig } from "./config";
import { fixedWidthFormat, formatTimestamp } from "./format";
import type {
	AnsiFormatter,
	Color,
	Label,
	LayoutItem,
	SegmentDefinition,
	SegmentType,
} from "./types";
import { SEPARATOR_CONFIG } from "./types";

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
 * Default styles for each segment type.
 */
export const defaultSegmentStyles: Partial<Record<SegmentType, Partial<SegmentDefinition>>> = {
	icon: {
		bgColor: null, // Transparent
		padding: 0,
	},
	label: {
		// No default bgColor means it falls back to auto-coloring
		padding: 1,
	},
	timestamp: {
		bgColor: null, // Transparent
		fgColor: "#888888", // Gray
		padding: 0,
	},
	message: {
		bgColor: null, // Transparent
		padding: 0,
	},
};

/**
 * Get the glyph for a separator preset.
 * If the input doesn't start with %, it's returned as-is (literal).
 * If the input starts with % but isn't a known preset, it's also returned as-is.
 */
export function getSeparatorGlyph(preset: string): string {
	if (!preset.startsWith("%")) {
		return preset;
	}

	const searchName = preset.slice(1);
	const entry = SEPARATOR_CONFIG.find(
		(c) => c.name === searchName || (c.aliases as readonly string[]).includes(searchName)
	);

	if (!entry) {
		return preset;
	}

	return entry.symbol;
}

/**
 * Parses a template string layout into a LayoutItem array.
 */
export function parseTemplateLayout(template: string): LayoutItem[] {
	const result: LayoutItem[] = [];
	let currentIndex = 0;

	// Improved regex to capture % followed by word characters or specific alias symbols
	const regex = /%(?:[a-zA-Z0-9_-]+|->|>>|%)/g;
	let match;

	while ((match = regex.exec(template)) !== null) {
		// Add text before the match as a literal string separator
		if (match.index > currentIndex) {
			result.push(template.substring(currentIndex, match.index));
		}

		const token = match[0];
		if (token === "%l" || token === "%label") {
			result.push({ type: "label" });
		} else if (token === "%t" || token === "%timestamp") {
			result.push({ type: "timestamp" });
		} else if (token === "%m" || token === "%message") {
			result.push({ type: "message" });
		} else if (token === "%i" || token === "%icon") {
			result.push({ type: "icon" });
		} else if (token === "%%") {
			result.push("%");
		} else {
			// It might be a separator preset like %dot or %pl-left
			// We store it as a string literal and let renderSegment resolve it
			result.push(token);
		}

		currentIndex = regex.lastIndex;
	}

	// Add remaining text
	if (currentIndex < template.length) {
		result.push(template.substring(currentIndex));
	}

	return result;
}

/**
 * Merges default styles, config styles, and segment definition styles.
 */
function resolveSegmentStyle(
	type: SegmentType,
	def: SegmentDefinition,
	config: InternalConfig
): SegmentDefinition {
	const defaults = defaultSegmentStyles[type] || {};
	const configStyles = config.segmentStyles;
	const configStyle = configStyles[type] || {};

	return {
		type: def.type,
		// Merge order: definition > config > default
		bgColor: def.bgColor ?? configStyle.bgColor ?? defaults.bgColor ?? undefined,
		fgColor: def.fgColor ?? configStyle.fgColor ?? defaults.fgColor ?? undefined,
		padding: def.padding ?? configStyle.padding ?? defaults.padding ?? (type === "message" ? 0 : 0),
		fixedWidth:
			def.fixedWidth ??
			configStyle.fixedWidth ??
			defaults.fixedWidth ??
			(type === "label" ? config.fixedWidth?.width : undefined),
		truncationMethod:
			def.truncationMethod ??
			configStyle.truncationMethod ??
			defaults.truncationMethod ??
			(type === "label" ? config.fixedWidth?.truncationMethod : undefined),
		ansiFormatter: def.ansiFormatter ?? configStyle.ansiFormatter ?? defaults.ansiFormatter,
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
	const fallback = config.defaultLabelText ?? "*";

	// Normalize to array
	const labels = Array.isArray(label) ? label : [label];

	// Get the item at index (or fallback)
	const item = labels[index];

	if (item === undefined || item === null) {
		return { text: fallback };
	}

	if (typeof item === "string") {
		return { text: item };
	}

	// It's a FormatterLabel or ColorLabel
	if (item.kind === "formatter") {
		return { text: item.label, customFormatter: item.ansiFormatter };
	}

	return {
		text: item.label,
		color: item.fgColor,
		bgColor: item.bgColor,
	};
}

/**
 * Renders a single segment.
 * Returns the fully formatted ANSI string.
 */
export function renderSegment(item: LayoutItem, context: SegmentContext): string {
	// Handle string literals (separators)
	if (typeof item === "string") {
		return getSeparatorGlyph(item);
	}

	// Handle explicit separators
	if ("type" in item && item.type === "separator") {
		const glyph = item.content ?? (item.preset ? getSeparatorGlyph(item.preset) : "");

		if (context.config.enableColor && (item.fgColor || item.bgColor)) {
			const fmt = createAnsiFormatter({
				bgColor: item.bgColor,
				fgColor: item.fgColor,
				paletteSize: context.config.paletteSize,
				ansisInstance: context.config.ansisInstance,
				forceNoColor: false,
			});
			return fmt(glyph);
		}

		return glyph;
	}

	// It's a SegmentDefinition
	// Double check type just to be safe if TS isn't sure, but LayoutItem union should ensure it.
	if (!("type" in item)) {
		return "";
	}

	const segmentDef = item;
	const style = resolveSegmentStyle(segmentDef.type, segmentDef, context.config);

	// Determine content
	let text = "";
	let effectiveBg = style.bgColor;
	let effectiveFg = style.fgColor;
	let customFormatter = style.ansiFormatter;

	switch (segmentDef.type) {
		case "label": {
			const resolved = resolveLabelContent(context.label, context.labelIndex, context.config);
			text = resolved.text;

			// However, explicit transparency in segment (null) should NOT be overridden by label color.
			// So we only override if segment style is undefined.
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
		case "timestamp":
			text = formatTimestamp(context.config);
			break;
		case "icon":
			{
				const firstLabel = Array.isArray(context.label) ? context.label[0] : context.label;
				if (typeof firstLabel === "object" && firstLabel && "prefix" in firstLabel) {
					text = firstLabel.prefix || "";
				} else {
					text = "";
				}
			}
			break;
		case "message":
			return "";
	}

	// Apply strict fixed width
	if (style.fixedWidth) {
		text = fixedWidthFormat(text, style.fixedWidth, style.truncationMethod);
	}

	// Formatting with ANSI
	if (context.config.enableColor) {
		if (customFormatter) {
			const padding = style.padding || 0;
			const padded = " ".repeat(padding) + text + " ".repeat(padding);
			return customFormatter(padded);
		}

		const fmt = createAnsiFormatter({
			bgColor:
				effectiveBg === undefined
					? segmentDef.type === "label"
						? getColorFromLabel(text)
						: null
					: effectiveBg,
			fgColor: effectiveFg,
			paletteSize: context.config.paletteSize,
			ansisInstance: context.config.ansisInstance,
			forceNoColor: false,
		});

		const padding = style.padding || 0;
		const padded = " ".repeat(padding) + text + " ".repeat(padding);
		return fmt(padded);
	} else {
		// No color
		const padding = style.padding || 0;
		return " ".repeat(padding) + text + " ".repeat(padding);
	}
}
