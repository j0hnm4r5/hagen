# Examples

Explore practical examples of Hagen in action.

## Quick Navigation

### Getting Started
- [Basic Usage](/examples/basic-usage) - Simple logging examples with all log levels
- [Multiple Loggers](/examples/multiple-loggers) - Using multiple logger instances in larger apps

### Customization
- [Custom Styling](/examples/custom-styling) - Colors, prefixes, suffixes, and fixed-width labels
- [TypeScript](/examples/typescript) - Type-safe logging patterns

### Integration
- [CI Environments](/examples/ci-environments) - Using Hagen in CI/CD pipelines
- [Browser Usage](/examples/browser-usage) - Running Hagen in web browsers

## Example Categories

### 🎯 Beginner Examples

Perfect for getting started:

- **Basic Usage**: Learn the fundamentals of logging with Hagen
- **Multiple Loggers**: Set up loggers for different parts of your app

### 🎨 Customization Examples

Make Hagen your own:

- **Custom Styling**: Colors, decorators, and label formatting
- **TypeScript**: Leverage full type safety

### 🔧 Integration Examples

Use Hagen in production:

- **CI Environments**: Clean output for continuous integration
- **Browser Usage**: Client-side logging

## Real-World Scenarios

### Web API Server

```typescript
import { createHagen } from "hagen";

const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time"
});

app.get("/api/users/:id", async (req, res) => {
  logger.log("API", `GET /api/users/${req.params.id}`);
  
  try {
    const user = await db.getUser(req.params.id);
    logger.success("DB", "User retrieved");
    res.json(user);
  } catch (error) {
    logger.error("API", "Request failed", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

### CLI Tool

```typescript
import { createHagen } from "hagen";

const logger = createHagen({
  showTimestamp: false,  // Clean output for CLI
  enableColor: !process.env.NO_COLOR
});

async function build() {
  logger.info("BUILD", "Starting build process");
  
  logger.log("COMPILE", "Compiling TypeScript");
  await compile();
  logger.success("COMPILE", "TypeScript compilation complete");
  
  logger.log("BUNDLE", "Creating bundle");
  await bundle();
  logger.success("BUNDLE", "Bundle created");
  
  logger.success("BUILD", "Build complete!");
}
```

### Microservices

```typescript
// services/api/logger.ts
import { createHagen } from "hagen";

export const logger = createHagen({
  showTimestamp: true,
  labelPrefix: "[API-SERVICE]"
});

// services/auth/logger.ts
export const logger = createHagen({
  showTimestamp: true,
  labelPrefix: "[AUTH-SERVICE]"
});

// services/db/logger.ts
export const logger = createHagen({
  showTimestamp: true,
  labelPrefix: "[DB-SERVICE]"
});
```

## Code Snippets

### Error Handling

```typescript
try {
  await riskyOperation();
  logger.success("OPS", "Operation completed");
} catch (error) {
  if (error instanceof ValidationError) {
    logger.warn("VALIDATION", error.message);
  } else if (error instanceof NetworkError) {
    logger.error("NETWORK", "Connection failed", error);
  } else {
    logger.error("UNKNOWN", "Unexpected error", error);
  }
  throw error;
}
```

### Progress Tracking

```typescript
const items = await fetchItems();
logger.info("PROCESS", `Processing ${items.length} items`);

for (let i = 0; i < items.length; i++) {
  await processItem(items[i]);
  if ((i + 1) % 100 === 0) {
    logger.log("PROGRESS", `Processed ${i + 1}/${items.length} items`);
  }
}

logger.success("PROCESS", `All ${items.length} items processed`);
```

### Performance Monitoring

```typescript
const start = Date.now();
logger.log("PERF", "Starting heavy operation");

await heavyOperation();

const duration = Date.now() - start;
if (duration > 1000) {
  logger.warn("PERF", `Operation took ${duration}ms (>1s)`);
} else {
  logger.success("PERF", `Operation completed in ${duration}ms`);
}
```

## Next Steps

Pick an example that matches your use case and dive in!

- [Basic Usage](/examples/basic-usage) - Start here if you're new
- [Multiple Loggers](/examples/multiple-loggers) - For larger applications
- [Custom Styling](/examples/custom-styling) - Make it your own
- [TypeScript](/examples/typescript) - Full type safety
- [CI Environments](/examples/ci-environments) - Production-ready
- [Browser Usage](/examples/browser-usage) - Client-side logging
