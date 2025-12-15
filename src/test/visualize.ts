import hagen, { createHagen } from "../index";

export function test() {
	// Test reserved colors
	hagen.info("Info", "This is an info message.");

	hagen.error("Error", "This is an error message.");

	// Test with consistent palette labels
	hagen.log("API", "API endpoint called successfully.");
	hagen.log("Database", "Database connection established.");
	hagen.log("Server", "Server is running on port 3000.");
	hagen.log("Client", "Client request received.");
	hagen.log("Worker", "Background worker processing task.");
	hagen.log("Queue", "Message added to queue.");

	// Test custom colors
	hagen.log(
		{ label: "Custom RGB", bgColor: "#c0ffee", fgColor: "#bada55" },
		"This message has custom RGB colors."
	);
	hagen.log(
		{ label: "Custom Tuple", bgColor: [255, 100, 50], fgColor: [50, 200, 255] },
		"This message uses RGB tuples."
	);

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

	// Test with timestamp instance
	const timestampLogger = createHagen({
		showTimestamp: true,
	});
	timestampLogger.log("Timestamp", "This message includes a timestamp.");

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

	const loggerFull = createHagen(); // Full color (no quantization)
	const logger216 = createHagen({ paletteSize: 216 }); // 6×6×6 cube
	const logger64 = createHagen({ paletteSize: 64 }); // 4×4×4 cube
	const logger27 = createHagen({ paletteSize: 27 }); // 3×3×3 cube
	const logger8 = createHagen({ paletteSize: 8 }); // 2×2×2 cube

	// Test reserved colors
	console.log("--- RESERVED COLORS ---\n");

	console.log("INFO:");
	console.log("  Full:     ");
	loggerFull.info("Info", "Information message");
	console.log("  216:      ");
	logger216.info("Info", "Information message");
	console.log("  64:       ");
	logger64.info("Info", "Information message");
	console.log("  27:       ");
	logger27.info("Info", "Information message");
	console.log("  8:        ");
	logger8.info("Info", "Information message");
	console.log();

	console.log("WARN:");
	console.log("  Full:     ");
	loggerFull.warn("Warning", "Warning message");
	console.log("  216:      ");
	logger216.warn("Warning", "Warning message");
	console.log("  64:       ");
	logger64.warn("Warning", "Warning message");
	console.log("  27:       ");
	logger27.warn("Warning", "Warning message");
	console.log("  8:        ");
	logger8.warn("Warning", "Warning message");
	console.log();

	console.log("ERROR:");
	console.log("  Full:     ");
	loggerFull.error("Error", "Error message");
	console.log("  216:      ");
	logger216.error("Error", "Error message");
	console.log("  64:       ");
	logger64.error("Error", "Error message");
	console.log("  27:       ");
	logger27.error("Error", "Error message");
	console.log("  8:        ");
	logger8.error("Error", "Error message");
	console.log();

	// Test normal palette colors
	console.log("--- NORMAL PALETTE COLORS ---\n");

	const testLabels = ["API", "Database", "Server", "Client", "Worker", "Queue"];

	for (const label of testLabels) {
		console.log(`${label}:`);
		console.log("  Full:     ");
		loggerFull.log(label, "Test message");
		console.log("  216:      ");
		logger216.log(label, "Test message");
		console.log("  64:       ");
		logger64.log(label, "Test message");
		console.log("  27:       ");
		logger27.log(label, "Test message");
		console.log("  8:        ");
		logger8.log(label, "Test message");
		console.log();
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
	logger.log("", "Empty label");
	logger.log("   ", "Whitespace label");
	logger.log("M", "Single character");
	logger.log("🚀", "Emoji label");
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
	logger.log({ label: "Hex BG", bgColor: "#ff6b6b", fgColor: "#c0ffee" }, "Hex color background");
	logger.log(
		{ label: "RGB Tuple", bgColor: [107, 203, 119], fgColor: [200, 255, 0] },
		"RGB tuple colors"
	);
	logger.log({ label: "Mixed", bgColor: "#4ecdc4", fgColor: [123, 0, 255] }, "Hex BG + RGB FG");
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
}
