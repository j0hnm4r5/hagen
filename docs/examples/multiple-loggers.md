# Multiple Loggers

Learn how to use multiple logger instances for better organization in larger applications.

## Why Multiple Loggers?

As your application grows, using a single logger can become messy. Multiple loggers help you:

- **Organize by domain**: Separate loggers for API, database, cache, etc.
- **Configure independently**: Different settings for different subsystems
- **Filter logs**: Enable/disable specific loggers in different environments
- **Scale teams**: Different teams can own their logger configurations

## Shared Logger Pattern

Create a shared logger module that exports a single configured instance:

### Simple Shared Logger

```typescript
// lib/logger.ts
import { createHagen } from "hagen";

export const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time",
  timeFormat: "12h"
});
```

```typescript
// services/api.ts
import { logger } from "../lib/logger";

export async function fetchUser(id: string) {
  logger.info("API", `Fetching user ${id}`);
  const user = await db.getUser(id);
  logger.success("API", `User ${id} fetched`);
  return user;
}
```

```typescript
// services/database.ts
import { logger } from "../lib/logger";

export async function query(sql: string) {
  logger.log("DB", `Executing query: ${sql}`);
  const result = await db.query(sql);
  logger.success("DB", `Query returned ${result.rows.length} rows`);
  return result;
}
```

## Multiple Specialized Loggers

Create different loggers for different subsystems:

### Basic Multi-Logger Setup

```typescript {output=true}
import { createHagen } from "hagen";

// lib/loggers.ts
import { createHagen } from "hagen";

// API logger with timestamps
export const apiLogger = createHagen({
  showTimestamp: true,
  dateFormat: "time",
  labelPrefix: "[API]"
});

// Database logger with fixed-width labels
export const dbLogger = createHagen({
  showTimestamp: true,
  fixedWidth: { width: 10 }
});

// Cache logger without timestamps
export const cacheLogger = createHagen({
  showTimestamp: false,
  labelPrefix: "[CACHE]"
});
```

### Using Specialized Loggers

```typescript
// services/api.ts
import { apiLogger } from "../lib/loggers";

export async function handleRequest(req: Request) {
  apiLogger.log("REQUEST", `${req.method} ${req.url}`);
  
  try {
    const result = await processRequest(req);
    apiLogger.success("RESPONSE", "Request completed");
    return result;
  } catch (error) {
    apiLogger.error("ERROR", "Request failed", error);
    throw error;
  }
}
```

```typescript
// services/database.ts
import { dbLogger } from "../lib/loggers";

export async function connect() {
  dbLogger.log("CONNECT", "Attempting database connection");
  
  try {
    await db.connect();
    dbLogger.success("CONNECT", "Database connected");
  } catch (error) {
    dbLogger.error("CONNECT", "Connection failed", error);
    throw error;
  }
}
```

```typescript
// services/cache.ts
import { cacheLogger } from "../lib/loggers";

export async function get(key: string) {
  const value = await cache.get(key);
  
  if (value) {
    cacheLogger.success("HIT", `Cache hit for key: ${key}`);
  } else {
    cacheLogger.warn("MISS", `Cache miss for key: ${key}`);
  }
  
  return value;
}
```

## Environment-Based Configuration

Configure loggers differently based on environment:

```typescript
// lib/loggers.ts
import { createHagen } from "hagen";

const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

// Production logger: timestamps, ISO format
export const prodLogger = createHagen({
  showTimestamp: isProd,
  dateFormat: "iso",
  enableColor: !isProd
});

// Development logger: readable timestamps, colors
export const devLogger = createHagen({
  showTimestamp: isDev,
  dateFormat: "time",
  timeFormat: "12h",
  enableColor: isDev
});

// Test logger: no colors, no timestamps
export const testLogger = createHagen({
  showTimestamp: false,
  enableColor: false
});

// Export the appropriate logger
export const logger = isTest ? testLogger : isDev ? devLogger : prodLogger;
```

## Large Application Example

Here's a comprehensive example for a large application:

```typescript
// lib/loggers.ts
import { createHagen } from "hagen";

const baseConfig = {
  showTimestamp: true,
  dateFormat: "time" as const,
  timeFormat: "12h" as const
};

// HTTP/API layer
export const apiLogger = createHagen({
  ...baseConfig,
  labelPrefix: "[API]"
});

// Authentication & authorization
export const authLogger = createHagen({
  ...baseConfig,
  labelPrefix: "[AUTH]"
});

// Database operations
export const dbLogger = createHagen({
  ...baseConfig,
  labelPrefix: "[DB]",
  fixedWidth: { width: 12 }
});

// Cache operations
export const cacheLogger = createHagen({
  ...baseConfig,
  labelPrefix: "[CACHE]"
});

// Background jobs
export const workerLogger = createHagen({
  ...baseConfig,
  labelPrefix: "[WORKER]"
});

// Email service
export const emailLogger = createHagen({
  ...baseConfig,
  labelPrefix: "[EMAIL]"
});

// Payment processing
export const paymentLogger = createHagen({
  ...baseConfig,
  labelPrefix: "[PAYMENT]"
});
```

### Using in Modules

```typescript
// services/auth.ts
import { authLogger } from "../lib/loggers";

export async function login(credentials: Credentials) {
  authLogger.log("LOGIN", `Login attempt for ${credentials.email}`);
  
  try {
    const user = await validateCredentials(credentials);
    authLogger.success("LOGIN", `User ${user.id} logged in`);
    return createSession(user);
  } catch (error) {
    authLogger.error("LOGIN", "Login failed", error);
    throw error;
  }
}

export async function logout(sessionId: string) {
  authLogger.log("LOGOUT", `Destroying session ${sessionId}`);
  await destroySession(sessionId);
  authLogger.success("LOGOUT", "Session destroyed");
}
```

