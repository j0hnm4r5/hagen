import hagen, { createHagen, type HagenInstance } from "../../index";

export function test() {
	console.log("\n═══════════════════════════════════════════════════════════");
	console.log("  BASIC LOGGING FEATURES");
	console.log("═══════════════════════════════════════════════════════════\n");

	// Test specialized loggers
	console.log("--- SPECIALIZED LOGGERS ---\n");
	hagen.log("Log", "This is a log message.");
	hagen.info("Info", "This is an info message.");
	hagen.error("Error", "This is an error message.");
	hagen.warn("Warn", "This is a warning message.");
	hagen.debug("Debug", "This is a debug message.");

	// Test with consistent palette labels
	console.log("\n--- CONSISTENT PALETTE LABELS ---\n");
	hagen.log("API", "API endpoint called successfully.");
	hagen.log("API", "Database connection established.");
	hagen.log("Server", "Server is running on port 3000.");
	hagen.log("Server", "Client request received.");
	hagen.log("Worker", "Background worker processing task.");
	hagen.log("Worker", "Message added to queue.");

	// Test custom colors
	console.log("\n--- CUSTOM COLORS ---\n");
	hagen.log(
		{ label: "Custom RGB", bgColor: "#c0ffee", fgColor: "#bada55", kind: "color" },
		"This message has custom RGB colors."
	);
	hagen.log(
		{ label: "Custom Tuple", bgColor: [255, 100, 50], fgColor: [50, 200, 255], kind: "color" },
		"This message uses RGB tuples."
	);

	console.log("\n--- COMPLEX CONTENT ---\n");
	hagen.log("Multi-line", "This is a message\nwith\nmultiple lines.\n\n\nHere's another line.");

	hagen.log("", "Empty Label");

	hagen.log(
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ultrices ligula porta lobortis blandit. Phasellus blandit felis dolor, id commodo ipsum molestie vel. Pellentesque lobortis enim id risus porttitor porttitor. Nunc facilisis dolor sed felis ultrices, eget molestie quam ultrices. Vivamus semper nibh ut sollicitudin luctus. Donec a lacus aliquam, sollicitudin ex et, mollis elit. Etiam velit odio, placerat ut libero id, elementum sodales dui. Donec a pharetra urna. Proin ac rutrum ante. Quisque vel molestie erat, sit amet efficitur nibh. Sed pretium elit at ligula hendrerit iaculis.",
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ultrices ligula porta lobortis blandit. Phasellus blandit felis dolor, id commodo ipsum molestie vel. Pellentesque lobortis enim id risus porttitor porttitor. Nunc facilisis dolor sed felis ultrices, eget molestie quam ultrices. Vivamus semper nibh ut sollicitudin luctus. Donec a lacus aliquam, sollicitudin ex et, mollis elit. Etiam velit odio, placerat ut libero id, elementum sodales dui. Donec a pharetra urna. Proin ac rutrum ante. Quisque vel molestie erat, sit amet efficitur nibh. Sed pretium elit at ligula hendrerit iaculis."
	);

	hagen.log("Object", { key: "value", number: 42, array: [1, 2, 3] });
	hagen.log("Array", [1, 2, 3, "four", { key: "value" }]);
	hagen.log("Function", () => "This is a message from a function.");
	hagen.log("Error", new Error("This is an error message."));

	hagen.log("Multiple", "New error found:", new Error("Hello, world!"));
	hagen.log("Multiple", 1, "TWO", { three: 4 }, [5, 6, 7], new Error("eight"));

	console.log("\n--- TIMESTAMPS ---\n");
	// Test with timestamp instance
	const timestampLogger = createHagen({
		showTimestamp: true,
	});
	timestampLogger.log("Timestamp", "This message includes a timestamp.");

	console.log("\n--- FIXED WIDTH ---\n");
	// Test fixed width - end truncation
	const fixedWidthEnd = createHagen({
		fixedWidth: {
			width: 12,
			truncationMethod: "end",
		},
	});
	fixedWidthEnd.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "Width: 12; Truncation: end");

	// Test fixed width - middle truncation
	const fixedWidthMiddle = createHagen({
		fixedWidth: {
			width: 12,
			truncationMethod: "middle",
		},
	});
	fixedWidthMiddle.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "Width: 12; Truncation: middle");

	// Test fixed width - start truncation
	const fixedWidthStart = createHagen({
		fixedWidth: {
			width: 12,
			truncationMethod: "start",
		},
	});
	fixedWidthStart.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "Width: 12; Truncation: start");

	console.log("\n--- GROUPS ---\n");
	console.group();
	hagen.log(`LEVEL 1`);
	console.group();
	hagen.log(`LEVEL 2`);
	console.groupEnd();
	console.groupEnd();
}

