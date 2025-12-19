import hagen, { createHagen, type HagenInstance } from "../../index";

/**
 * Main entrance point for basic logging features
 */
export function test() {
	visualizeDefaultLoggers();
	visualizePaletteLabels();
	visualizeCustomColors();
	visualizeComplexContent();
	visualizeMultipleLabels();
	visualizeStylingTransparency();
	visualizeFixedWidth();
	visualizeGroups();
	visualizeQuantization();
	visualizeDefaultConfig();
	visualizeFixedWidthConfig();
	visualizeSpecialLabels();
	visualizeMultiLineContent();
	visualizeDataTypes();
	visualizeCustomColorsEdge();
	visualizeGroupsEdge();
	visualizeLogMethodErrorHandling();
	visualizeLayoutTemplates();
}

export function visualizeDefaultLoggers() {
	console.log("--- DEFAULT LOGGERS ---\n");

	hagen.log("Log", "This is a log message.");
	hagen.info("Info", "This is an info message.");
	hagen.error("Error", "This is an error message.");
	hagen.warn("Warn", "This is a warning message.");
	hagen.debug("Debug", "This is a debug message.");

	console.log();
}

export function visualizePaletteLabels() {
	console.log("--- CONSISTENT PALETTE LABELS ---\n");

	hagen.log("ABC", "This is a generated color.");
	hagen.log("XYZ", "This is a different generated color.");
	hagen.log("ABC", "This should be the same color as the first.");
	hagen.log("XYZ", "This should be the same color as the second.");

	console.log();
}

export function visualizeCustomColors() {
	console.log("--- CUSTOM COLORS ---\n");

	hagen.log(
		{ label: "Custom Hex", bgColor: "#c0ffee", fgColor: "#ac1d1c", kind: "color" },
		"This message has custom hex colors."
	);
	hagen.log(
		{ label: "Custom RGB", bgColor: [255, 100, 50], fgColor: [50, 100, 255], kind: "color" },
		"This message uses RGB tuples."
	);

	console.log();
}

export function visualizeComplexContent() {
	console.log("--- COMPLEX CONTENT ---\n");

	hagen.log("Multi-line", "This is a message\nwith\nmultiple lines.\n\n\nHere's another line.");
	hagen.log("", "Empty Label");

	console.log();
}

export function visualizeLayoutTemplates() {
	console.log("--- LAYOUT SYSTEM ---\n");

	let logger = createHagen({
		layout: "%l -> %m",
	});
	logger.log("Arrow", "Simple arrow layout");

	logger = createHagen({
		layout: "%t | %l | %m",
	});
	logger.log("Pipe", "Pipe layout with string literal separator");

	logger = createHagen({
		layout: "[%i] %l (%t): %m",
	});
	logger.info("Complex", "Layout with icon, timestamp, and styling");
	logger.error("Error", "Error with complex layout");

	logger = createHagen({
		layout: "%l %dot %l %dot %m",
	});
	logger.log(["Dot", "Dot Dot"], "Template string with %dot separator");

	logger = createHagen({
		layout: [
			{ type: "label", bgColor: "#333", fgColor: "#fff" },
			{ type: "separator", preset: "%pll", fgColor: "#333" },
			" ",
			{ type: "message" },
		],
		segmentStyles: {
			message: { padding: 0 },
		},
	});
	logger.log("Power", "Powerline style separator (Unicode fallback)");

	logger = createHagen({
		layout: [
			{ type: "separator", preset: "%pl-right-rounded" },
			{ type: "label", bgColor: "#00ffff" },
			{ type: "separator", preset: "%pl-left" },
			{ type: "label", bgColor: "#550055" },
			{ type: "separator", preset: "%pl-left-rounded" },
			{ type: "message" },
		],
	});
	logger.log(["Nerd", "Font"], "Built-in Nerd Font glyphs (will look broken if font missing)");

	logger = createHagen({
		layout: [
			{ type: "separator", content: "\ue0be", fgColor: "#ff00ff" },
			{ type: "label", bgColor: "#ff00ff" },
			{ type: "separator", content: "\ue0b1", bgColor: "#ff00ff" },
			{ type: "label", bgColor: "#ff00ff" },
			{ type: "separator", content: "\ue0b8", fgColor: "#ff00ff" },
			{ type: "message" },
		],
	});
	logger.log(["Nerd", "Font"], "Manual Nerd Font glyphs (may look broken if font missing)");

	logger = createHagen({
		layout: "%l %dot %l %dot %l %dot %m",
	});
	logger.log(
		["ABC", "DEF", "GHI"],
		"Hello!",
		12345,
		{ JKL: "MNO", PQR: "STU" },
		new Error("Test error")
	);

	console.log();
}

