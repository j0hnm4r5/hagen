# Custom Styling

Learn how to customize Hagen's appearance with colors, prefixes, suffixes, and formatting.

## Color Palette

Use the built-in color palette (indexes 0-5):

```typescript
import hagen from "hagen";

hagen.log({ label: "CYAN", color: 0 }, "Cyan background");
hagen.log({ label: "MAGENTA", color: 1 }, "Magenta background");
hagen.log({ label: "BLUE", color: 2 }, "Blue background");
hagen.log({ label: "YELLOW", color: 3 }, "Yellow background");
hagen.log({ label: "GREEN", color: 4 }, "Green background");
hagen.log({ label: "RED", color: 5 }, "Red background");
```

## Custom Hex Colors

Use any hex color for complete control:

```typescript {output=true}
import { createHagen } from "hagen";

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
hagen.log(BRAND.danger, "Danger state");
```

## Prefix and Suffix

Add custom decorators around labels:

```typescript {output=true}
// Arrow prefix
hagen.log({ label: "API", prefix: "→" }, "Arrow before label");

// Double arrows
hagen.log({ label: "WORKER", prefix: ">>", suffix: "<<" }, "Brackets");
```

## Prefix and Suffix

Add custom decorators around labels:

```typescript
// Arrow prefix
hagen.log({ label: "API", prefix: "→" }, "Arrow before label");

// Double arrows
hagen.log({ label: "WORKER", prefix: ">>", suffix: "<<" }, "Brackets");

// Emoji prefix
hagen.log({ label: "SUCCESS", prefix: "✨" }, "Sparkles");

// Custom separator
hagen.log({ label: "DB", suffix: ":" }, "Colon after label");
```

### Themed Prefixes

```typescript
const styles = {
  incoming: { label: "IN", prefix: "⬇", color: 2 },
  outgoing: { label: "OUT", prefix: "⬆", color: 4 },
  error: { label: "ERR", prefix: "💥", color: 5 }
};

hagen.log(styles.incoming, "Received data");
hagen.log(styles.outgoing, "Sent response");
hagen.log(styles.error, "Something went wrong");
```

## Default Label Fallback

When labels are empty, undefined, or null, Hagen uses a default fallback symbol (default: `"■"`):

```typescript {output=true}
import { createHagen } from "hagen";

// Custom default label
const logger = createHagen({ defaultLabel: "◆" });

logger.log("", "Empty label uses fallback");
logger.log("API", "Normal label works fine");
logger.log({ label: "" }, "Empty object label also uses fallback");
```

This is useful for defensive coding or when labels come from dynamic sources:

```typescript {output=true}
import { createHagen } from "hagen";

// Use emoji as default
const logger = createHagen({ defaultLabel: "🔹" });

// Simulating dynamic labels that might be empty
const labels = ["USER", "", "API", undefined, "DB"];

labels.forEach(label => {
  logger.log(label, `Processing with label: ${label || "(empty)"}`);
});
```

Common fallback symbols:
- `"■"` - Black square (default)
- `"•"` - Bullet point
- `"◆"` - Diamond
- `"▪"` - Small square
- `"○"` - Circle
- `"🔹"` - Blue diamond emoji
- `"⚫"` - Black circle emoji

## Fixed-Width Labels

Align output with fixed-width labels:

```typescript
import { createHagen } from "hagen";

const logger = createHagen({
  fixedWidth: { width: 12 }
});

logger.log("API", "Short label");
logger.log("DATABASE", "Medium label");
logger.log("X", "Tiny label");
logger.log("AUTHENTICATION", "Long label will be truncated");

// Output (aligned):
// API          Short label
// DATABASE     Medium label  
// X            Tiny label
// AUTHENTICAT... Long label will be truncated
```

### Truncation Methods

Control how long labels are truncated:

