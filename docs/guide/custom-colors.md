# Custom Colors

Learn how to customize colors in Hagen for complete control over your logging aesthetic.

## Automatic Coloring

By default, Hagen automatically assigns colors to labels using a deterministic hash-based algorithm:

```typescript
hagen.log("API", "Message");  // Always gets the same color
hagen.log("DB", "Message");   // Gets a different color
hagen.log("API", "Message");  // Same color as first API log
```

This ensures:
- **Consistency**: Same label = same color
- **Distinction**: Different labels usually get different colors
- **Zero config**: No setup required

## Color Palette

Hagen has a built-in palette of 6 colors (indexes 0-5):

```typescript {output=true}
import { createHagen } from "hagen";

hagen.log({ label: "API", color: 0 }, "Cyan");
hagen.log({ label: "API", color: 1 }, "Magenta");
hagen.log({ label: "API", color: 2 }, "Blue");
hagen.log({ label: "API", color: 3 }, "Yellow");
hagen.log({ label: "API", color: 4 }, "Green");
hagen.log({ label: "API", color: 5 }, "Red");
```

The palette (using Chalk):
- **0**: Cyan (`chalk.cyan`)
- **1**: Magenta (`chalk.magenta`)
- **2**: Blue (`chalk.blue`)
- **3**: Yellow (`chalk.yellow`)
- **4**: Green (`chalk.green`)
- **5**: Red (`chalk.red`)

**Terminal Output:**

Each color index produces a distinct background color for the label, making it easy to visually distinguish between different log sources.

## Custom Hex Colors

For full control, use hex colors:

```typescript {output=true}
hagen.log(
  {
    label: "CUSTOM",
    bgColor: "#FF6B6B",  // Background color
    fgColor: "#FFFFFF"   // Foreground (text) color
  },
  "Red background, white text"
);
```

### Background Color Only

```typescript
hagen.log(
  {
    label: "PINK",
    bgColor: "#FF69B4"
  },
  "Pink background, default text color"
);
```

### Foreground Color Only

```typescript
hagen.log(
  {
    label: "ORANGE",
    fgColor: "#FFA500"
  },
  "Default background, orange text"
);
```

### Both Colors

```typescript
hagen.log(
  {
    label: "MATRIX",
    bgColor: "#000000",
    fgColor: "#00FF00"
  },
  "Matrix style"
);
```

## Brand Colors

Use your brand colors for consistent logging:

```typescript
// Your brand colors
const BRAND = {
  primary: "#3B82F6",    // Blue
  secondary: "#8B5CF6",  // Purple
  success: "#10B981",    // Green
  warning: "#F59E0B",    // Orange
  danger: "#EF4444"      // Red
};

// Create branded labels
hagen.log(
  { label: "APP", bgColor: BRAND.primary, fgColor: "#FFFFFF" },
  "Primary brand color"
);

hagen.log(
  { label: "SUCCESS", bgColor: BRAND.success, fgColor: "#FFFFFF" },
  "Brand success color"
);
```

## Advanced: Chalk Instances

For maximum flexibility, pass Chalk instances directly:

```typescript
import chalk from "chalk";

hagen.log(
  {
    label: "ADVANCED",
    color: chalk.bgHex("#FF6B6B").hex("#FFFFFF").bold
  },
  "Using Chalk directly"
);

hagen.log(
  {
    label: "GRADIENT",
    color: chalk.bgGradient(["#FF6B6B", "#4ECDC4"])
  },
  "Gradient background"
);
```

**Note**: This is an advanced feature. For most use cases, hex colors are simpler and sufficient.

## Label Decorators

Combine colors with prefixes and suffixes:

```typescript
hagen.log(
  {
    label: "WORKER",
    color: 4,        // Green from palette
    prefix: ">>",
    suffix: "<<"
  },
  "Custom brackets with color"
);
// Output: >> WORKER << Custom brackets (in green)
```

## Color Consistency Cache

Hagen caches label→color mappings for performance. This cache persists across log calls:

```typescript
hagen.log("API", "First call");   // Computes hash, caches color
hagen.log("API", "Second call");  // Uses cached color (faster)
hagen.log("API", "Third call");   // Uses cached color (faster)
```

### Clearing the Cache

If you're logging thousands of unique labels and want to free memory:

```typescript
import { clearColorCache } from "hagen";

// After processing a batch of unique labels
processLabels(labels);
clearColorCache();
```