export function visualizeMultipleLabels() {
	console.log("--- MULTIPLE LABELS ---\n");

	const logger = createHagen({
		layout: "%l // %l -> %m",
	});
	logger.log(["API", "v1"], "Two labels provided");
	logger.log("Single", "One label provided (second is fallback)");

	console.log();
}

export function visualizeStylingTransparency() {
	console.log("--- STYLING & TRANSPARENCY ---\n");

	const logger = createHagen({
		layout: [
			{ type: "icon" },
			{ type: "label", bgColor: null, fgColor: "#FF00FF" },
			" : ",
			{ type: "message" },
		],
	});
	logger.info("Transp", "Icon with transparent label background");

	console.log();
}

export function visualizeFixedWidth() {
	console.log("--- FIXED WIDTH (Legacy) ---\n");

	let logger = createHagen({
		fixedWidth: {
			width: 12,
			truncationMethod: "end",
		},
	});
	logger.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "Width: 12; Truncation: end");

	logger = createHagen({
		fixedWidth: {
			width: 12,
			truncationMethod: "middle",
		},
	});
	logger.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "Width: 12; Truncation: middle");

	console.log();
}

export function visualizeGroups() {
	console.log("--- GROUPS ---\n");

	console.group();
	hagen.log(`LEVEL 1`);
	console.group();
	hagen.log(`LEVEL 2`);
	console.groupEnd();
	console.groupEnd();

	console.log();
}

/**
 * Visualize palette quantization at different sizes
 */
export function visualizeQuantization() {
	console.log("--- PALETTE QUANTIZATION ---\n");

	const loggers = [
		{ name: "Full", instance: createHagen() },
		{ name: "216", instance: createHagen({ paletteSize: 216 }) },
		{ name: "64", instance: createHagen({ paletteSize: 64 }) },
		{ name: "27", instance: createHagen({ paletteSize: 27 }) },
		{ name: "8", instance: createHagen({ paletteSize: 8 }) },
	];

	const comparePalettes = (header: string, action: (logger: HagenInstance) => void) => {
		console.log(`${header}:`);
		for (const { name, instance } of loggers) {
			console.log(`  ${name.padEnd(10)}`);
			action(instance);
		}
		console.log();
	};

	console.log("--- SPECIALIZED LOGGERS ---\n");

	comparePalettes("INFO", (l) => {
		l.info("Info", "Information message");
	});
	comparePalettes("WARN", (l) => {
		l.warn("Warning", "Warning message");
	});
	comparePalettes("ERROR", (l) => {
		l.error("Error", "Error message");
	});

	console.log("--- NORMAL PALETTE COLORS ---\n");

	const testLabels = ["API", "Server"];
	for (const label of testLabels) {
		comparePalettes(label, (logger) => {
			logger.log(label, "Test message");
		});
	}

	console.log();
}

export function visualizeDefaultConfig() {
	console.log("--- DEFAULT ---\n");

	const logger = createHagen();
	logger.info("Info", "Information message");
	logger.warn("Warning", "Warning message");
	logger.error("Error", "Error message");
	logger.log("API", "Regular log message");

	console.log();
}

export function visualizeFixedWidthConfig() {
	console.log("--- FIXED WIDTH (12 chars) ---\n");

	const logger = createHagen({
		fixedWidth: { width: 12, truncationMethod: "middle" },
	});
	logger.log("API", "Short label");
	logger.log("VeryLongLabelName", "Long label truncated");
	logger.log("ABCDEFGHIJKLMNOP", "Very long label");

	console.log();
}