```typescript
// End truncation (default)
const endLogger = createHagen({
  fixedWidth: { width: 10, truncationMethod: "end" }
});

endLogger.log("VERYLONGLABEL", "Message");
// Output: VERYLONG... Message

// Start truncation
const startLogger = createHagen({
  fixedWidth: { width: 10, truncationMethod: "start" }
});

startLogger.log("VERYLONGLABEL", "Message");
// Output: ...GLABEL Message

// Middle truncation
const middleLogger = createHagen({
  fixedWidth: { width: 10, truncationMethod: "middle" }
});

middleLogger.log("VERYLONGLABEL", "Message");
// Output: VER...BEL Message
```

## Colorless Mode

Disable colors for plain text output:

```typescript
import { createHagen } from "hagen";

const plainLogger = createHagen({
  enableColor: false
});

plainLogger.log("API", "Plain text, no colors");
plainLogger.success("DB", "Still shows prefix icons");
plainLogger.error("ERROR", "But no colors");

// Output:
// [ API ] Plain text, no colors
// ✓ [ DB ] Still shows prefix icons
// ✕ [ ERROR ] But no colors
```

## Complete Styling Examples

### Production Style

Professional, clean output for production:

```typescript
import { createHagen } from "hagen";

const prodLogger = createHagen({
  showTimestamp: true,
  dateFormat: "iso",
  enableColor: false,
  fixedWidth: { width: 12 }
});

prodLogger.log("API", "Request received");
prodLogger.success("DB", "Query executed");

// Output:
// 2025-12-07T10:30:45.123Z API          Request received
// 2025-12-07T10:30:45.456Z ✓ DB           Query executed
```

### Development Style

Colorful, readable output for development:

```typescript
import { createHagen } from "hagen";

const devLogger = createHagen({
  showTimestamp: true,
  dateFormat: "time",
  timeFormat: "12h",
  enableColor: true
});

devLogger.log("API", "Request received");
devLogger.success("DB", "Query executed");

// Output (in color):
// 10:30:45 AM [ API ] Request received
// 10:30:45 AM ✓ [ DB ] Query executed
```

### Status Dashboard Style

Clear status indicators:

```typescript
const status = {
  healthy: { label: "✓ HEALTHY", bgColor: "#10B981", fgColor: "#FFFFFF" },
  degraded: { label: "⚠ DEGRADED", bgColor: "#F59E0B", fgColor: "#000000" },
  down: { label: "✕ DOWN", bgColor: "#EF4444", fgColor: "#FFFFFF" }
};

hagen.log(status.healthy, "All systems operational");
hagen.log(status.degraded, "Elevated response times");
hagen.log(status.down, "Service unavailable");
```

### Log Level Color Scheme

Custom colors for each log level:

```typescript
const levels = {
  debug: { label: "DEBUG", bgColor: "#6B7280", fgColor: "#FFFFFF" },
  info: { label: "INFO", bgColor: "#3B82F6", fgColor: "#FFFFFF" },
  warn: { label: "WARN", bgColor: "#F59E0B", fgColor: "#000000" },
  error: { label: "ERROR", bgColor: "#EF4444", fgColor: "#FFFFFF" },
  fatal: { label: "FATAL", bgColor: "#000000", fgColor: "#EF4444" }
};

hagen.log(levels.debug, "Debug information");
hagen.log(levels.info, "Informational message");
hagen.log(levels.warn, "Warning message");
hagen.log(levels.error, "Error occurred");
hagen.log(levels.fatal, "Critical failure");
```

### Service Category Colors

Different colors for different services:

```typescript {output=true}
import { createHagen } from "hagen";

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
hagen.log(services.queue, "Job enqueued");
```

## Dynamic Styling

Change styles based on conditions:

### Status-Based Colors

```typescript
function getStatusStyle(status: number) {
  if (status < 300) {
    return { label: String(status), bgColor: "#10B981", fgColor: "#FFF" };
  } else if (status < 400) {
    return { label: String(status), bgColor: "#3B82F6", fgColor: "#FFF" };
  } else if (status < 500) {
    return { label: String(status), bgColor: "#F59E0B", fgColor: "#000" };
  } else {
    return { label: String(status), bgColor: "#EF4444", fgColor: "#FFF" };
  }
}

const response = await fetch(url);
hagen.log(getStatusStyle(response.status), `Response from ${url}`);
```

