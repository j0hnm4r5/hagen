# Configuration

Customize Hagen to fit your needs with comprehensive configuration options.

## Creating Configured Instances

Use `createHagen()` to create a logger instance with custom configuration:

```typescript
import { createHagen } from "hagen";

const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time",
  enableColor: true
});
```

## Configuration Options

All configuration options are optional and have sensible defaults.

### `showTimestamp`

- **Type**: `boolean`
- **Default**: `false`

Enable or disable timestamp display before each log message.

```typescript
const logger = createHagen({ showTimestamp: true });

logger.log("API", "Request received");
// Output: 2025-12-07T10:30:45.123Z [ API ] Request received
```

### `dateFormat`

- **Type**: `"iso" | "locale" | "time" | ((date: Date) => string)`
- **Default**: `"iso"`

Choose how dates/times are formatted. Only applies when `showTimestamp: true`.

#### ISO Format

```typescript
const logger = createHagen({
  showTimestamp: true,
  dateFormat: "iso"
});

logger.log("API", "Message");
// Output: 2025-12-07T10:30:45.123Z [ API ] Message
```

#### Locale Format

```typescript
const logger = createHagen({
  showTimestamp: true,
  dateFormat: "locale"
});

logger.log("API", "Message");
// Output: 12/7/2025, 10:30:45 AM [ API ] Message
```

#### Time Only

```typescript
const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time"
});

logger.log("API", "Message");
// Output: 10:30:45 [ API ] Message
```

#### Custom Function

```typescript
const logger = createHagen({
  showTimestamp: true,
  dateFormat: (date: Date) => {
    return date.toISOString().split('T')[1].slice(0, 8);
  }
});

logger.log("API", "Message");
// Output: 10:30:45 [ API ] Message
```

### `timeFormat`

- **Type**: `"12h" | "24h"`
- **Default**: `"24h"`

Choose between 12-hour and 24-hour time format. Only applies when `dateFormat: "time"`.

#### 24-Hour Format

```typescript
const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time",
  timeFormat: "24h"
});

logger.log("API", "Message");
// Output: 14:30:45 [ API ] Message
```

#### 12-Hour Format

```typescript
const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time",
  timeFormat: "12h"
});

logger.log("API", "Message");
// Output: 2:30:45 PM [ API ] Message
```

### `enableColor`

- **Type**: `boolean`
- **Default**: `true` (automatically `false` in CI environments)

Enable or disable colored output.

```typescript
// Force colors off
const noColorLogger = createHagen({ enableColor: false });

noColorLogger.log("API", "Plain text output");
// Output: [ API ] Plain text output
```

```typescript
// Force colors on (even in CI)
const colorLogger = createHagen({ enableColor: true });
```

Hagen automatically detects CI environments and disables colors. Override with this option if needed.

### `labelPrefix`

- **Type**: `string`
- **Default**: `""` (empty)

Add a prefix before all labels:

```typescript
const logger = createHagen({ labelPrefix: "[APP]" });

logger.log("API", "Request received");
// Output: [APP] [ API ] Request received
```

Useful for distinguishing logger instances or adding context.

### `labelSuffix`

- **Type**: `string`
- **Default**: `""` (empty)

Add a suffix after all labels:

```typescript
const logger = createHagen({ labelSuffix: "→" });

logger.log("API", "Request sent");
// Output: [ API ] → Request sent
```

### `fixedWidth`

- **Type**: `{ width: number; truncationMethod?: "start" | "end" | "middle" }`
- **Default**: `undefined`

Make all labels a fixed width for aligned output.

#### Basic Fixed Width

```typescript
const logger = createHagen({
  fixedWidth: { width: 10 }
});

logger.log("API", "Short label");
logger.log("DATABASE", "Longer label");
logger.log("X", "Tiny");
// Output:
//   API        Short label
//   DATABASE   Longer label
//   X          Tiny
```

<Terminal exampleId="config-fixed-width" title="Fixed-Width Labels" />

#### Truncation Methods

When labels exceed the fixed width:

**End Truncation** (default)
```typescript
const logger = createHagen({
  fixedWidth: { width: 8, truncationMethod: "end" }
});

logger.log("VERYLONGLABEL", "Message");
// Output: VERYLO... Message
```

