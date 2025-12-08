/**
 * Code examples for interactive REPL terminals
 * These match the exact code shown in documentation
 */

export interface Example {
	id: string;
	code: string;
	description: string;
}

export const examples: Record<string, Example> = {
	// Quick Start - basic usage
	"quick-start-basic": {
		id: "quick-start-basic",
		description: "Basic usage showing all five log levels",
		code: `import hagen from "hagen";

// General logging (auto-colored label)
hagen.log("APP", "Application starting...");

// Informational (blue with 'i' prefix)
hagen.info("CONFIG", "Loaded configuration from env");

// Success (green with '✓' prefix)
hagen.success("DB", "Database connection established");

// Warning (yellow with '!' prefix, uses console.warn)
hagen.warn("CACHE", "Cache size exceeding threshold");

// Error (red with '✕' prefix, uses console.error)
hagen.error("API", "Request failed", new Error("Timeout"));`,
	},

	// Log Levels - all levels
	"log-levels-all": {
		id: "log-levels-all",
		description: "All five log levels with distinct colors and prefix icons",
		code: `import hagen from "hagen";

hagen.log("LABEL", "General logging");      // Auto-colored
hagen.info("LABEL", "Informational");       // Blue with 'i'
hagen.success("LABEL", "Success message");  // Green with '✓'
hagen.warn("LABEL", "Warning message");     // Yellow with '!'
hagen.error("LABEL", "Error message");      // Red with '✕'`,
	},

	// Log Levels - log
	"log-levels-log": {
		id: "log-levels-log",
		description: "Log method with auto-colored labels",
		code: `import hagen from "hagen";

hagen.log("API", "Request received");
hagen.log("CACHE", "Cache hit for key: user_123");
hagen.log("WORKER", "Processing job", "job_456");`,
	},

	// Log Levels - info
	"log-levels-info": {
		id: "log-levels-info",
		description: "Info method with blue labels and 'i' prefix",
		code: `import hagen from "hagen";

hagen.info("CONFIG", "Loaded configuration from env");
hagen.info("AUTH", "User authentication required");
hagen.info("SYSTEM", "Service started on port 3000");`,
	},

	// Log Levels - success
	"log-levels-success": {
		id: "log-levels-success",
		description: "Success method with green labels and checkmark prefix",
		code: `import hagen from "hagen";

hagen.success("DB", "Database connection established");
hagen.success("API", "Request completed successfully");
hagen.success("AUTH", "User logged in");`,
	},

	// Log Levels - warn
	"log-levels-warn": {
		id: "log-levels-warn",
		description: "Warn method with yellow labels and exclamation prefix",
		code: `import hagen from "hagen";

hagen.warn("CACHE", "Cache size exceeding 80% capacity");
hagen.warn("API", "Rate limit approaching");
hagen.warn("MEMORY", "High memory usage detected");`,
	},

	// Log Levels - error
	"log-levels-error": {
		id: "log-levels-error",
		description: "Error method with red labels and X prefix",
		code: `import hagen from "hagen";

hagen.error("API", "Request failed", new Error("Timeout"));
hagen.error("DB", "Connection lost", new Error("Connection refused"));
hagen.error("AUTH", "Invalid credentials");`,
	},

	// Timestamps - 24h
	"timestamps-time-24h": {
		id: "timestamps-time-24h",
		description: "24-hour time format",
		code: `import { createHagen } from "hagen";

const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time",
  timeFormat: "24h"  // This is the default
});

logger.log("API", "Message");`,
	},

	// Timestamps - 12h
	"timestamps-time-12h": {
		id: "timestamps-time-12h",
		description: "12-hour time format with AM/PM",
		code: `import { createHagen } from "hagen";

const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time",
  timeFormat: "12h"
});

logger.log("API", "Message");`,
	},

	// Custom Colors - palette
	"custom-colors-palette": {
		id: "custom-colors-palette",
		description: "All six colors in the built-in palette",
		code: `import hagen from "hagen";

hagen.log({ label: "API", color: 0 }, "Cyan");
hagen.log({ label: "API", color: 1 }, "Magenta");
hagen.log({ label: "API", color: 2 }, "Blue");
hagen.log({ label: "API", color: 3 }, "Yellow");
hagen.log({ label: "API", color: 4 }, "Green");
hagen.log({ label: "API", color: 5 }, "Red");`,
	},

	// Custom Colors - hex
	"custom-colors-hex": {
		id: "custom-colors-hex",
		description: "Custom hex colors with branded colors",
		code: `import hagen from "hagen";

hagen.log(
  {
    label: "CUSTOM",
    bgColor: "#FF6B6B",
    fgColor: "#FFFFFF"
  },
  "Red background, white text"
);

// Brand colors
const BRAND = {
  primary: "#3B82F6",
  secondary: "#8B5CF6",
  success: "#10B981"
};

hagen.log(
  { label: "PRIMARY", bgColor: BRAND.primary, fgColor: "#FFFFFF" },
  "Primary brand color"
);

hagen.log(
  { label: "SUCCESS", bgColor: BRAND.success, fgColor: "#FFFFFF" },
  "Brand success color"
);`,
	},

	// Configuration - fixed width
	"config-fixed-width": {
		id: "config-fixed-width",
		description: "Fixed-width labels with aligned output",
		code: `import { createHagen } from "hagen";

const logger = createHagen({
  fixedWidth: { width: 10 }
});

logger.log("API", "Short label");
logger.log("DATABASE", "Longer label");
logger.log("X", "Tiny");`,
	},

	// Configuration - prefix/suffix
	"config-prefix-suffix": {
		id: "config-prefix-suffix",
		description: "Custom prefixes and suffixes",
		code: `import hagen from "hagen";

// Arrow prefix
hagen.log({ label: "API", prefix: "→" }, "Arrow before label");

// Double arrows
hagen.log({ label: "WORKER", prefix: ">>", suffix: "<<" }, "Brackets");

// Emoji prefix
hagen.log({ label: "SUCCESS", prefix: "✨" }, "Sparkles");

// Custom separator
hagen.log({ label: "DB", suffix: ":" }, "Colon after label");`,
	},

	// Examples - basic usage
	"basic-usage": {
		id: "basic-usage",
		description: "Basic usage with three log levels",
		code: `import hagen from "hagen";

hagen.log("APP", "Application starting");
hagen.info("CONFIG", "Configuration loaded");
hagen.success("INIT", "Initialization complete");`,
	},

	// Examples - custom styling
	"custom-styling": {
		id: "custom-styling",
		description: "Custom hex colors and brand styling",
		code: `import hagen from "hagen";

// Brand colors
const BRAND = {
  primary: { label: "PRIMARY", bgColor: "#3B82F6", fgColor: "#FFFFFF" },
  secondary: { label: "SECONDARY", bgColor: "#8B5CF6", fgColor: "#FFFFFF" },
  success: { label: "SUCCESS", bgColor: "#10B981", fgColor: "#FFFFFF" },
  warning: { label: "WARNING", bgColor: "#F59E0B", fgColor: "#000000" },
  danger: { label: "DANGER", bgColor: "#EF4444", fgColor: "#FFFFFF" }
};

hagen.log(BRAND.primary, "Primary brand color");
hagen.log(BRAND.success, "Success state");
hagen.log(BRAND.warning, "Warning state");
hagen.log(BRAND.danger, "Danger state");`,
	},

	// Examples - custom styling brands (duplicate with more colors)
	"custom-styling-brands": {
		id: "custom-styling-brands",
		description: "Service category colors with emoji prefixes",
		code: `import hagen from "hagen";

const services = {
  api: { label: "API", color: 2, prefix: "🌐" },
  db: { label: "DB", color: 4, prefix: "💾" },
  cache: { label: "CACHE", color: 3, prefix: "⚡" },
  auth: { label: "AUTH", color: 1, prefix: "🔐" },
  queue: { label: "QUEUE", color: 0, prefix: "📨" }
};

hagen.log(services.api, "Request processed");
hagen.log(services.db, "Query executed");
hagen.log(services.cache, "Cache hit");
hagen.log(services.auth, "User authenticated");
hagen.log(services.queue, "Job enqueued");`,
	},

	// Examples - multiple loggers
	"multiple-loggers": {
		id: "multiple-loggers",
		description: "Multiple loggers with different configurations",
		code: `import { createHagen } from "hagen";

// API logger with timestamps
const apiLogger = createHagen({
  showTimestamp: true,
  dateFormat: "time",
  labelPrefix: "[API]"
});

// Database logger with fixed-width labels
const dbLogger = createHagen({
  showTimestamp: true,
  fixedWidth: { width: 10 }
});

// Cache logger without timestamps
const cacheLogger = createHagen({
  showTimestamp: false,
  labelPrefix: "[CACHE]"
});

apiLogger.log("REQUEST", "GET /api/users");
dbLogger.success("CONNECT", "Database connected");
cacheLogger.success("HIT", "Cache hit for key: user_123");`,
	},

	// REPL - blank for experimentation
	repl: {
		id: "repl",
		description: "Interactive REPL for experimentation",
		code: `import hagen from "hagen";

// Try Hagen yourself!
// Start typing to see autocomplete and explore the API.

hagen.log("DEMO", "Hello from Hagen!");
`,
	},
};

export default examples;