### Priority-Based Colors

```typescript
function getPriorityStyle(priority: string) {
  const styles = {
    low: { label: priority.toUpperCase(), color: 2 },
    medium: { label: priority.toUpperCase(), color: 3 },
    high: { label: priority.toUpperCase(), color: 5 },
    critical: { label: priority.toUpperCase(), bgColor: "#000", fgColor: "#F00" }
  };
  return styles[priority] || styles.low;
}

hagen.log(getPriorityStyle("low"), "Low priority task");
hagen.log(getPriorityStyle("high"), "High priority task");
hagen.log(getPriorityStyle("critical"), "Critical task");
```

### Environment-Based Styling

```typescript
import { createHagen } from "hagen";

const env = process.env.NODE_ENV || "development";

const envStyles = {
  development: {
    showTimestamp: true,
    dateFormat: "time" as const,
    timeFormat: "12h" as const,
    enableColor: true
  },
  production: {
    showTimestamp: true,
    dateFormat: "iso" as const,
    enableColor: false,
    fixedWidth: { width: 12 }
  },
  test: {
    showTimestamp: false,
    enableColor: false
  }
};

const logger = createHagen(envStyles[env] || envStyles.development);
```

## Advanced: Gradient Backgrounds

Using Chalk directly for gradients:

```typescript
import chalk from "chalk";
import hagen from "hagen";

// Gradient from red to blue
hagen.log(
  {
    label: "GRADIENT",
    color: chalk.bgGradient(["#FF0000", "#0000FF"]).white.bold
  },
  "Rainbow colors"
);
```

**Note**: Requires terminal with true color support.

## Reusable Label Library

Create a library of styled labels:

```typescript
// lib/labels.ts
export const labels = {
  // HTTP methods
  GET: { label: "GET", color: 2, prefix: "→" },
  POST: { label: "POST", color: 4, prefix: "→" },
  PUT: { label: "PUT", color: 3, prefix: "→" },
  DELETE: { label: "DELETE", color: 5, prefix: "→" },
  
  // Database operations
  QUERY: { label: "QUERY", color: 2, prefix: "💾" },
  INSERT: { label: "INSERT", color: 4, prefix: "💾" },
  UPDATE: { label: "UPDATE", color: 3, prefix: "💾" },
  
  // Lifecycle events
  START: { label: "START", color: 2, prefix: "▶" },
  STOP: { label: "STOP", color: 5, prefix: "■" },
  RESTART: { label: "RESTART", color: 3, prefix: "↻" },
  
  // Status indicators
  OK: { label: "OK", bgColor: "#10B981", fgColor: "#FFF" },
  WARN: { label: "WARN", bgColor: "#F59E0B", fgColor: "#000" },
  ERROR: { label: "ERROR", bgColor: "#EF4444", fgColor: "#FFF" }
};
```

Usage:

```typescript
import hagen from "hagen";
import { labels } from "./lib/labels";

hagen.log(labels.GET, "/api/users");
hagen.log(labels.QUERY, "SELECT * FROM users");
hagen.log(labels.OK, "Service healthy");
```

## Tips

### Terminal Compatibility

Hagen uses Chalk, which automatically handles:
- True color (16m colors) in modern terminals
- 256 color fallback
- 16 color fallback for older terminals
- No colors in non-TTY environments

Your custom hex colors will work everywhere!

### Color Consistency

For automatic color consistency, use string labels:

```typescript
// Same label = same color automatically
hagen.log("API", "Message 1");
hagen.log("API", "Message 2");  // Same color as above
```

For manual consistency, store label objects:

```typescript
const apiLabel = { label: "API", color: 2 };

hagen.log(apiLabel, "Message 1");
hagen.log(apiLabel, "Message 2");  // Same color guaranteed
```

## Next Steps

- [Configuration Guide](/guide/configuration) - Full configuration reference
- [Custom Colors Guide](/guide/custom-colors) - Deep dive into colors
- [TypeScript](/examples/typescript) - Type-safe styling patterns