**Start Truncation**
```typescript
const logger = createHagen({
  fixedWidth: { width: 8, truncationMethod: "start" }
});

logger.log("VERYLONGLABEL", "Message");
// Output: ...LABEL Message
```

**Middle Truncation**
```typescript
const logger = createHagen({
  fixedWidth: { width: 8, truncationMethod: "middle" }
});

logger.log("VERYLONGLABEL", "Message");
// Output: VER...EL Message
```

## Complete Configuration Example

Here's an example using all configuration options:

```typescript
import { createHagen } from "hagen";

const logger = createHagen({
  // Timestamps
  showTimestamp: true,
  dateFormat: "time",
  timeFormat: "12h",
  
  // Colors
  enableColor: true,
  
  // Label formatting
  labelPrefix: "[APP]",
  labelSuffix: "→",
  
  // Fixed width
  fixedWidth: {
    width: 12,
    truncationMethod: "middle"
  }
});

logger.log("API", "Configured logger in action");
// Output: 2:30:45 PM [APP] API          → Configured logger in action
```

## Multiple Instances

Create different logger instances for different parts of your application:

```typescript
// lib/loggers.ts
import { createHagen } from "hagen";

// API logger with timestamps
export const apiLogger = createHagen({
  showTimestamp: true,
  dateFormat: "time",
  labelPrefix: "[API]"
});

// Database logger with fixed width
export const dbLogger = createHagen({
  showTimestamp: true,
  fixedWidth: { width: 10 }
});

// Test logger without colors
export const testLogger = createHagen({
  enableColor: false
});

// Debug logger (only active when DEBUG is set)
export const debugLogger = createHagen({
  enableColor: !!process.env.DEBUG,
  showTimestamp: true
});
```

Use throughout your app:

```typescript
// services/api.ts
import { apiLogger } from "../lib/loggers";

export async function fetchData() {
  apiLogger.info("FETCH", "Starting request");
  // ...
}
```

```typescript
// services/database.ts
import { dbLogger } from "../lib/loggers";

export async function query(sql: string) {
  dbLogger.log("QUERY", sql);
  // ...
}
```

## Environment-Based Configuration

Configure loggers based on environment:

```typescript
import { createHagen } from "hagen";

const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

export const logger = createHagen({
  // Timestamps in production only
  showTimestamp: isProd,
  
  // Colors in development, not in test
  enableColor: isDev,
  
  // Shorter format in development
  dateFormat: isDev ? "time" : "iso",
  timeFormat: isDev ? "12h" : "24h"
});
```

## TypeScript Support

All configuration options are fully typed:

```typescript
import { createHagen, type LoggerConfig } from "hagen";

// Type-safe configuration object
const config: Partial<LoggerConfig> = {
  showTimestamp: true,
  dateFormat: "iso", // TypeScript knows valid values!
  timeFormat: "12h",
  enableColor: true
};

const logger = createHagen(config);
```

TypeScript will catch invalid configuration:

```typescript
const config: Partial<LoggerConfig> = {
  dateFormat: "invalid" // ❌ Type error!
};
```

## Dynamic Configuration

Configuration is set when you create the instance and cannot be changed. For dynamic behavior, create multiple instances:

```typescript
const verboseLogger = createHagen({ showTimestamp: true });
const quietLogger = createHagen({ enableColor: false });

// Choose logger based on runtime condition
const logger = process.env.VERBOSE ? verboseLogger : quietLogger;
```

## Default Instance Configuration

The default instance exported by Hagen uses these defaults:

```typescript
{
  showTimestamp: false,
  dateFormat: "iso",
  timeFormat: "24h",
  enableColor: true, // false in CI
  labelPrefix: "",
  labelSuffix: "",
  fixedWidth: undefined
}
```

## Next Steps

- [Log Levels](/guide/log-levels) - Learn about different log levels
- [Custom Colors](/guide/custom-colors) - Advanced color customization
- [Timestamps](/guide/timestamps) - Deep dive into timestamp formatting
- [Examples](/examples/) - See configurations in action
