# Getting Started

Welcome to Hagen! This guide will help you understand what Hagen is, why you might want to use it, and how to get started.

## What is Hagen?

Hagen is a colorful, instance-based logger designed for JavaScript and TypeScript applications running in Node.js and modern browsers. It enhances your console output with beautifully colored labels that remain consistent across log calls, making it easier to track different parts of your application.

## Why Hagen?

### The Problem

When building applications, especially larger ones with multiple modules or services, console logs quickly become difficult to read and distinguish:

```typescript
console.log("Fetching user data...");
console.log("Cache miss");
console.log("Database query executed");
console.log("User data retrieved");
```

Without visual distinction, it's hard to tell which log comes from which part of your application.

### The Solution

Hagen automatically assigns consistent colors to labels, making logs instantly recognizable:

```typescript
import hagen from "hagen";

hagen.log("API", "Fetching user data...");
hagen.log("CACHE", "Cache miss");
hagen.log("DB", "Database query executed");
hagen.success("API", "User data retrieved");
```

<Terminal exampleId="basic-usage" title="Visual Distinction with Hagen" />

Each label gets a consistent color based on its text, so "API" is always the same color, "CACHE" is always another color, etc. The colors are chosen automatically using a hash-based algorithm, ensuring consistency without any configuration.

## Key Features

### 🎨 Consistent Coloring

Labels are automatically colored using a hash-based algorithm. The same label always gets the same color, making your logs predictable and easy to scan.

### 🎯 Instance-Based Architecture

Create multiple logger instances with different configurations. No global state means better testability and flexibility.

```typescript
import { createHagen } from "hagen";

const apiLogger = createHagen({ showTimestamp: true });
const dbLogger = createHagen({ labelPrefix: "[DB]" });
```

### ⚡ Lightweight

At just ~4.4KB minified, Hagen adds minimal overhead to your application. It has only two dependencies: `chalk` for colors and `std-env` for environment detection.

### 📘 TypeScript First

Written in TypeScript with full type safety. Comprehensive JSDoc comments provide excellent IDE support even in JavaScript projects.

### 🌈 Highly Configurable

Customize everything:
- Timestamps with multiple formats
- Custom colors (palette indexes, hex codes, or Chalk instances)
- Label prefixes and suffixes
- Fixed-width labels with truncation
- Color enable/disable

### 🤖 CI Ready

Hagen automatically detects CI environments and disables color output, ensuring your CI logs remain clean and parseable.

## When to Use Hagen

Hagen is perfect for:

- **CLI Tools** - Make your terminal output beautiful and professional
- **Development Servers** - Track requests, database queries, and cache operations
- **Microservices** - Distinguish between different services in a monorepo
- **Debugging** - Quickly identify the source of log messages
- **Testing** - Create isolated logger instances for each test

## Architecture

### Instance-Based Design

Unlike v3.x which used global configuration, v4.0 is built around independent logger instances:

```typescript
// Create a logger with specific configuration
const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time"
});

// Each instance is independent
const debugLogger = createHagen({ enableColor: process.env.DEBUG });
```

This design:
- Eliminates global state
- Improves testability
- Allows per-module configuration
- Prevents configuration conflicts

### Color Consistency

Hagen uses a deterministic hash function to map label strings to colors. This means:
- Same label → Same color (always)
- Different labels → Different colors (usually)
- No configuration needed
- Predictable visual output

## What's New in v4.0

Hagen v4.0 is a major rewrite with breaking changes:

- ✅ **Instance-based architecture** (no more global config)
- ✅ **Node 20+ required** (modernized codebase)
- ✅ **Enhanced Label type** (custom prefix/suffix support)
- ✅ **Improved TypeScript** (full strict mode)
- ✅ **Better testing** (96.55% code coverage)

See the [Migration Guide](/guide/migration) for upgrade instructions.

## Next Steps

Ready to get started?

1. [Install Hagen](/guide/installation) - Set up Hagen in your project
2. [Quick Start](/guide/quick-start) - Write your first logs
3. [Configuration](/guide/configuration) - Customize Hagen to your needs

Or jump straight to the [Examples](/examples/) to see Hagen in action!
