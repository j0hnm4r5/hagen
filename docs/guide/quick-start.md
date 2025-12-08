# Quick Start

Get up and running with Hagen in 5 minutes.

## Basic Usage

The simplest way to use Hagen is with the default instance:

```typescript
import hagen from "hagen";

hagen.log("API", "Server started on port 3000");
```

That's it! You now have colorful, labeled logging in your application.

## Three Ways to Import

Hagen offers three import patterns to match your coding style:

### 1. Default Instance

Import the pre-configured default instance:

```typescript
import hagen from "hagen";

hagen.log("API", "Request received");
hagen.info("AUTH", "User authenticated");
hagen.success("DB", "Connection established");
```

**Best for**: Quick prototypes, small scripts, getting started

### 2. Named Imports

Import individual log methods:

```typescript
import { log, info, success, warn, error } from "hagen";

log("API", "Request received");
info("AUTH", "User authenticated");
success("DB", "Connection established");
```

**Best for**: Cleaner code, functional style, less typing

### 3. Custom Instance

Create your own configured instance:

```typescript
import { createHagen } from "hagen";

const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time"
});

logger.log("API", "Request received");
logger.success("API", "Request completed");
```

**Best for**: Applications, custom configuration, multiple loggers

## Your First Logs

Let's explore the five log levels:

```typescript
import hagen from "hagen";

// General logging (auto-colored label)
hagen.log("APP", "Application starting...");

// Informational (blue with 'i' prefix)
hagen.info("CONFIG", "Loaded configuration from env");

// Success (green with '✓' prefix)
hagen.success("DB", "Database connection established");

// Warning (yellow with '!' prefix, uses console.warn)
hagen.warn("CACHE", "Cache size exceeding threshold");

// Error (red with '✕' prefix, uses console.error)
hagen.error("API", "Request failed", new Error("Timeout"));
```

**What you'll see in your terminal:**

<Terminal exampleId="quick-start-basic" title="Five Log Levels" />

- **log()**: Colored background with label (color chosen automatically)
- **info()**: Blue "i" icon before the label
- **success()**: Green "✓" checkmark before the label
- **warn()**: Yellow "!" warning icon before the label
- **error()**: Red "✕" error icon before the label

## Label Formats

Labels can be simple strings or objects for more control:

### String Labels

The simplest form - Hagen picks the color automatically:

```typescript
hagen.log("API", "Simple string label");
hagen.log("DATABASE", "Another label");
```

Labels with the same text always get the same color.

### Object Labels with Color Index

Choose from the color palette (0-5):

```typescript
hagen.log({ label: "API", color: 0 }, "Cyan");
hagen.log({ label: "API", color: 1 }, "Magenta");
hagen.log({ label: "API", color: 2 }, "Blue");
hagen.log({ label: "API", color: 3 }, "Yellow");
hagen.log({ label: "API", color: 4 }, "Green");
hagen.log({ label: "API", color: 5 }, "Red");
```

### Object Labels with Custom Colors

Use hex colors for full control:

```typescript
hagen.log(
  {
    label: "CUSTOM",
    bgColor: "#FF6B6B",
    fgColor: "#FFFFFF"
  },
  "Red background, white text"
);
```

### Object Labels with Prefix/Suffix

Add custom decorators around your labels:

```typescript
hagen.log(
  {
    label: "WORKER",
    prefix: ">>",
    suffix: "<<"
  },
  "Custom brackets"
);
// Output: >> WORKER << Custom brackets
```

## Multiple Arguments

All log methods accept multiple arguments, just like `console.log`:

```typescript
const user = { id: 123, name: "Alice" };
const timestamp = new Date();

hagen.log("USER", "Fetched user:", user, "at", timestamp);
// Output: [ USER ] Fetched user: { id: 123, name: 'Alice' } at 2025-12-07T...
```

## Adding Timestamps

Enable timestamps for any logger instance:

```typescript
import { createHagen } from "hagen";

const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time",  // Just show time, not date
  timeFormat: "12h"    // 12-hour format with AM/PM
});

logger.log("API", "Request at specific time");
// Output: 3:45:23 PM [ API ] Request at specific time
```

## Creating a Shared Logger

For applications, create a shared logger module:

```typescript
// lib/logger.ts
import { createHagen } from "hagen";

export const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time",
  timeFormat: "12h"
});
```

Then use it throughout your app:

```typescript
// services/api.ts
import { logger } from "../lib/logger";

export async function fetchUser(id: string) {
  logger.info("API", `Fetching user ${id}`);
  
  try {
    const user = await fetch(`/api/users/${id}`);
    logger.success("API", `User ${id} fetched`);
    return user;
  } catch (error) {
    logger.error("API", `Failed to fetch user ${id}`, error);
    throw error;
  }
}
```

## Real-World Example

Here's a complete example of a simple Express server:

```typescript
import express from "express";
import { createHagen } from "hagen";

// Create logger with timestamps
const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time"
});

const app = express();
const PORT = 3000;

// Middleware logging
app.use((req, res, next) => {
  logger.log("HTTP", `${req.method} ${req.path}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  logger.info("ROUTE", "Home page accessed");
  res.send("Hello, World!");
});

app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  
  logger.log("API", `Fetching user ${id}`);
  
  try {
    // Simulate database call
    const user = await db.getUser(id);
    logger.success("DB", `User ${id} retrieved`);
    res.json(user);
  } catch (error) {
    logger.error("DB", `Failed to get user ${id}`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  logger.success("SERVER", `Listening on port ${PORT}`);
  logger.info("ENV", `Environment: ${process.env.NODE_ENV}`);
});
```

## Next Steps

Now that you know the basics, explore more features:

- [Configuration](/guide/configuration) - All configuration options
- [Log Levels](/guide/log-levels) - Detailed explanation of each level
- [Custom Colors](/guide/custom-colors) - Advanced color customization
- [Examples](/examples/) - More real-world examples
