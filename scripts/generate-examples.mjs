#!/usr/bin/env node

import hagen, { createHagen } from "../dist/index.mjs";

console.log("\n=== Basic Log Levels Example ===\n");

// General logging
hagen.log("API", "Request received for /api/users");

// Informational
hagen.info("AUTH", "Authentication required for this endpoint");

// Success
hagen.success("DB", "Database connection established");

// Warning
hagen.warn("CACHE", "Cache hit rate below 80%");

// Error
hagen.error("API", "Request failed", new Error("Timeout"));

console.log("\n=== With Timestamps ===\n");

const timestampLogger = createHagen({
	showTimestamp: true,
	dateFormat: "time",
	timeFormat: "12h",
});

timestampLogger.log("SERVER", "Server started on port 3000");
timestampLogger.info("CONFIG", "Configuration loaded");
timestampLogger.success("INIT", "Initialization complete");

console.log("\n=== Custom Colors ===\n");

// Color palette
hagen.log({ label: "CYAN", color: 0 }, "Cyan background");
hagen.log({ label: "MAGENTA", color: 1 }, "Magenta background");
hagen.log({ label: "BLUE", color: 2 }, "Blue background");
hagen.log({ label: "YELLOW", color: 3 }, "Yellow background");
hagen.log({ label: "GREEN", color: 4 }, "Green background");
hagen.log({ label: "RED", color: 5 }, "Red background");

console.log("\n=== Custom Hex Colors ===\n");

// Brand colors
hagen.log({ label: "PRIMARY", bgColor: "#3B82F6", fgColor: "#FFFFFF" }, "Primary brand color");
hagen.log({ label: "SUCCESS", bgColor: "#10B981", fgColor: "#FFFFFF" }, "Success state");
hagen.log({ label: "WARNING", bgColor: "#F59E0B", fgColor: "#000000" }, "Warning state");
hagen.log({ label: "DANGER", bgColor: "#EF4444", fgColor: "#FFFFFF" }, "Danger state");

console.log("\n=== Prefix and Suffix ===\n");

hagen.log({ label: "API", prefix: "→" }, "Arrow before label");
hagen.log({ label: "WORKER", prefix: ">>", suffix: "<<" }, "Custom brackets");
hagen.log({ label: "SUCCESS", prefix: "✨" }, "With emoji");

console.log("\n=== Fixed Width Labels ===\n");

const fixedLogger = createHagen({
	fixedWidth: { width: 12 },
});

fixedLogger.log("API", "Short label");
fixedLogger.log("DATABASE", "Medium label");
fixedLogger.log("X", "Tiny label");
fixedLogger.log("AUTHENTICATION", "Long label (truncated)");

console.log("\n=== Multiple Loggers ===\n");

const apiLogger = createHagen({
	showTimestamp: true,
	dateFormat: "time",
	labelPrefix: "[API]",
});

const dbLogger = createHagen({
	showTimestamp: true,
	dateFormat: "time",
	labelPrefix: "[DB]",
});

apiLogger.log("REQUEST", "Handling GET /api/users");
dbLogger.log("QUERY", "SELECT * FROM users");
apiLogger.success("RESPONSE", "Request completed");
dbLogger.success("RESULT", "Query returned 42 rows");

console.log("\n");