/**
 * Visualize palette quantization at different sizes
 */
export function visualizeQuantization() {
	console.log("\n═══════════════════════════════════════════════════════════");
	console.log("  PALETTE QUANTIZATION: Same colors at different palette sizes");
	console.log("═══════════════════════════════════════════════════════════\n");

	// Creates loggers for different palette sizes
	const loggers = [
		{ name: "Full", instance: createHagen() },
		{ name: "216", instance: createHagen({ paletteSize: 216 }) },
		{ name: "64", instance: createHagen({ paletteSize: 64 }) },
		{ name: "27", instance: createHagen({ paletteSize: 27 }) },
		{ name: "8", instance: createHagen({ paletteSize: 8 }) },
	];

	// Helper to run action across all palette sizes
	const comparePalettes = (header: string, action: (l: HagenInstance) => void) => {
		console.log(`${header}:`);
		for (const { name, instance } of loggers) {
			console.log(`  ${name.padEnd(10)}`);
			action(instance);
		}
		console.log();
	};

	// Test specialized loggers
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

	// Test normal palette colors
	console.log("--- NORMAL PALETTE COLORS ---\n");

	const testLabels = ["API", "Server"];

	for (const label of testLabels) {
		comparePalettes(label, (l) => {
			l.log(label, "Test message");
		});
	}

	console.log("═══════════════════════════════════════════════════════════\n");
}

/**
 * Visualize different configuration options
 */
export function visualizeConfigurations() {
	console.log("\n═══════════════════════════════════════════════════════════");
	console.log("  CONFIGURATION OPTIONS: Different visual styles");
	console.log("═══════════════════════════════════════════════════════════\n");

	// Default
	console.log("--- DEFAULT ---\n");
	const defaultLogger = createHagen();
	defaultLogger.info("Info", "Information message");

	defaultLogger.warn("Warning", "Warning message");
	defaultLogger.error("Error", "Error message");
	defaultLogger.log("API", "Regular log message");
	console.log();

	// Timestamp enabled
	console.log("--- WITH TIMESTAMPS ---\n");
	const timestampLogger = createHagen({ showTimestamp: true });
	timestampLogger.info("Info", "Information message");

	timestampLogger.warn("Warning", "Warning message");
	timestampLogger.error("Error", "Error message");
	timestampLogger.log("API", "Regular log message");
	console.log();

	// Fixed width variations
	console.log("--- FIXED WIDTH (12 chars) ---\n");
	const fixedWidthLogger = createHagen({
		fixedWidth: { width: 12, truncationMethod: "middle" },
	});
	fixedWidthLogger.log("API", "Short label");
	fixedWidthLogger.log("VeryLongLabelName", "Long label truncated");
	fixedWidthLogger.log("ABCDEFGHIJKLMNOP", "Very long label");
	console.log();

	// With prefix/suffix
	console.log("--- WITH PREFIX/SUFFIX ---\n");
	const prefixLogger = createHagen({ labelPrefix: ">>", labelSuffix: "<<" });
	prefixLogger.log("API", "With prefix and suffix");
	prefixLogger.info("Info", "Info with prefix and suffix");
	console.log();

	console.log("═══════════════════════════════════════════════════════════\n");
}

