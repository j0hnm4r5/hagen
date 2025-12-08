# Log Levels

Hagen provides five distinct log levels, each with unique visual styling and use cases.

## Overview

```typescript
import hagen from "hagen";

hagen.log("LABEL", "General logging");      // Auto-colored
hagen.info("LABEL", "Informational");       // Blue with 'i'
hagen.success("LABEL", "Success message");  // Green with '✓'
hagen.warn("LABEL", "Warning message");     // Yellow with '!'
hagen.error("LABEL", "Error message");      // Red with '✕'
```

**Output:**

<Terminal exampleId="log-levels-all" title="All Log Levels" />

Each log level has distinct visual styling:
- `log()` - Colored background (cyan in this case), black text
- `info()` - Blue "i" prefix, white text on dark background
- `success()` - Green "✓" prefix, green text on dark background
- `warn()` - Yellow "!" prefix, yellow text on yellow background
- `error()` - Red "✕" prefix, red text on red background

## `log()` - General Logging

The standard log method for general-purpose messages.

```typescript
hagen.log("API", "Request received");
hagen.log("CACHE", "Cache hit for key: user_123");
hagen.log("WORKER", "Processing job", jobId);
```

<Terminal exampleId="log-levels-log" title="log() Method" />

**Characteristics:**
- Uses `console.log` internally
- Label color determined automatically (hash-based)
- No prefix icon
- Standard output stream

**When to use:**
- General application events
- Debug information
- State changes
- Progress updates

## `info()` - Informational Messages

Blue-styled informational messages with an 'i' prefix.

```typescript
hagen.info("CONFIG", "Loaded configuration from env");
hagen.info("AUTH", "User authentication required");
hagen.info("SYSTEM", "Service started on port 3000");
```

<Terminal exampleId="log-levels-info" title="info() Method" />

**Characteristics:**
- Uses `console.log` internally
- Blue label color (always)
- 'i' prefix icon
- Indicates informational context

**When to use:**
- System information
- Configuration details
- Status notifications
- Non-critical announcements

## `success()` - Success Messages

Green-styled success messages with a checkmark prefix.

```typescript
hagen.success("DB", "Database connection established");
hagen.success("API", "Request completed successfully");
hagen.success("AUTH", "User logged in");
```

<Terminal exampleId="log-levels-success" title="success() Method" />

**Characteristics:**
- Uses `console.log` internally
- Green label color (always)
- '✓' prefix icon
- Positive feedback indicator

**When to use:**
- Successful operations
- Completed tasks
- Positive confirmations
- Achievement milestones

## `warn()` - Warning Messages

Yellow-styled warning messages with an exclamation mark prefix.

```typescript
hagen.warn("CACHE", "Cache size exceeding 80% capacity");
hagen.warn("API", "Rate limit approaching");
hagen.warn("MEMORY", "High memory usage detected");
```

<Terminal exampleId="log-levels-warn" title="warn() Method" />

**Characteristics:**
- Uses `console.warn` internally
- Yellow label color (always)
- '!' prefix icon
- Appears in stderr stream
- May include stack traces in some environments

**When to use:**
- Potential issues
- Deprecated feature usage
- Performance concerns
- Non-critical errors
- Things that should be addressed but don't break functionality

## `error()` - Error Messages

Red-styled error messages with an X prefix.

```typescript
hagen.error("API", "Request failed", new Error("Timeout"));
hagen.error("DB", "Connection lost", dbError);
hagen.error("AUTH", "Invalid credentials");
```

<Terminal exampleId="log-levels-error" title="error() Method" />

**Characteristics:**
- Uses `console.error` internally
- Red label color (always)
- '✕' prefix icon
- Appears in stderr stream
- Typically includes stack traces
- Can be caught by error monitoring tools

**When to use:**
- Exceptions and errors
- Failed operations
- Critical issues
- Unexpected conditions
- Problems requiring immediate attention

## Method Signatures

All log methods have the same signature:

```typescript
type LogMethod = (label: Label, message?: unknown, ...data: unknown[]) => void;
```

