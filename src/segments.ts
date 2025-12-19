import { createAnsiFormatter, getColorFromLabel } from "./colors";
import type { InternalConfig } from "./config";
import { fixedWidthFormat, formatTimestamp } from "./format";
import type {
	AnsiFormatter,
	BaseLabel,
	Color,
	Label,
	LayoutItem,
	SegmentDefinition,
	SegmentType,
} from "./types";
import { SEPARATOR_CONFIG, TOKEN_CONFIG } from "./types";

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
 * Checks if a preset is a Powerline separator and returns its direction.
 */
export function getPowerlineDirection(preset: string): "left" | "right" | undefined {
	if (!preset.startsWith("%")) return undefined;
	const name = preset.slice(1);
	const entry = SEPARATOR_CONFIG.find(
		(c) => c.name === name || (c.aliases as readonly string[]).includes(name)
	);

	if (!entry) return undefined;

	if (entry.name.startsWith("pl-left")) {
		return "left";
	}
	if (entry.name.startsWith("pl-right")) {
		return "right";
	}

	// Double check aliases
	const allNames: string[] = [entry.name, ...entry.aliases];
	if (allNames.some((n) => n.includes("left") || n === "pl" || n === "pll" || n === "powerline")) {
		return "left";
	}
	if (allNames.some((n) => n.includes("right") || n === "plr")) {
		return "right";
	}

	return undefined;
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

		// Handle generic tokens from config
		const matchedTokenConfig = TOKEN_CONFIG.find((c) =>
			(c.aliases as readonly string[]).includes(token)
		);

		if (matchedTokenConfig) {
			result.push({ type: matchedTokenConfig.type });
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
			(type === "label" ? config.labelOptions?.fixedWidth : undefined),
		truncationMethod:
			def.truncationMethod ??
			configStyle.truncationMethod ??
			defaults.truncationMethod ??
			(type === "label" ? config.labelOptions?.truncationMethod : undefined),
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
	const fallback = config.labelOptions?.defaultText ?? "*";

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

	// It's a FormatterLabel or ColorLabel (both extend BaseLabel)
	const prefix = item.prefix ? `${item.prefix} ` : "";
	const content = (item.label as string | undefined) ?? fallback;
	const suffix = item.suffix ?? "";
	const text = prefix + content + suffix;

	if ("kind" in item && item.kind === "formatter") {
		return { text, customFormatter: item.ansiFormatter };
	}

	// It's a ColorLabel
	return {
		text,
		color: item.fgColor,
		bgColor: item.bgColor,
	};
}

/**
 * Step 1: Prepare a segment by resolving its content and styles.
 * This determines the final text and "intended" colors before any neighbor stitching.
 */
export function prepareSegment(item: LayoutItem, context: SegmentContext): PreparedSegment {
	// Handle string literals (separators)
	if (typeof item === "string") {
		return {
			text: getSeparatorGlyph(item),
			bgColor: undefined,
			fgColor: undefined,
			padding: 0,
			item,
		};
	}

	// Handle explicit separators
	if ("type" in item && item.type === "separator") {
		return {
			text: item.content ?? (item.preset ? getSeparatorGlyph(item.preset) : ""),
			bgColor: item.bgColor,
			fgColor: item.fgColor,
			padding: 0,
			item,
		};
	}

	// Handle SegmentDefinition
	const segmentDef = item;
	const style = resolveSegmentStyle(segmentDef.type, segmentDef, context.config);

	let text = "";
	let effectiveBg = style.bgColor;
	let effectiveFg = style.fgColor;
	let customFormatter = style.ansiFormatter;

	switch (segmentDef.type) {
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
		case "timestamp":
			text = formatTimestamp(context.config);
			break;
		case "icon": {
			const firstLabel = Array.isArray(context.label) ? context.label[0] : context.label;
			if (typeof firstLabel === "object" && firstLabel !== null && "prefix" in firstLabel) {
				text = (firstLabel as BaseLabel).prefix || "";
			}
			break;
		}
		case "message":
			// Message is handled elsewhere/later, but we still need a placeholder
			text = "";
			break;
	}

	// Apply fixed width
	if (style.fixedWidth) {
		text = fixedWidthFormat(text, style.fixedWidth, style.truncationMethod);
	}

	// Resolve auto-color for labels IF not explicitly set
	if (effectiveBg === undefined && segmentDef.type === "label") {
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
			bgColor: bgColor ?? null, // Default to transparent if still undefined
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
