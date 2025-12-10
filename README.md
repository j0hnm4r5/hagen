# Hagen

![](https://github.com/j0hnm4r5/hagen/raw/main/assets/screenshot.png)

A colorful, instance-based logger for JavaScript and TypeScript in Node.js and modern browsers.

## 📚 Documentation

**[View Full Documentation →](https://j0hnm4r5.github.io/hagen-docs/)**

Complete guides, examples, and API reference available at the [documentation site](https://j0hnm4r5.github.io/hagen-docs/). Documentation is maintained in a [separate repository](https://github.com/j0hnm4r5/hagen-docs).

Hagen enhances your logging with beautifully colored labels that stay consistent between calls. Perfect for debugging, monitoring, and making your console output actually readable.

## ✨ Features

- **🎨 Consistent Coloring** - Same label = same color (automatic hash-based selection)
- **🎯 Instance-Based Architecture** - Create multiple independent loggers with different configs
- **📦 Zero Config** - Works immediately with sensible defaults
- **🎭 Multiple Log Levels** - `log`, `info`, `success`, `warn`, `error` with distinct visual styles
- **⚡ Lightweight** - ~4.4KB minified ESM bundle
- **🔧 Highly Configurable** - Timestamps, custom colors, label prefixes/suffixes, and more
- **🌈 Custom Colors** - Use color indexes, Chalk instances, or hex colors
- **📏 Fixed-Width Labels** - Optional centering and truncation for aligned output
- **🤖 CI Support** - Auto-detects CI environments and disables colors appropriately
- **📘 TypeScript First** - Full type safety with comprehensive JSDoc
- **🚀 Modern Stack** - ESM + CommonJS, Node 20+, tested on 20/22/24/25
- **✅ Well Tested** - 96.55% code coverage with unit and browser tests

## 📦 Installation

```bash
npm install hagen
```

## 🚀 Quick Start

```typescript
import hagen from "hagen";

// Ready to use immediately!
hagen.log("API", "Request received");
hagen.info("AUTH", "User logged in");
hagen.success("DB", "Connection established");
hagen.warn("CACHE", "High memory usage");
hagen.error("API", "Request failed", error);
```

## 📖 Usage

### Three Ways to Import

```typescript
// 1. Default instance (quickest)
import hagen from "hagen";
hagen.log("API", "Hello");

// 2. Named imports (convenient)
import { log, info, success, warn, error } from "hagen";
log("API", "Hello");

// 3. Custom instance (recommended for apps)
import { createHagen } from "hagen";
const logger = createHagen({ showTimestamp: true });
logger.log("API", "Hello");
```

### Log Levels

Each method produces distinct visual styles:

```typescript
// General logging (auto-colored labels)
hagen.log("API", "Request data:", requestData);

// Info (blue, prefixed with 'i')
hagen.info("SYSTEM", "Service started on port 3000");

// Success (green, prefixed with '✓')
hagen.success("DB", "Migration completed successfully");

// Warning (yellow, prefixed with '!', uses console.warn)
hagen.warn("MEMORY", "Heap usage at 85%");

// Error (red, prefixed with '✕', uses console.error)
hagen.error("API", "Failed to fetch user", error);
```

### Label Formats

Labels can be strings or objects with custom styling:

```typescript
// Simple string (auto-colored)
hagen.log("API", "Hello");

// With color index (0-5 from color palette)
hagen.log({ label: "DB", color: 2 }, "Query executed");

// With custom hex colors
hagen.log(
  { label: "CUSTOM", bgColor: "#ff0000", fgColor: "#ffffff" },
  "Red background, white text"
);

// With custom prefix/suffix
hagen.log(
  { label: "WORKER", prefix: ">>", suffix: "<<" },
  "Custom decorators"
);
```

### Configuration

Create configured instances for different parts of your app:

```typescript
import { createHagen } from "hagen";

// API logger with timestamps
const apiLogger = createHagen({
  showTimestamp: true,
  dateFormat: "time",
  timeFormat: "12h"
});

// Database logger with custom prefixes
const dbLogger = createHagen({
  labelPrefix: "[DB]",
  labelSuffix: ""
});

// Test logger with colors disabled
const testLogger = createHagen({
  enableColor: false
});
```

### Available Configuration Options

```typescript
interface LoggerConfig {
  // Timestamps
  showTimestamp?: boolean;              // Default: false
  dateFormat?: "iso" | "locale" | "time" | ((date: Date) => string); // Default: "iso"
  timeFormat?: "12h" | "24h";           // Default: "24h"
  
  // Colors
  enableColor?: boolean;                // Default: true (false in CI)
  
  // Label formatting
  labelPrefix?: string;                 // Default: none
  labelSuffix?: string;                 // Default: none
  
  // Advanced: Fixed-width labels
  fixedWidth?: {
    width: number;
    truncationMethod?: "start" | "end" | "middle";
  };
}
```

### Multiple Independent Loggers

Perfect for large applications:

```typescript
// lib/logger.ts - Shared loggers for your app
import { createHagen } from "hagen";

export const apiLogger = createHagen({
  showTimestamp: true,
  labelPrefix: "[API]"
});

export const dbLogger = createHagen({
  showTimestamp: true,
  labelPrefix: "[DB]"
});

export const cacheLogger = createHagen({
  labelPrefix: "[CACHE]"
});
```

```typescript
// services/api.ts
import { apiLogger } from "./lib/logger";

export async function fetchUser(id: string) {
  apiLogger.info("FETCH", `Fetching user ${id}`);
  // ...
  apiLogger.success("FETCH", "User retrieved");
}
```

### Advanced: Color Cache Management

Hagen caches label→color mappings for performance. Clear if needed:

```typescript
import { clearColorCache } from "hagen";

// After processing a batch of unique labels
clearColorCache();
```

## 🔄 Migration from v3

v4.0.0 introduces **breaking changes** for a better, more modern API:

### Breaking Changes

1. **Minimum Node.js version**: Now requires Node 20+ (was 10+)
2. **Removed global config methods**: `setConfig()`, `getConfig()`, `resetConfig()` are gone
3. **Instance-based architecture**: Use `createHagen()` instead

### Migration Guide

**v3.x (Old)**
```typescript
import hagen, { setConfig } from "hagen";

// Global configuration
setConfig({ showTimestamp: true });

hagen.log("API", "Hello");
```

**v4.x (New)**
```typescript
import { createHagen } from "hagen";

// Instance configuration
const logger = createHagen({ showTimestamp: true });

logger.log("API", "Hello");
```

**For quick migration with minimal changes:**
```typescript
// Create a configured instance once
import { createHagen } from "hagen";
const hagen = createHagen({ showTimestamp: true });

// Export and use everywhere
export default hagen;
```

See [MIGRATION.md](./MIGRATION.md) for detailed migration instructions.

## 🤖 CI Environments

Hagen automatically detects CI environments using [std-env](https://github.com/unjs/std-env) and:
- Disables colored output
- Renders labels in plain text: `[ LABEL ] message`

Works with GitHub Actions, GitLab CI, CircleCI, Travis CI, and more.

## 📚 Full Documentation

For comprehensive documentation including detailed guides, examples, and complete API reference:

**[https://j0hnm4r5.github.io/hagen](https://j0hnm4r5.github.io/hagen)**

## 🧪 Browser Support

Hagen works in all modern browsers with ES2022 support:
- Chrome 102+
- Firefox 115+
- Safari 15.4+
- Edge 102+

```html
<script type="module">
  import hagen from "https://cdn.skypack.dev/hagen";
  hagen.log("BROWSER", "Hello from the browser!");
</script>
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run browser tests
npm run test:browser

# Build
npm run build

# Lint
npm run lint

# Type check
npm run type-check

# Generate docs
npm run docs:generate
```

## 🧰 Tech Stack

- **Runtime**: Node.js 20+
- **Colors**: [Chalk](https://github.com/chalk/chalk) 5.x
- **Environment Detection**: [std-env](https://github.com/unjs/std-env)
- **Build**: [tsup](https://github.com/egoist/tsup)
- **Testing**: [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev)
- **CI/CD**: GitHub Actions + [semantic-release](https://github.com/semantic-release/semantic-release)

## 💡 Inspiration

- [xa](https://github.com/xxczaki/xa) - Colorful terminal logs
- [consola](https://github.com/unjs/consola/) - Elegant console wrapper

## 👥 Contributors

- [John Mars](http://hellomars.dev) - Creator & Maintainer

## 📄 License

MIT © [John Mars](http://hellomars.dev)

---

**Hagen** is named after Hagen, the colorful lumberjack from [Synthie Forest](https://vimeo.com/90995716).