```typescript
// services/payments.ts
import { paymentLogger } from "../lib/loggers";

export async function processPayment(payment: Payment) {
  paymentLogger.log("PROCESS", `Processing payment ${payment.id}`);
  
  try {
    const result = await stripe.charge(payment);
    paymentLogger.success("PROCESS", `Payment ${payment.id} succeeded`);
    return result;
  } catch (error) {
    paymentLogger.error("PROCESS", `Payment ${payment.id} failed`, error);
    throw error;
  }
}
```

```typescript
// workers/email-worker.ts
import { emailLogger, workerLogger } from "../lib/loggers";

export async function sendEmail(email: Email) {
  workerLogger.log("JOB", `Starting email job ${email.id}`);
  emailLogger.log("SEND", `Sending email to ${email.to}`);
  
  try {
    await mailService.send(email);
    emailLogger.success("SEND", `Email sent to ${email.to}`);
    workerLogger.success("JOB", `Email job ${email.id} completed`);
  } catch (error) {
    emailLogger.error("SEND", `Failed to send email to ${email.to}`, error);
    workerLogger.error("JOB", `Email job ${email.id} failed`, error);
    throw error;
  }
}
```

## Conditional Loggers

Create loggers that are only active in certain conditions:

```typescript
// lib/loggers.ts
import { createHagen } from "hagen";

// Debug logger (only active when DEBUG=true)
export const debugLogger = createHagen({
  enableColor: !!process.env.DEBUG,
  showTimestamp: true
});

// Verbose logger (only active when VERBOSE=true)
export const verboseLogger = createHagen({
  showTimestamp: true,
  enableColor: !!process.env.VERBOSE
});

// Helper to conditionally log
export function debug(label: string, ...args: unknown[]) {
  if (process.env.DEBUG) {
    debugLogger.log(label, ...args);
  }
}

export function verbose(label: string, ...args: unknown[]) {
  if (process.env.VERBOSE) {
    verboseLogger.log(label, ...args);
  }
}
```

Usage:

```typescript
import { debug, verbose } from "../lib/loggers";

function complexOperation() {
  verbose("COMPLEX", "Starting complex operation");
  
  for (const item of items) {
    debug("ITEM", `Processing item ${item.id}`);
    processItem(item);
  }
  
  verbose("COMPLEX", "Complex operation complete");
}
```

## Microservices Pattern

Different services in a monorepo:

```typescript
// services/api-gateway/logger.ts
import { createHagen } from "hagen";

export const logger = createHagen({
  showTimestamp: true,
  labelPrefix: "[GATEWAY]"
});
```

```typescript
// services/user-service/logger.ts
import { createHagen } from "hagen";

export const logger = createHagen({
  showTimestamp: true,
  labelPrefix: "[USER-SVC]"
});
```

```typescript
// services/order-service/logger.ts
import { createHagen } from "hagen";

export const logger = createHagen({
  showTimestamp: true,
  labelPrefix: "[ORDER-SVC]"
});
```

When viewing logs from all services, the prefixes make it clear which service logged what:

```
3:45:23 PM [GATEWAY] REQUEST Incoming request to /api/orders
3:45:23 PM [ORDER-SVC] FETCH Fetching order 123
3:45:23 PM [USER-SVC] VALIDATE Validating user permissions
3:45:24 PM [USER-SVC] ✓ SUCCESS User authorized
3:45:24 PM [ORDER-SVC] ✓ SUCCESS Order 123 retrieved
3:45:24 PM [GATEWAY] ✓ RESPONSE Request completed
```

## Testing with Multiple Loggers

Create test-specific loggers:

```typescript
// test/helpers/logger.ts
import { createHagen } from "hagen";

export const testLogger = createHagen({
  showTimestamp: false,
  enableColor: false  // Clean output in test reports
});
```

```typescript
// test/api.test.ts
import { testLogger } from "./helpers/logger";

describe("API", () => {
  it("should handle requests", async () => {
    testLogger.log("TEST", "Starting API test");
    
    const response = await request(app).get("/api/users/1");
    
    expect(response.status).toBe(200);
    testLogger.success("TEST", "API test passed");
  });
});
```

## Performance Monitoring

Specialized logger for performance tracking:

```typescript
// lib/perf-logger.ts
import { createHagen } from "hagen";

const perfLogger = createHagen({
  showTimestamp: true,
  dateFormat: "iso",
  labelPrefix: "[PERF]"
});

export function measurePerformance<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  perfLogger.log("START", label);
  
  return fn()
    .then(result => {
      const duration = Date.now() - start;
      if (duration > 1000) {
        perfLogger.warn("SLOW", `${label} took ${duration}ms`);
      } else {
        perfLogger.success("COMPLETE", `${label} took ${duration}ms`);
      }
      return result;
    })
    .catch(error => {
      const duration = Date.now() - start;
      perfLogger.error("FAILED", `${label} failed after ${duration}ms`, error);
      throw error;
    });
}
```

Usage:

```typescript
import { measurePerformance } from "../lib/perf-logger";

const users = await measurePerformance("fetchUsers", () => db.getUsers());
// Output: [PERF] ✓ COMPLETE fetchUsers took 245ms
```

## Next Steps

- [Custom Styling](/examples/custom-styling) - Customize logger appearance
- [Configuration Guide](/guide/configuration) - Learn all configuration options
- [TypeScript](/examples/typescript) - Type-safe logger patterns