export function visualizeSpecialLabels() {
	console.log("--- SPECIAL LABELS ---\n");

	let logger = createHagen();
	logger.log(null, "Null label (defaults to *)");
	logger.log(undefined, "Undefined label (defaults to *)");

	logger = createHagen({ defaultLabelText: "@" });
	logger.log(null, "Null label (custom fallback)");

	logger = createHagen();
	logger.log("", "Empty label");
	logger.log("   ", "Whitespace label");
	logger.log("M", "Single character");
	logger.log("🚀", "Emoji label");
	logger.log("👨🏻‍👩🏻‍👧🏻", "ZWJ Sequence Emoji label");

	console.log();
}

export function visualizeMultiLineContent() {
	console.log("--- MULTI-LINE CONTENT ---\n");

	const logger = createHagen();
	logger.log("Multi", "Line 1\nLine 2\nLine 3");
	logger.log("Multi", "First line\n\nThird line (blank in between)");
	logger.log("Multi", "ABCDEFGHIJKLMNOP\n   QRSTUVWXYZ\n1234567890");

	console.log();
}

export function visualizeDataTypes() {
	console.log("--- DATA TYPES ---\n");

	const logger = createHagen();
	logger.log("Object", { key: "value", nested: { deep: true } });
	logger.log("Array", [1, 2, 3, "four", { five: 5 }]);
	logger.log("Error", new Error("Example error object"));
	logger.log("Function", () => "Function value");
	logger.log("Mixed", "String", 42, { obj: true }, [1, 2, 3]);

	console.log();
}

export function visualizeCustomColorsEdge() {
	console.log("--- CUSTOM COLORS ---\n");

	const logger = createHagen();
	logger.log(
		{ kind: "color", label: "Hex BG", bgColor: "#ff00ff", fgColor: "#ffffff" },
		"Hex color background"
	);
	logger.log(
		{ kind: "color", label: "RGB Tuple", bgColor: [255, 100, 50], fgColor: [0, 0, 0] },
		"RGB tuple colors"
	);
	logger.log(
		{ kind: "color", label: "Mixed", bgColor: "#0000ff", fgColor: [255, 255, 0] },
		"Hex BG + RGB FG"
	);
	logger.log(
		{ kind: "color", label: "ABCDEF", bgColor: null, fgColor: "#ff0000" },
		"Transparent BG (red text)"
	);
	logger.log({ kind: "color", label: "ABCDEF", bgColor: null }, "Transparent BG (default text)");
	logger.log(
		{ kind: "color", label: "ABCDEF", bgColor: null, fgColor: null },
		"Transparent BG + Invisible Text"
	);
	logger.log(
		{ kind: "color", label: "ABCDEF", bgColor: undefined, fgColor: undefined },
		"Undefined BG (auto color)"
	);

	console.log();
}

export function visualizeGroupsEdge() {
	console.log("--- CONSOLE GROUPS ---\n");

	const logger = createHagen();
	logger.log("Level 0", "Root level");
	console.group();
	logger.log("Level 1", "Indented once");
	console.group();
	logger.log("Level 2", "Indented twice");
	console.groupEnd();
	logger.log("Level 1", "Back to level 1");
	console.groupEnd();
	logger.log("Level 0", "Back to root");

	console.log();
}

export function visualizeLogMethodErrorHandling() {
	console.log("--- LOG METHOD ERROR HANDLING ---\n");

	const logger = createHagen();
	const testLogMethodVariants = (
		levelName: string,
		logMethod: (label: any, ...args: any[]) => void
	) => {
		logMethod(undefined, `Testing ${levelName} with undefined label`);
		logMethod("CustomError", `Testing ${levelName} with custom label`);
		logMethod(
			{ label: "ColorError", bgColor: "#ff0000", fgColor: "#ffffff", kind: "color" },
			`Testing ${levelName} with custom colors`
		);
	};

	testLogMethodVariants("error", logger.error);
	testLogMethodVariants("warn", logger.warn);
	testLogMethodVariants("info", logger.info);
	testLogMethodVariants("debug", logger.debug);

	console.log();
}
