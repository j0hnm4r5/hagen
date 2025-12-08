# Basic Usage

Learn the fundamentals of logging with Hagen through simple, practical examples.

## Default Instance

The quickest way to get started:

```typescript
import hagen from "hagen";

hagen.log("APP", "Application starting");
hagen.info("CONFIG", "Configuration loaded");
hagen.success("INIT", "Initialization complete");
```

<Terminal exampleId="basic-usage" title="Basic Usage Example" />

## All Log Levels

Hagen provides five log levels:

```typescript
import hagen from "hagen";

// General logging (auto-colored labels)
hagen.log("API", "Request received for /api/users");

// Informational (blue with 'i' prefix)
hagen.info("AUTH", "Authentication required for this endpoint");

// Success (green with '✓' prefix)
hagen.success("DB", "Database connection established");

// Warning (yellow with '!' prefix)
hagen.warn("CACHE", "Cache hit rate below 80%");

// Error (red with '✕' prefix)
hagen.error("API", "Request failed", new Error("Timeout"));
```

## String Labels

Simple string labels are the most common way to use Hagen:

```typescript
hagen.log("API", "Starting server");
hagen.log("DB", "Connecting to database");
hagen.log("CACHE", "Initializing cache");

// Same label = same color
hagen.log("API", "Server listening on port 3000");
hagen.log("API", "Accepting connections");
// Both "API" logs will have the same color
```

## Object Labels

For more control, use object labels:

```typescript
// With color index (0-5)
hagen.log({ label: "API", color: 2 }, "Blue API label");
hagen.log({ label: "DB", color: 4 }, "Green DB label");

// With custom hex colors
hagen.log(
  {
    label: "CUSTOM",
    bgColor: "#FF6B6B",
    fgColor: "#FFFFFF"
  },
  "Red background, white text"
);

// With prefix/suffix
hagen.log(
  {
    label: "WORKER",
    prefix: ">>",
    suffix: "<<"
  },
  "Custom decorators"
);
```

## Multiple Arguments

Pass multiple arguments just like `console.log`:

```typescript
const user = { id: 123, name: "Alice", role: "admin" };
const timestamp = new Date();

hagen.log("USER", "Fetched user:", user);
// Output: [ USER ] Fetched user: { id: 123, name: 'Alice', role: 'admin' }

hagen.log("USER", "Login at", timestamp, "from IP", "192.168.1.1");
// Output: [ USER ] Login at 2025-12-07T... from IP 192.168.1.1

hagen.error("API", "Request failed", new Error("Timeout"), { endpoint: "/users" });
// Output: [ API ] ✕ Request failed Error: Timeout ... { endpoint: '/users' }
```

## Common Patterns

### Startup Sequence

```typescript
import hagen from "hagen";

async function startApp() {
  hagen.info("APP", "Starting application");
  
  hagen.log("CONFIG", "Loading configuration");
  const config = await loadConfig();
  hagen.success("CONFIG", "Configuration loaded");
  
  hagen.log("DB", "Connecting to database");
  await connectDatabase();
  hagen.success("DB", "Connected to database");
  
  hagen.log("SERVER", "Starting HTTP server");
  await startServer();
  hagen.success("SERVER", `Server listening on port ${config.port}`);
  
  hagen.success("APP", "Application started successfully");
}
```

### Request Handling

```typescript
import hagen from "hagen";

app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  
  hagen.log("API", `GET /api/users/${id}`);
  
  try {
    const user = await db.getUser(id);
    
    if (!user) {
      hagen.warn("API", `User ${id} not found`);
      return res.status(404).json({ error: "User not found" });
    }
    
    hagen.success("API", `User ${id} retrieved`);
    res.json(user);
  } catch (error) {
    hagen.error("API", `Failed to get user ${id}`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

### Error Handling

```typescript
import hagen from "hagen";

async function processData(data: unknown[]) {
  hagen.log("PROCESS", `Processing ${data.length} items`);
  
  const errors: Error[] = [];
  
  for (const item of data) {
    try {
      await processItem(item);
      hagen.log("PROCESS", `Item ${item.id} processed`);
    } catch (error) {
      hagen.error("PROCESS", `Failed to process item ${item.id}`, error);
      errors.push(error);
    }
  }
  
  if (errors.length === 0) {
    hagen.success("PROCESS", "All items processed successfully");
  } else {
    hagen.warn("PROCESS", `Completed with ${errors.length} errors`);
  }
  
  return errors;
}
```

### Named Imports

Use named imports for cleaner code:

```typescript
import { log, info, success, warn, error } from "hagen";

async function deploy() {
  info("DEPLOY", "Starting deployment");
  
  log("BUILD", "Building application");
  await build();
  success("BUILD", "Build complete");
  
  log("TEST", "Running tests");
  const testResults = await runTests();
  
  if (testResults.failed > 0) {
    warn("TEST", `${testResults.failed} tests failed`);
    error("DEPLOY", "Deployment aborted");
    return;
  }
  
  success("TEST", "All tests passed");
  
  log("DEPLOY", "Deploying to production");
  await deploy();
  success("DEPLOY", "Deployment complete");
}
```

## Practical Example: Express Server

Here's a complete example of an Express.js server using Hagen:

```typescript
import express from "express";
import hagen from "hagen";

const app = express();
const PORT = 3000;

// Logging middleware
app.use((req, res, next) => {
  hagen.log("HTTP", `${req.method} ${req.path}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  hagen.info("ROUTE", "Home page accessed");
  res.send("Hello, World!");
});

app.get("/api/status", (req, res) => {
  hagen.log("API", "Status check requested");
  res.json({ status: "ok", timestamp: Date.now() });
});

app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  
  hagen.log("API", `Fetching user ${id}`);
  
  try {
    const user = await db.getUser(id);
    hagen.success("DB", `User ${id} retrieved`);
    res.json(user);
  } catch (error) {
    hagen.error("DB", `Failed to get user ${id}`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Error handler
app.use((error, req, res, next) => {
  hagen.error("ERROR", "Unhandled error", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  hagen.success("SERVER", `Server listening on port ${PORT}`);
  hagen.info("ENV", `Environment: ${process.env.NODE_ENV || "development"}`);
});
```

## Tips

### Consistent Labeling

Use consistent label names throughout your application:

```typescript
// Good: Consistent labels
hagen.log("API", "Request received");
hagen.log("API", "Processing request");
hagen.log("API", "Request completed");

// Avoid: Inconsistent labels
hagen.log("API", "Request received");
hagen.log("api", "Processing request");  // Different color!
hagen.log("API-REQUEST", "Request completed");  // Different color!
```

### Short Labels

Keep labels short and descriptive:

```typescript
// Good: Short and clear
hagen.log("API", "Message");
hagen.log("DB", "Message");
hagen.log("CACHE", "Message");

// Avoid: Too verbose
hagen.log("API_REQUEST_HANDLER", "Message");
hagen.log("DATABASE_CONNECTION", "Message");
```

### Descriptive Messages

Make messages informative:

```typescript
// Good: Descriptive
hagen.log("API", "GET /api/users/123");
hagen.success("DB", "Query returned 42 rows in 15ms");

// Avoid: Too vague
hagen.log("API", "Request");
hagen.success("DB", "Done");
```

## Next Steps

- [Multiple Loggers](/examples/multiple-loggers) - Using multiple logger instances
- [Custom Styling](/examples/custom-styling) - Customize colors and formatting
- [Configuration Guide](/guide/configuration) - Learn all configuration options
