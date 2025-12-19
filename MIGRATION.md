# Migration Guide: v3.x → v4.0.0

This guide helps you migrate from Hagen v3.x to v4.0.0.

## Overview of Changes

v4.0.0 is a major rewrite that modernizes the codebase and improves the developer experience:

- ✅ **Instance-based architecture** - No more global state
- ✅ **Node 20+ only** - Modern JavaScript features
- ✅ **Improved TypeScript** - Full strict mode, better types
- ✅ **Enhanced Label type** - Custom prefix/suffix support
- ✅ **Better testing** - 77% code coverage
- ⚠️ **Breaking changes** - See below

## Breaking Changes

### 1. Minimum Node.js Version

**v3.x**: Node.js 10+  
**v4.x**: Node.js 20+

**Action Required**: Upgrade to Node.js 20 or higher.

```bash
# Check your version
node --version

# Should output v20.x.x or higher
```

### 2. Removed Global Configuration Methods

The global `setConfig()`, `getConfig()`, and `resetConfig()` methods have been removed in favor of instance-based configuration.

#### v3.x (Old)
```typescript
import hagen, { setConfig, getConfig, resetConfig } from "hagen";

// Global configuration
setConfig({
  layout: "%t [%l:%15] %m"
});

// Get current config
const config = getConfig();

// Reset to defaults
resetConfig();

// Use logger
hagen.log("API", "Hello");
```

#### v4.x (New)
```typescript
import { createHagen } from "hagen";

// Create configured instance
const logger = createHagen({
  layout: "%t [%l] %m",
  labelOptions: { fixedWidth: 15 }
});

// Each instance has its own config - no global state!
logger.log("API", "Hello");
```

### 3. Label Type Enhanced

The Label type now supports custom `prefix` and `suffix` properties.

#### v3.x (Old)
```typescript
// Simple string labels only
hagen.log("API", "message");

// Or with color
hagen.log({ label: "API", color: 3 }, "message");
```

#### v4.x (New)
```typescript
// All v3 syntax still works, plus new features:
logger.log({ 
  label: "API", 
  color: 3,
  prefix: ">>",  // NEW!
  suffix: "<<"   // NEW!
}, "message");
```

### 4. Configuration Structure Refactored

Configuration options have been grouped into logical objects:

#### v3.x (Old)
```typescript
createHagen({
  enableColor: true,
  fixedWidth: 15,
  timestampFormatter: (d) => d.toISOString(),
  paletteSize: 8
});
```

#### v4.x (New)
```typescript
createHagen({
  colorOptions: {
    enabled: true,
    paletteSize: 8
  },
  labelOptions: {
    fixedWidth: 15
  },
  timestampOptions: {
    formatter: (d) => d.toISOString()
  }
});
```

## Migration Strategies

### Strategy 1: Quick Fix (Minimal Changes)

Create one global instance to mimic v3 behavior:

**Before (v3.x)**
```typescript
import hagen, { setConfig } from "hagen";

setConfig({ showTimestamp: true });

export function apiCall() {
  hagen.log("API", "Calling endpoint");
}
```

**After (v4.x)**
```typescript
import { createHagen } from "hagen";

// Create configured instance once
const hagen = createHagen({ showTimestamp: true });

export function apiCall() {
  hagen.log("API", "Calling endpoint");
}
```

### Strategy 2: Shared Logger (Recommended)

Create a shared logger module for your entire application:

**lib/logger.ts**
```typescript
import { createHagen } from "hagen";

export const logger = createHagen({
  layout: "%t %l %m",
  timestampOptions: {
    formatter: (date) => date.toLocaleTimeString()
  }
});
```

**services/api.ts**
```typescript
import { logger } from "../lib/logger";

export async function fetchUser(id: string) {
  logger.info("API", `Fetching user ${id}`);
  // ...
}
```

### Strategy 3: Multiple Loggers (Best for Large Apps)

Create specialized loggers for different subsystems:

**lib/loggers.ts**
```typescript
import { createHagen } from "hagen";

export const apiLogger = createHagen({
  layout: "[API] %t %l %m"
});

export const dbLogger = createHagen({
  layout: "[DB] %t %l %m"
});

export const cacheLogger = createHagen({
  layout: "[CACHE] %l %m"
});
```

**services/api.ts**
```typescript
import { apiLogger } from "../lib/loggers";

export async function fetchUser(id: string) {
  apiLogger.info("FETCH", `Fetching user ${id}`);
  // ...
}
```

**services/database.ts**
```typescript
import { dbLogger } from "../lib/loggers";

export async function query(sql: string) {
  dbLogger.log("QUERY", sql);
  // ...
}
```

## Configuration Mapping

All v3 configuration options are still available in v4:

| v3.x `setConfig()` | v4.x `createHagen()` |
|-------------------|---------------------|
| `showTimestamp` | 🔄 `layout: "%t ..."` |
| `enableColor` | 🔄 `colorOptions: { enabled }` |
| `dateFormat` | 🔄 `timestampOptions: { formatter }` |
| `timeFormat` | 🗑️ Removed (use formatter) |
| `labelPrefix` | 🔄 `layout: "PREFIX %l"` |
| `labelSuffix` | 🔄 `layout: "%l SUFFIX"` |
| `fixedWidth` | 🔄 `labelOptions: { fixedWidth }` |
| `colors` | ✅ Same (advanced) |

## Testing Considerations

### Before (v3.x)
```typescript
import hagen, { setConfig, resetConfig } from "hagen";

beforeEach(() => {
  resetConfig(); // Reset global state
});

test("logs with timestamp", () => {
  setConfig({ layout: "%t %l %m" });
  hagen.log("TEST", "message");
});
```

### After (v4.x)
```typescript
import { createHagen } from "hagen";

test("logs with timestamp", () => {
  // Each test gets its own instance - no shared state!
  const logger = createHagen({ layout: "%t %l %m" });
  logger.log("TEST", "message");
});
```

## Common Patterns

### Pattern: Environment-Based Configuration

**v3.x**
```typescript
import hagen, { setConfig } from "hagen";

if (process.env.NODE_ENV === "production") {
  setConfig({ layout: "%t %l %m" });
}
```

**v4.x**
```typescript
import { createHagen } from "hagen";

export const logger = createHagen({
  layout: process.env.NODE_ENV === "production" ? "%t %l %m" : "%l %m"
});
```

### Pattern: Conditional Logging

**v3.x**
```typescript
import hagen from "hagen";

function debugLog(label: string, ...data: unknown[]) {
  if (process.env.DEBUG) {
    hagen.log(label, ...data);
  }
}
```

**v4.x**
```typescript
import { createHagen } from "hagen";

const logger = createHagen({ colorOptions: { enabled: !!process.env.DEBUG } });

function debugLog(label: string, ...data: unknown[]) {
  if (process.env.DEBUG) {
    logger.log(label, ...data);
  }
}
```

## TypeScript Improvements

v4 has full TypeScript strict mode enabled:

```typescript
import { createHagen, type LoggerConfig, type Label } from "hagen";

// Fully typed configuration
const config: Partial<LoggerConfig> = {
  showTimestamp: true,
  dateFormat: "iso", // Type-safe: "iso" | "locale" | "time" | function
};

const logger = createHagen(config);

// Fully typed labels
const label: Label = { label: "API", color: 3 };
logger.log(label, "message");
```

## Getting Help

- 📚 [API Documentation](https://j0hnm4r5.github.io/hagen)
- 🐛 [Report Issues](https://github.com/j0hnm4r5/hagen/issues)
- 💬 [Discussions](https://github.com/j0hnm4r5/hagen/discussions)

## Summary Checklist

- [ ] Upgrade to Node.js 20+
- [ ] Replace `setConfig()` with `createHagen()`
- [ ] Remove `getConfig()` and `resetConfig()` calls
- [ ] Update imports: `import { createHagen } from "hagen"`
- [ ] Create shared logger instances
- [ ] Update tests to use isolated instances
- [ ] Verify TypeScript types (if using TypeScript)
- [ ] Test your application thoroughly

Welcome to Hagen v4! 🎉