**When to clear the cache:**
- Long-running processes with many unique labels
- Memory-constrained environments
- After processing a batch of logs

**When NOT to clear the cache:**
- Regular applications (cache is small)
- When you want color consistency
- Most use cases (leave it alone)

## Disabling Colors

Disable colors entirely:

```typescript
import { createHagen } from "hagen";

const logger = createHagen({ enableColor: false });

logger.log("API", "Plain text, no colors");
// Output: [ API ] Plain text, no colors
```

Colors are automatically disabled in CI environments. Override if needed:

```typescript
// Force colors even in CI
const logger = createHagen({ enableColor: true });
```

## Color Schemes

### Traffic Light Scheme

```typescript
const trafficLight = {
  ok: { label: "OK", color: 4 },        // Green
  warn: { label: "WARN", color: 3 },    // Yellow
  error: { label: "ERROR", color: 5 }   // Red
};

hagen.log(trafficLight.ok, "System healthy");
hagen.log(trafficLight.warn, "High load");
hagen.log(trafficLight.error, "System failure");
```

### Severity Scheme

```typescript
const severity = {
  debug: { label: "DEBUG", bgColor: "#6B7280", fgColor: "#FFFFFF" },
  info: { label: "INFO", bgColor: "#3B82F6", fgColor: "#FFFFFF" },
  warn: { label: "WARN", bgColor: "#F59E0B", fgColor: "#FFFFFF" },
  error: { label: "ERROR", bgColor: "#EF4444", fgColor: "#FFFFFF" },
  fatal: { label: "FATAL", bgColor: "#000000", fgColor: "#EF4444" }
};

hagen.log(severity.debug, "Debug message");
hagen.log(severity.info, "Info message");
hagen.log(severity.error, "Error message");
```

### Category Scheme

```typescript
const categories = {
  api: { label: "API", color: 2 },      // Blue
  db: { label: "DB", color: 4 },        // Green
  cache: { label: "CACHE", color: 3 },  // Yellow
  auth: { label: "AUTH", color: 1 },    // Magenta
  worker: { label: "WORKER", color: 0 } // Cyan
};

hagen.log(categories.api, "API request");
hagen.log(categories.db, "Database query");
hagen.log(categories.cache, "Cache hit");
```

## Practical Examples

### Environment-Based Colors

```typescript
const isDev = process.env.NODE_ENV === "development";

const colors = isDev
  ? {
      // Bright colors for development
      api: { label: "API", bgColor: "#3B82F6", fgColor: "#FFFFFF" },
      db: { label: "DB", bgColor: "#10B981", fgColor: "#FFFFFF" }
    }
  : {
      // Subtle colors for production logs
      api: { label: "API", color: 2 },
      db: { label: "DB", color: 4 }
    };

hagen.log(colors.api, "Request received");
```

### Module-Specific Colors

```typescript
// services/api.ts
const label = { label: "API", color: 2 };  // Blue

export function handleRequest() {
  hagen.log(label, "Handling request");
}
```

```typescript
// services/database.ts
const label = { label: "DB", color: 4 };  // Green

export function query() {
  hagen.log(label, "Executing query");
}
```

### Dynamic Colors

```typescript
function getStatusColor(status: number): Label {
  if (status < 300) {
    return { label: `${status}`, bgColor: "#10B981", fgColor: "#FFFFFF" };
  } else if (status < 400) {
    return { label: `${status}`, bgColor: "#3B82F6", fgColor: "#FFFFFF" };
  } else if (status < 500) {
    return { label: `${status}`, bgColor: "#F59E0B", fgColor: "#FFFFFF" };
  } else {
    return { label: `${status}`, bgColor: "#EF4444", fgColor: "#FFFFFF" };
  }
}

const response = await fetch(url);
hagen.log(getStatusColor(response.status), `Response from ${url}`);
```

## Terminal Compatibility

Hagen uses Chalk under the hood, which automatically detects terminal capabilities:

- **True color (16m colors)**: Modern terminals
- **256 colors**: Most terminals
- **16 colors**: Older terminals
- **No colors**: Non-TTY environments, CI

Chalk automatically downgrades colors based on terminal support, so your hex colors will work everywhere.

## Next Steps

- [Timestamps](/guide/timestamps) - Add timestamps to your logs
- [Configuration](/guide/configuration) - Full configuration reference
- [Examples](/examples/custom-styling) - See custom colors in action
