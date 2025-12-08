# CI Environments

Learn how to use Hagen effectively in CI/CD pipelines and automated environments.

## Automatic CI Detection

Hagen automatically detects CI environments using [std-env](https://github.com/unjs/std-env) and disables colors:

```typescript
import hagen from "hagen";

// In CI: colors automatically disabled
// Locally: colors enabled
hagen.log("BUILD", "Building application");
hagen.success("BUILD", "Build complete");
```

**In your terminal:**
```
[ BUILD ] Building application (in color)
✓ [ BUILD ] Build complete (in green)
```

**In CI logs:**
```
[ BUILD ] Building application
✓ [ BUILD ] Build complete
```

## Supported CI Platforms

Hagen automatically detects these CI environments:

- **GitHub Actions**
- **GitLab CI**
- **Circle CI**
- **Travis CI**
- **Jenkins**
- **Bitbucket Pipelines**
- **AWS CodeBuild**
- **Azure Pipelines**
- **Google Cloud Build**
- **Heroku CI**
- **Netlify**
- **Vercel**
- And many more via std-env

## Manual Override

### Force Colors Off

Explicitly disable colors:

```typescript
import { createHagen } from "hagen";

const logger = createHagen({
  enableColor: false
});

logger.log("BUILD", "No colors, ever");
```

### Force Colors On

Enable colors even in CI (not recommended):

```typescript
const logger = createHagen({
  enableColor: true
});

logger.log("BUILD", "Colors in CI (may cause issues)");
```

### Environment-Based

```typescript
const logger = createHagen({
  // Colors only if explicitly requested
  enableColor: process.env.FORCE_COLOR === "true"
});
```

## CI-Optimized Configuration

Create a CI-specific logger:

```typescript
// lib/logger.ts
import { createHagen } from "hagen";

const isCI = process.env.CI === "true";

export const logger = createHagen({
  // ISO timestamps for parsing
  showTimestamp: true,
  dateFormat: isCI ? "iso" : "time",
  
  // No colors in CI
  enableColor: !isCI,
  
  // Fixed width for alignment
  fixedWidth: isCI ? { width: 12 } : undefined
});
```

## GitHub Actions Example

### Basic Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
```

### With Hagen Logs

```typescript
// test/setup.ts
import { createHagen } from "hagen";

export const logger = createHagen({
  showTimestamp: true,
  dateFormat: "iso",
  enableColor: false  // Clean GitHub Actions logs
});
```

```typescript
// scripts/build.ts
import { logger } from "./test/setup";

async function build() {
  logger.info("BUILD", "Starting build process");
  
  logger.log("COMPILE", "Compiling TypeScript");
  await compile();
  logger.success("COMPILE", "TypeScript compiled");
  
  logger.log("BUNDLE", "Creating bundle");
  await bundle();
  logger.success("BUNDLE", "Bundle created");
  
  logger.success("BUILD", "Build complete!");
}

build().catch(error => {
  logger.error("BUILD", "Build failed", error);
  process.exit(1);
});
```

**GitHub Actions Output:**
```
2025-12-07T10:30:45.123Z i [ BUILD      ] Starting build process
2025-12-07T10:30:45.456Z [ COMPILE    ] Compiling TypeScript
2025-12-07T10:30:47.789Z ✓ [ COMPILE    ] TypeScript compiled
2025-12-07T10:30:47.890Z [ BUNDLE     ] Creating bundle
2025-12-07T10:30:49.123Z ✓ [ BUNDLE     ] Bundle created
2025-12-07T10:30:49.234Z ✓ [ BUILD      ] Build complete!
```

## GitLab CI Example

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  image: node:20
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

test:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm test
```

With clean Hagen output in GitLab CI logs.

## CircleCI Example

```yaml
# .circleci/config.yml
version: 2.1

jobs:
  build-and-test:
    docker:
      - image: node:20
    steps:
      - checkout
      - restore_cache:
          keys:
            - deps-{{ checksum "package-lock.json" }}
      - run: npm ci
      - save_cache:
          key: deps-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
      - run: npm run build
      - run: npm test

workflows:
  main:
    jobs:
      - build-and-test
```

## Test Output in CI

Configure clean test output:

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Clean output in CI
    reporters: process.env.CI ? ["verbose"] : ["default"]
  }
});
```

```typescript
// test/example.test.ts
import { createHagen } from "hagen";

const testLogger = createHagen({
  enableColor: false,
  showTimestamp: false
});

describe("API", () => {
  it("should handle requests", async () => {
    testLogger.log("TEST", "Running API test");
    
    const response = await request(app).get("/api/users");
    
    expect(response.status).toBe(200);
    testLogger.success("TEST", "API test passed");
  });
});
```

## Parsing CI Logs

With consistent formatting, you can parse Hagen logs:

### Structured Logs

```typescript
import { createHagen } from "hagen";