/**
 * Visualize edge cases and special scenarios
 */
export function visualizeEdgeCases() {
	const logger = createHagen();

	console.log("\n═══════════════════════════════════════════════════════════");
	console.log("  EDGE CASES: Special scenarios and corner cases");
	console.log("═══════════════════════════════════════════════════════════\n");

	// Empty and special labels
	console.log("--- SPECIAL LABELS ---\n");
	logger.log(null, "Null label");
	logger.log(undefined, "Undefined label");
	logger.log("", "Empty label");
	logger.log("   ", "Whitespace label");
	logger.log("M", "Single character");
	logger.log("🚀", "Emoji label");
	logger.log("👨🏻‍👩🏻‍👧🏻", "ZWJ Sequence Emoji label");
	console.log();

	// Multi-line content
	console.log("--- MULTI-LINE CONTENT ---\n");
	logger.log("Multi", "Line 1\nLine 2\nLine 3");
	logger.log("Multi", "First line\n\nThird line (blank in between)");
	logger.log(
		"Multi",
		`ABCDEFGHIJKLMNOP
   QRSTUVWXYZ
1234567890`
	);

	console.log();

	// Different data types
	console.log("--- DATA TYPES ---\n");
	logger.log("Object", { key: "value", nested: { deep: true } });
	logger.log("Array", [1, 2, 3, "four", { five: 5 }]);
	logger.log("Error", new Error("Example error object"));
	logger.log("Function", () => "Function value");
	logger.log("Mixed", "String", 42, { obj: true }, [1, 2, 3]);
	console.log();

	// Custom colors - RGB tuples vs hex
	console.log("--- CUSTOM COLORS ---\n");
	logger.log(
		{
			kind: "color",
			label: "Hex BG",
			bgColor: "#ff00ff",
			fgColor: "#ffffff",
		},
		"Hex color background"
	);
	logger.log(
		{
			kind: "color",
			label: "RGB Tuple",
			bgColor: [0, 255, 0],
			fgColor: [0, 0, 0],
		},
		"RGB tuple colors"
	);
	logger.log(
		{
			kind: "color",
			label: "Mixed",
			bgColor: "#0000ff",
			fgColor: [255, 255, 0],
		},
		"Hex BG + RGB FG"
	);
	logger.log(
		{
			kind: "color",
			label: "ABCDEF",
			bgColor: null,
			fgColor: "#ff0000",
		},
		"Transparent BG (red text)"
	);
	logger.log(
		{
			kind: "color",
			label: "ABCDEF",
			bgColor: null,
		},
		"Transparent BG (default text)"
	);
	logger.log(
		{
			kind: "color",
			label: "ABCDEF",
			bgColor: null,
			fgColor: null,
		},
		"Transparent BG + Invisible Text"
	);
	logger.log(
		{
			kind: "color",
			label: "ABCDEF",
			bgColor: undefined,
			fgColor: undefined,
		},
		"Undefined BG (auto color)"
	);
	console.log();

	// Console groups
	console.log("--- CONSOLE GROUPS ---\n");
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

	console.log("═══════════════════════════════════════════════════════════\n");

	// Test edge cases for a specific log method
	const testLogMethodVariants = (
		levelName: string,
		logMethod: (label: any, ...args: any[]) => void
	) => {
		logMethod(undefined, `Testing ${levelName} with undefined label`);
		// logMethod(null, ...) - removed as it's redundant with undefined behavior
		logMethod("CustomError", `Testing ${levelName} with custom label`);
		logMethod(
			{ label: "ColorError", bgColor: "#ff0000", fgColor: "#ffffff", kind: "color" },
			`Testing ${levelName} with custom colors`
		);
	};

	console.log("--- LOG METHOD ERROR HANDLING ---\n");

	testLogMethodVariants("error", logger.error);
	testLogMethodVariants("warn", logger.warn);
	testLogMethodVariants("info", logger.info);
	testLogMethodVariants("debug", logger.debug);
}
