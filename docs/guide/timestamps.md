# Timestamps

Add timestamps to your logs for better debugging and monitoring.

## Enabling Timestamps

Enable timestamps when creating a logger instance:

```typescript
import { createHagen } from "hagen";

const logger = createHagen({
  showTimestamp: true
});

logger.log("API", "Request received");
// Output: 2025-12-07T10:30:45.123Z [ API ] Request received
//         ^^^^^^^^^^^^^^^^^^^^^^^^^ ISO timestamp with milliseconds
```

## Date Formats

Hagen supports four date format options via the `dateFormat` configuration.

### ISO Format (Default)

ISO 8601 standard format with milliseconds:

```typescript
const logger = createHagen({
  showTimestamp: true,
  dateFormat: "iso"  // This is the default
});

logger.log("API", "Message");
// Output: 2025-12-07T10:30:45.123Z [ API ] Message
```

**Best for:**
- Production logs
- Log aggregation systems
- Consistent, sortable timestamps
- International applications

### Locale Format

Human-readable locale-specific format:

```typescript
const logger = createHagen({
  showTimestamp: true,
  dateFormat: "locale"
});

logger.log("API", "Message");
// Output: 12/7/2025, 10:30:45 AM [ API ] Message
//         ^^^^^^^^^^^^^^^^^^^^^ Human-readable, locale-specific
```

**Best for:**
- Local development
- Region-specific applications
- Human readability

**Note**: Format varies by system locale (US format shown above).

### Time Only

Show just the time, no date:

```typescript
const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time"
});

logger.log("API", "Message");
// Output: 10:30:45 [ API ] Message
```

**Best for:**
- Development (same-day logs)
- Short-running processes
- Real-time monitoring
- Cleaner output

### Custom Function

Complete control with a custom formatting function:

```typescript
const logger = createHagen({
  showTimestamp: true,
  dateFormat: (date: Date) => {
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  }
});

logger.log("API", "Message");
// Output: 10:30:45 [ API ] Message
```

**Examples:**

```typescript
// Unix timestamp
dateFormat: (date) => date.getTime().toString()
// Output: 1701950445123 [ API ] Message

// Relative time (requires library)
dateFormat: (date) => formatDistanceToNow(date)
// Output: 2 minutes ago [ API ] Message

// Custom format
dateFormat: (date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}
// Output: 10:30:45 [ API ] Message
```

## Time Formats

When using `dateFormat: "time"`, choose between 12-hour and 24-hour format:

### 24-Hour Format (Default)

```typescript
const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time",
  timeFormat: "24h"  // This is the default
});

logger.log("API", "Message");
// Output: 14:30:45 [ API ] Message
```

<Terminal exampleId="timestamps-time-24h" title="24-Hour Time Format" />

### 12-Hour Format

```typescript
const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time",
  timeFormat: "12h"
});

logger.log("API", "Message");
// Output: 2:30:45 PM [ API ] Message
```

<Terminal exampleId="timestamps-time-12h" title="12-Hour Time Format" />

**Note**: `timeFormat` only applies when `dateFormat` is set to `"time"`.

## Practical Examples

### Development Logger

Clean, readable timestamps for development:

```typescript
const devLogger = createHagen({
  showTimestamp: true,
  dateFormat: "time",
  timeFormat: "12h"
});

devLogger.log("SERVER", "Server started");
devLogger.log("DB", "Connected to database");
// Output:
// 3:45:23 PM [ SERVER ] Server started
// 3:45:24 PM [ DB ] Connected to database
```

### Production Logger

Precise, parseable timestamps for production:

```typescript
const prodLogger = createHagen({
  showTimestamp: true,
  dateFormat: "iso"
});

prodLogger.log("API", "Request processed");
// Output: 2025-12-07T15:45:23.456Z [ API ] Request processed
```

### Monitoring Logger

High-frequency logging with minimal timestamp overhead:

```typescript
const monitorLogger = createHagen({
  showTimestamp: true,
  dateFormat: (date) => {
    // Just hours:minutes:seconds.milliseconds
    return date.toISOString().split('T')[1];
  }
});

monitorLogger.log("METRICS", "CPU: 45%");
// Output: 15:45:23.456Z [ METRICS ] CPU: 45%
```