const logger = createHagen({
  showTimestamp: true,
  dateFormat: "iso",
  enableColor: false,
  fixedWidth: { width: 12 }
});

logger.log("BUILD", "Step 1 complete");
logger.log("BUILD", "Step 2 complete");
logger.success("BUILD", "All steps complete");
```

Output:
```
2025-12-07T10:30:45.123Z [ BUILD      ] Step 1 complete
2025-12-07T10:30:46.456Z [ BUILD      ] Step 2 complete
2025-12-07T10:30:47.789Z ✓ [ BUILD      ] All steps complete
```

### Log Parsing Script

```typescript
// Parse Hagen logs from CI
const logLine = "2025-12-07T10:30:45.123Z [ BUILD ] Step 1 complete";

const match = logLine.match(/^(\S+)\s+(\S*)\s*\[\s*(\w+)\s*\]\s+(.+)$/);

if (match) {
  const [_, timestamp, prefix, label, message] = match;
  console.log({
    timestamp,
    prefix,  // Could be 'i', '✓', '!', '✕', or empty
    label,
    message,
    isSuccess: prefix === "✓",
    isError: prefix === "✕",
    isWarning: prefix === "!"
  });
}
```

## Environment Variables

### Detecting CI

```typescript
const isCI = process.env.CI === "true";
const isGitHubActions = !!process.env.GITHUB_ACTIONS;
const isGitLabCI = !!process.env.GITLAB_CI;

const logger = createHagen({
  enableColor: !isCI,
  showTimestamp: isCI,
  dateFormat: isCI ? "iso" : "time"
});
```

### Custom CI Flags

```yaml
# .github/workflows/ci.yml
env:
  LOG_LEVEL: verbose
  ENABLE_TIMESTAMPS: true
```

```typescript
const logger = createHagen({
  showTimestamp: process.env.ENABLE_TIMESTAMPS === "true",
  enableColor: process.env.LOG_COLOR !== "false"
});
```

## Performance Considerations

In CI, every millisecond counts:

```typescript
// Fast CI logger
const ciLogger = createHagen({
  showTimestamp: true,
  dateFormat: "iso",  // Fastest format
  enableColor: false  // No color processing
});
```

## Error Handling in CI

Ensure CI fails on errors:

```typescript
async function ciTask() {
  try {
    logger.log("TASK", "Starting task");
    await performTask();
    logger.success("TASK", "Task completed");
  } catch (error) {
    logger.error("TASK", "Task failed", error);
    process.exit(1);  // Exit with error code
  }
}
```

## Build Script Example

Complete CI build script:

```typescript
// scripts/ci-build.ts
import { createHagen } from "hagen";

const logger = createHagen({
  showTimestamp: true,
  dateFormat: "iso",
  enableColor: false,
  fixedWidth: { width: 12 }
});

async function ciBuild() {
  logger.info("CI", "Starting CI build");
  
  try {
    // Install
    logger.log("INSTALL", "Installing dependencies");
    await exec("npm ci");
    logger.success("INSTALL", "Dependencies installed");
    
    // Lint
    logger.log("LINT", "Running linter");
    await exec("npm run lint");
    logger.success("LINT", "Linting passed");
    
    // Type check
    logger.log("TYPE", "Type checking");
    await exec("npm run type-check");
    logger.success("TYPE", "Type check passed");
    
    // Test
    logger.log("TEST", "Running tests");
    await exec("npm test");
    logger.success("TEST", "Tests passed");
    
    // Build
    logger.log("BUILD", "Building application");
    await exec("npm run build");
    logger.success("BUILD", "Build successful");
    
    logger.success("CI", "CI build complete!");
  } catch (error) {
    logger.error("CI", "CI build failed", error);
    process.exit(1);
  }
}

ciBuild();
```

## Local CI Simulation

Test your CI logs locally:

```bash
# Simulate CI environment
CI=true npm run build

# Or force colorless output
npm run build --no-color
```

```typescript
// Check if running in "CI mode"
const isCIMode = process.env.CI === "true" || process.argv.includes("--no-color");

const logger = createHagen({
  enableColor: !isCIMode
});
```

## Best Practices

### ✅ Do

- Use ISO timestamps in CI
- Disable colors in CI logs
- Use fixed-width labels for alignment
- Include timestamps for debugging
- Exit with proper error codes
- Log important steps clearly

### ❌ Don't

- Force colors in CI (breaks parsing)
- Use overly verbose logging
- Log sensitive information
- Rely on color for meaning
- Forget to handle errors

## Next Steps

- [Basic Usage](/examples/basic-usage) - Learn the fundamentals
- [Configuration](/guide/configuration) - Configure for CI
- [Multiple Loggers](/examples/multiple-loggers) - Organize CI logs
