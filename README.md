# Hagen

![Screenshot](https://github.com/j0hnm4r5/hagen/raw/main/assets/screenshot.png)

A colorful, instance-based logger for JavaScript and TypeScript in Node.js and modern browsers.

## 📚 Documentation

**[View Full Documentation →](https://j0hnm4r5.github.io/hagen-docs/)**

Complete guides, examples, and API reference available at the [documentation site](https://j0hnm4r5.github.io/hagen-docs/).

Hagen enhances your logging with beautifully colored labels that stay consistent between calls. Perfect for debugging, monitoring, and making your console output actually readable.

## ✨ Features

- **🎨 Deterministic Coloring** - Labels are automatically assigned consistent colors based on their text content—your "API" label will always be the same color, across every run.
- **👁️ Smart Contrast** - Never squint at terminal output again. Hagen automatically calculates WCAG-compliant foreground text (black or white) based on background luminance.
- **📐 Powerline-Ready Layouts** - Customize your log format using simple template strings (`"%l [ %t ] %m"`) or complex arrays. Includes a built-in library of Powerline symbols for professional-grade terminal UIs.
- **📦 Zero-Config & Tree-Shakeable** - Works immediately out of the box with a default instance. Modular architecture and ESM-only build ensure a tiny footprint (~5kB).
- **🛠️ Native Data Handling** - Hagen passes objects, arrays, and errors directly to console methods, preserving interactive expansion and stack traces in browser DevTools and Node consoles.
- **🤖 CI Support** - Auto-detects CI environments and disables colors appropriately (but respects [NO_COLOR](https://no-color.org/) and [FORCE_COLOR](https://force-color.org/) environment variables).
- **⌨️ CLI Included** - Pipe stdout/stdin directly into hagen for instant pretty-printing of logs from other tools.
- **🦕 Modern Stack** - Built for the modern web: Native TypeScript types, Node 20+ support, and [one tiny dependency](https://github.com/webdiscus/ansis).

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
const logger = createHagen({ layout: "%t %l %m" });
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
hagen.log({ label: "WORKER", prefix: ">>", suffix: "<<" }, "Custom decorators");
```

### Configuration

Create configured instances for different parts of your app:

```typescript
import { createHagen } from "hagen";

// API logger with timestamps
const apiLogger = createHagen({
	layout: "%t %l %m",
	timestampOptions: {
		formatter: (date) => date.toLocaleTimeString(),
	},
});

// Database logger with custom prefixes
const dbLogger = createHagen({
	layout: "[DB] %l %m",
});

// Test logger with colors disabled
const testLogger = createHagen({
	colorOptions: { enabled: false },
});
```

### Available Configuration Options

```typescript
interface LoggerConfig {
	/** Output layout. Default: "%l %m" */
	layout?: string; // e.g. "%t [%l] %m"

	labelOptions?: {
		/** Fixed width for labels */
		fixedWidth?: number;
		/** Truncation strategy */
		truncationMethod?: "start" | "end" | "middle";
		/** Default label text. Default: "*" */
		defaultText?: string;
	};

	colorOptions?: {
		/** Enable/disable colors. Default: auto-detect */
		enabled?: boolean;
		/** Quantize colors to a reduced palette (e.g. 8, 256) */
		paletteSize?: number;
	};

	timestampOptions?: {
		/** Custom timestamp formatter */
		formatter?: (date: Date) => string;
	};

	/** Default styles for segments */
	segmentStyles?: Record<string, SegmentStyle>;
}
```

### Multiple Independent Loggers

Perfect for large applications:

```typescript
// lib/logger.ts - Shared loggers for your app
import { createHagen } from "hagen";

export const apiLogger = createHagen({
	layout: "[API] %t %l %m",
});

export const logger = createHagen({
	layout: process.env.NODE_ENV === "production" ? "%t %l %m" : "%l %m",
});

export const cacheLogger = createHagen({
	layout: "[CACHE] %l %m",
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

## 🔄 Migration from v3

v4.0.0 introduces **breaking changes** for a better, more modern API:

### Breaking Changes

1. **Minimum Node.js version**: Now requires Node 20+ (was 10+)
2. **Removed global config methods**: `setConfig()`, `getConfig()`, `resetConfig()` are gone
3. **Instance-based architecture**: Use `createHagen()` instead

### Migration Guide

#### v3.x (Old)

```typescript
import hagen, { setConfig } from "hagen";

const config: Partial<LoggerConfig> = {
	layout: "%t %l %m",
	timestampOptions: {
		formatter: (date) => date.toISOString(),
	},
};
```

#### v4.x (New)

```typescript
import { createHagen } from "hagen";

// Instance configuration
const logger = createHagen({ layout: "%t %l %m" });

logger.log("API", "Hello");
```

#### For quick migration with minimal changes

```typescript
// Create a configured instance once
import { createHagen } from "hagen";
const hagen = createHagen({ layout: "%t %l %m" });

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