### Request Logger

Track request timing:

```typescript
const requestLogger = createHagen({
  showTimestamp: true,
  dateFormat: "time"
});

async function handleRequest(req: Request) {
  requestLogger.log("REQUEST", `${req.method} ${req.path} started`);
  
  const result = await processRequest(req);
  
  requestLogger.success("REQUEST", `${req.method} ${req.path} completed`);
  return result;
}
// Output:
// 15:45:23 [ REQUEST ] GET /api/users started
// 15:45:24 [ REQUEST ] ✓ GET /api/users completed
```

### Performance Measurement

Measure operation duration:

```typescript
const perfLogger = createHagen({
  showTimestamp: true,
  dateFormat: "iso"
});

async function measureOperation() {
  const start = Date.now();
  perfLogger.log("PERF", "Operation started");
  
  await heavyOperation();
  
  const duration = Date.now() - start;
  perfLogger.success("PERF", `Operation completed in ${duration}ms`);
}
```

## Environment-Based Configuration

Configure timestamps based on environment:

```typescript
const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";

const logger = createHagen({
  // Always show timestamps in production
  showTimestamp: isProd || isDev,
  
  // Readable format in dev, ISO in prod
  dateFormat: isDev ? "time" : "iso",
  
  // 12-hour in dev, 24-hour in prod
  timeFormat: isDev ? "12h" : "24h"
});
```

## Timezone Considerations

### ISO Format

ISO format always uses UTC (note the 'Z'):

```typescript
const logger = createHagen({
  showTimestamp: true,
  dateFormat: "iso"
});

logger.log("TIME", "Current time");
// Output: 2025-12-07T15:45:23.456Z [ TIME ] Current time
//                                 ^ UTC timezone
```

### Locale Format

Locale format uses local timezone:

```typescript
const logger = createHagen({
  showTimestamp: true,
  dateFormat: "locale"
});

logger.log("TIME", "Current time");
// Output: 12/7/2025, 3:45:23 PM [ TIME ] Current time
//         (Your local timezone)
```

### Custom Timezone

Use a custom function for specific timezones:

```typescript
const logger = createHagen({
  showTimestamp: true,
  dateFormat: (date) => {
    return date.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour12: false
    });
  }
});

logger.log("TIME", "New York time");
// Output: 12/7/2025, 10:45:23 [ TIME ] New York time
```

## Performance Considerations

Timestamps add minimal overhead:

- **Date creation**: ~1-2μs per log
- **Formatting**: Depends on format
  - ISO: ~5-10μs (fastest)
  - Locale: ~20-30μs
  - Custom: Depends on implementation

For high-frequency logging (>10,000 logs/sec), consider:
1. Using ISO format (fastest)
2. Disabling timestamps for hot paths
3. Sampling (log 1 in every N calls)

```typescript
// Sampling example
let logCount = 0;
function sampledLog(label: string, message: string) {
  if (logCount++ % 100 === 0) {  // Log 1% of calls
    logger.log(label, message);
  }
}
```

## TypeScript Support

All timestamp options are fully typed:

```typescript
import { createHagen, type LoggerConfig } from "hagen";

const config: Partial<LoggerConfig> = {
  showTimestamp: true,
  dateFormat: "time",  // TypeScript knows valid values
  timeFormat: "12h"    // TypeScript validates this too
};

const logger = createHagen(config);
```

Invalid values are caught at compile time:

```typescript
const config: Partial<LoggerConfig> = {
  dateFormat: "invalid"  // ❌ Type error!
};
```

## Disabling Timestamps

Timestamps are disabled by default:

```typescript
const logger = createHagen({
  showTimestamp: false  // This is the default
});

logger.log("API", "No timestamp");
// Output: [ API ] No timestamp
```

## Next Steps

- [Configuration](/guide/configuration) - Full configuration reference
- [Examples](/examples/basic-usage) - See timestamps in action
- [Log Levels](/guide/log-levels) - Learn about log levels