Where `Label` can be:
- A string: `"API"`
- An object: `{ label: "API", color: 2 }`

### Multiple Arguments

All methods accept multiple arguments:

```typescript
const user = { id: 123, name: "Alice" };
const timestamp = Date.now();

hagen.log("USER", "Fetched user:", user, "at", timestamp);
hagen.error("API", "Request failed", error, { endpoint: "/users" });
```

## Visual Comparison

Here's how the different levels appear:

```typescript
// All levels with the same label
hagen.log("DEMO", "This is a log message");
hagen.info("DEMO", "This is an info message");
hagen.success("DEMO", "This is a success message");
hagen.warn("DEMO", "This is a warning message");
hagen.error("DEMO", "This is an error message");
```

Expected output:
```
[ DEMO ] This is a log message                    (auto-colored)
i [ DEMO ] This is an info message                (blue)
✓ [ DEMO ] This is a success message              (green)
! [ DEMO ] This is a warning message              (yellow)
✕ [ DEMO ] This is an error message               (red)
```

## Console Method Mapping

| Hagen Method | Console Method | Output Stream |
|--------------|----------------|---------------|
| `log()` | `console.log()` | stdout |
| `info()` | `console.log()` | stdout |
| `success()` | `console.log()` | stdout |
| `warn()` | `console.warn()` | stderr |
| `error()` | `console.error()` | stderr |

### Why This Matters

- **stdout**: Standard output, typically shown normally
- **stderr**: Standard error, may be styled differently (red in many terminals)
- **Piping**: You can separate errors from normal output when piping commands

```bash
# Only capture normal logs, errors go to console
node app.js > output.log

# Only capture errors
node app.js 2> errors.log

# Separate both
node app.js > output.log 2> errors.log
```

## Practical Examples

### API Request Handling

```typescript
async function handleRequest(req: Request) {
  hagen.log("API", `${req.method} ${req.url}`);
  
  try {
    hagen.info("AUTH", "Validating request token");
    const user = await validateToken(req.headers.authorization);
    
    hagen.success("AUTH", `User ${user.id} authenticated`);
    
    const response = await processRequest(req, user);
    hagen.success("API", "Request completed successfully");
    
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      hagen.warn("AUTH", "Invalid token provided");
    } else {
      hagen.error("API", "Request failed", error);
    }
    throw error;
  }
}
```

### Database Operations

```typescript
async function connectDatabase() {
  hagen.log("DB", "Attempting database connection");
  
  try {
    await db.connect();
    hagen.success("DB", "Connected to database");
    
    const poolSize = db.getPoolSize();
    hagen.info("DB", `Connection pool size: ${poolSize}`);
    
    if (poolSize > 80) {
      hagen.warn("DB", "Connection pool usage is high");
    }
  } catch (error) {
    hagen.error("DB", "Failed to connect", error);
    throw error;
  }
}
```

### Background Jobs

```typescript
async function processJob(job: Job) {
  hagen.log("WORKER", `Processing job ${job.id}`);
  
  const startTime = Date.now();
  
  try {
    await job.execute();
    
    const duration = Date.now() - startTime;
    hagen.success("WORKER", `Job ${job.id} completed in ${duration}ms`);
    
    if (duration > 5000) {
      hagen.warn("WORKER", `Job ${job.id} took longer than expected`);
    }
  } catch (error) {
    hagen.error("WORKER", `Job ${job.id} failed`, error);
    await job.retry();
    hagen.info("WORKER", `Job ${job.id} queued for retry`);
  }
}
```

## CI Environment Behavior

In CI environments, all log levels lose their colors but keep their prefixes:

```
[ API ] Request received
i [ API ] Informational message
✓ [ API ] Success message
! [ API ] Warning message
✕ [ API ] Error message
```

This ensures:
- Clean, parseable logs
- Preserved semantic meaning
- No ANSI escape codes in log files

## Next Steps

- [Custom Colors](/guide/custom-colors) - Customize label colors
- [Configuration](/guide/configuration) - Configure logger behavior
- [Examples](/examples/basic-usage) - See log levels in action
