# TypeScript

Leverage Hagen's full TypeScript support for type-safe logging.

## Type Imports

Import types for complete type safety:

```typescript
import hagen, {
  createHagen,
  type HagenInstance,
  type LoggerConfig,
  type Label
} from "hagen";
```

## Typed Configuration

Create type-safe logger configurations:

```typescript
import { createHagen, type LoggerConfig } from "hagen";

// Full type safety for configuration
const config: Partial<LoggerConfig> = {
  showTimestamp: true,
  dateFormat: "iso",  // TypeScript validates: "iso" | "locale" | "time" | function
  timeFormat: "24h",  // TypeScript validates: "12h" | "24h"
  enableColor: true,
  labelPrefix: "[APP]",
  labelSuffix: "",
  fixedWidth: {
    width: 12,
    truncationMethod: "middle"  // TypeScript validates: "start" | "end" | "middle"
  }
};

const logger = createHagen(config);
```

### Invalid Configuration Caught at Compile Time

```typescript
const config: Partial<LoggerConfig> = {
  dateFormat: "invalid",  // ❌ Type error!
  //          ~~~~~~~~~ Type '"invalid"' is not assignable to type...
  
  timeFormat: "13h",      // ❌ Type error!
  //          ~~~~~ Type '"13h"' is not assignable to type...
};
```

## Typed Labels

Use the `Label` type for type-safe labels:

```typescript
import { type Label } from "hagen";

// String labels
const simpleLabel: Label = "API";

// Object labels with color index
const colorLabel: Label = {
  label: "API",
  color: 2  // TypeScript knows this must be 0-5
};

// Object labels with hex colors
const hexLabel: Label = {
  label: "CUSTOM",
  bgColor: "#FF6B6B",
  fgColor: "#FFFFFF"
};

// Object labels with prefix/suffix
const decoratedLabel: Label = {
  label: "WORKER",
  prefix: ">>",
  suffix: "<<"
};

// Combined
const fullLabel: Label = {
  label: "API",
  color: 2,
  prefix: "→",
  suffix: ""
};
```

### Label Type Validation

```typescript
const invalidLabel: Label = {
  label: "API",
  color: 10  // ❌ Type error! Must be 0-5
};

const missingLabel: Label = {
  // ❌ Type error! Missing 'label' property
  color: 2
};
```

## HagenInstance Type

Type your logger instances:

```typescript
import { createHagen, type HagenInstance } from "hagen";

// Explicitly typed logger
const logger: HagenInstance = createHagen({
  showTimestamp: true
});

// Function accepting a logger
function logOperation(logger: HagenInstance, operation: string) {
  logger.log("OPS", `Starting ${operation}`);
  // Perform operation
  logger.success("OPS", `Completed ${operation}`);
}

logOperation(logger, "database migration");
```

## Generic Logger Factory

Create a typed logger factory:

```typescript
import { createHagen, type LoggerConfig, type HagenInstance } from "hagen";

function createTypedLogger(
  name: string,
  config?: Partial<LoggerConfig>
): HagenInstance {
  return createHagen({
    labelPrefix: `[${name}]`,
    ...config
  });
}

const apiLogger = createTypedLogger("API", {
  showTimestamp: true,
  dateFormat: "time"
});

const dbLogger = createTypedLogger("DB", {
  fixedWidth: { width: 10 }
});
```

## Typed Label Library

Create a type-safe label library:

```typescript
import { type Label } from "hagen";

// Define label constants with full type safety
export const LABELS = {
  API: { label: "API", color: 2 } as const,
  DB: { label: "DB", color: 4 } as const,
  CACHE: { label: "CACHE", color: 3 } as const,
  AUTH: { label: "AUTH", color: 1 } as const,
} satisfies Record<string, Label>;

// Use with type safety
import hagen from "hagen";
import { LABELS } from "./labels";

hagen.log(LABELS.API, "Request received");
hagen.log(LABELS.DB, "Query executed");
```

## Enum Labels

Use TypeScript enums for labels:

```typescript
enum LogCategory {
  API = "API",
  Database = "DB",
  Cache = "CACHE",
  Authentication = "AUTH"
}

function log(category: LogCategory, message: string) {
  hagen.log(category, message);
}

log(LogCategory.API, "Request received");
log(LogCategory.Database, "Query executed");
// log("INVALID", "Message");  // ❌ Type error!
```

## Type Guards

Create type guards for labels:

```typescript
import { type Label } from "hagen";

function isStringLabel(label: Label): label is string {
  return typeof label === "string";
}

function isObjectLabel(label: Label): label is Exclude<Label, string> {
  return typeof label === "object" && label !== null;
}

function logWithGuard(label: Label, message: string) {
  if (isStringLabel(label)) {
    console.log(`String label: ${label}`);
  } else if (isObjectLabel(label)) {
    console.log(`Object label: ${label.label}`);
  }
  
  hagen.log(label, message);
}
```

## Strict Null Checks

Hagen is fully compatible with strict null checks:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true
  }
}
```

```typescript
import { createHagen, type LoggerConfig } from "hagen";

// All properties are optional, so Partial is not needed for undefined
const config: Partial<LoggerConfig> = {
  showTimestamp: true,
  dateFormat: undefined  // Valid
};

const logger = createHagen(config);
```

## Interface Extension

Extend Hagen types for custom wrappers:

```typescript
import { type HagenInstance, type Label } from "hagen";

interface CustomLogger extends HagenInstance {
  debug(label: Label, message?: unknown, ...data: unknown[]): void;
  trace(label: Label, message?: unknown, ...data: unknown[]): void;
}

function createCustomLogger(baseLogger: HagenInstance): CustomLogger {
  return {
    ...baseLogger,
    debug(label: Label, message?: unknown, ...data: unknown[]) {
      if (process.env.DEBUG) {
        baseLogger.log(label, message, ...data);
      }
    },
    trace(label: Label, message?: unknown, ...data: unknown[]) {
      if (process.env.TRACE) {
        baseLogger.log(label, message, ...data);
      }
    }
  };
}
```

## Decorator Pattern

Create a typed decorator:

```typescript
import { type HagenInstance, type Label } from "hagen";

class LoggerDecorator {
  constructor(private logger: HagenInstance) {}
  
  withContext(context: Record<string, unknown>) {
    return {
      log: (label: Label, message?: unknown, ...data: unknown[]) => {
        this.logger.log(label, message, { context }, ...data);
      },
      info: (label: Label, message?: unknown, ...data: unknown[]) => {
        this.logger.info(label, message, { context }, ...data);
      },
      success: (label: Label, message?: unknown, ...data: unknown[]) => {
        this.logger.success(label, message, { context }, ...data);
      },
      warn: (label: Label, message?: unknown, ...data: unknown[]) => {
        this.logger.warn(label, message, { context }, ...data);
      },
      error: (label: Label, message?: unknown, ...data: unknown[]) => {
        this.logger.error(label, message, { context }, ...data);
      }
    };
  }
}

// Usage
import hagen from "hagen";

const decorator = new LoggerDecorator(hagen);
const contextLogger = decorator.withContext({ userId: 123, requestId: "abc" });

contextLogger.log("API", "Request received");
// Logs: [ API ] Request received { context: { userId: 123, requestId: 'abc' } }
```

## Generic Utilities

Create type-safe utility functions:

```typescript
import { type HagenInstance, type Label } from "hagen";

function measurePerformance<T>(
  logger: HagenInstance,
  label: Label,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  logger.log(label, "Starting operation");
  
  return fn()
    .then(result => {
      const duration = Date.now() - start;
      logger.success(label, `Completed in ${duration}ms`);
      return result;
    })
    .catch(error => {
      const duration = Date.now() - start;
      logger.error(label, `Failed after ${duration}ms`, error);
      throw error;
    });
}

// Fully typed usage
const users: User[] = await measurePerformance(
  logger,
  "FETCH_USERS",
  () => fetchUsers()
);
```

## Class-Based Loggers

Create type-safe logger classes:

```typescript
import { createHagen, type HagenInstance, type Label } from "hagen";

class ServiceLogger {
  private logger: HagenInstance;
  private serviceName: string;
  
  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.logger = createHagen({
      labelPrefix: `[${serviceName}]`,
      showTimestamp: true
    });
  }
  
  log(operation: string, message: string): void {
    this.logger.log(operation, message);
  }
  
  success(operation: string, message: string): void {
    this.logger.success(operation, message);
  }
  
  error(operation: string, message: string, error?: Error): void {
    this.logger.error(operation, message, error);
  }
}

// Usage
const apiLogger = new ServiceLogger("API");
apiLogger.log("REQUEST", "Handling request");
apiLogger.success("RESPONSE", "Request completed");
```

## Type-Safe Configuration Builder

Build configurations with a fluent API:

```typescript
import { createHagen, type LoggerConfig } from "hagen";

class LoggerConfigBuilder {
  private config: Partial<LoggerConfig> = {};
  
  withTimestamp(format: "iso" | "locale" | "time" = "iso"): this {
    this.config.showTimestamp = true;
    this.config.dateFormat = format;
    return this;
  }
  
  withTimeFormat(format: "12h" | "24h"): this {
    this.config.timeFormat = format;
    return this;
  }
  
  withColors(enabled: boolean): this {
    this.config.enableColor = enabled;
    return this;
  }
  
  withPrefix(prefix: string): this {
    this.config.labelPrefix = prefix;
    return this;
  }
  
  withFixedWidth(width: number, truncation?: "start" | "end" | "middle"): this {
    this.config.fixedWidth = {
      width,
      truncationMethod: truncation
    };
    return this;
  }
  
  build() {
    return createHagen(this.config);
  }
}

// Usage
const logger = new LoggerConfigBuilder()
  .withTimestamp("time")
  .withTimeFormat("12h")
  .withColors(true)
  .withPrefix("[APP]")
  .withFixedWidth(12, "middle")
  .build();
```

## Strict Mode Compatibility

Hagen is built with strict mode enabled:

```typescript
// Hagen's tsconfig.json has:
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

This means all types are fully validated and safe to use in strict TypeScript projects.

## JSDoc Support

Even in JavaScript files, you get full IDE support thanks to JSDoc:

```typescript
// @ts-check
const { createHagen } = require("hagen");

// TypeScript will infer types and provide autocomplete
const logger = createHagen({
  showTimestamp: true,
  dateFormat: "iso"  // Autocomplete works!
});

logger.log("API", "Message");  // Method signatures are known
```

## Next Steps

- [Configuration Guide](/guide/configuration) - All typed configuration options
- [Custom Colors](/guide/custom-colors) - Type-safe color customization
- [Basic Usage](/examples/basic-usage) - Get started with TypeScript
