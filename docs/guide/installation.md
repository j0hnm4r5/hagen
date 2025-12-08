# Installation

Get Hagen installed and running in your project.

## Requirements

Before installing Hagen, ensure your environment meets these requirements:

### Node.js

Hagen requires **Node.js 20 or higher**. Check your version:

```bash
node --version
# Should output v20.x.x or higher
```

If you need to upgrade Node.js:
- Use [nvm](https://github.com/nvm-sh/nvm) (recommended): `nvm install --lts`
- Download from [nodejs.org](https://nodejs.org/)
- Use your system package manager

### Browsers

For browser usage, Hagen requires ES2022 support:

- Chrome 102+
- Firefox 115+
- Safari 15.4+
- Edge 102+

## npm Installation

Install Hagen using npm:

```bash
npm install hagen
```

Or using other package managers:

::: code-group

```bash [npm]
npm install hagen
```

```bash [yarn]
yarn add hagen
```

```bash [pnpm]
pnpm add hagen
```

```bash [bun]
bun add hagen
```

:::

## Verify Installation

After installation, verify Hagen is working:

```typescript
// test-hagen.js
import hagen from "hagen";

hagen.log("TEST", "Hagen is installed!");
hagen.success("TEST", "Everything is working!");
```

Run it:

```bash
node test-hagen.js
```

You should see colored output with labels. If you do, you're ready to go!

## TypeScript Setup

Hagen includes TypeScript definitions out of the box. No additional `@types` packages needed!

Just import and use:

```typescript
import hagen, { createHagen, type LoggerConfig } from "hagen";

const config: Partial<LoggerConfig> = {
  showTimestamp: true,
  dateFormat: "iso"
};

const logger = createHagen(config);
logger.log("TS", "TypeScript support works!");
```

### Type Checking

Hagen is built with `strict: true` in TypeScript, so all types are fully checked and safe.

## Module Systems

Hagen supports both ESM and CommonJS:

### ESM (Recommended)

```typescript
// ESM (package.json with "type": "module" or .mjs files)
import hagen from "hagen";
import { createHagen, log, info, success } from "hagen";
```

### CommonJS

```typescript
// CommonJS (.cjs files or default Node.js)
const hagen = require("hagen").default;
const { createHagen, log, info } = require("hagen");
```

## Browser Installation

### Via Module Import

```html
<script type="module">
  import hagen from "https://cdn.skypack.dev/hagen";
  hagen.log("BROWSER", "Running in the browser!");
</script>
```

### Via Build Tools

If you're using a bundler (Vite, Webpack, Rollup, etc.), just import normally:

```typescript
import hagen from "hagen";

hagen.log("APP", "Bundled and ready!");
```

## Development vs Production

### Development Setup

For development, you might want a shared logger configuration:

```typescript
// lib/logger.ts
import { createHagen } from "hagen";

export const logger = createHagen({
  showTimestamp: true,
  dateFormat: "time",
  timeFormat: "12h"
});
```

Then import throughout your app:

```typescript
import { logger } from "./lib/logger";

logger.log("DEV", "Development mode active");
```

### Production Considerations

In production:
1. **CI Detection**: Hagen automatically disables colors in CI environments
2. **Performance**: Minimal overhead (~4.4KB minified)
3. **Tree Shaking**: Unused exports are removed by modern bundlers

## Troubleshooting

### Colors Not Showing

If colors aren't displaying:

1. **Check terminal support**: Most modern terminals support colors
2. **Check CI environment**: Colors are disabled in CI by default
3. **Force colors**: Set `enableColor: true` in config

```typescript
const logger = createHagen({ enableColor: true });
```

### Import Errors

If you see import errors:

1. **ESM vs CommonJS**: Ensure you're using the right syntax for your module system
2. **Node version**: Verify you're on Node 20+
3. **TypeScript**: Check your `tsconfig.json` has `"module": "esnext"` or similar

### TypeScript Errors

If you see TypeScript errors:

1. **Update TypeScript**: Hagen requires TypeScript 5.0+
2. **Check moduleResolution**: Use `"moduleResolution": "bundler"` or `"node16"`
3. **Check lib**: Include ES2022 in your `lib` array

## What's Next?

Now that Hagen is installed, let's write some logs!

👉 [Quick Start Guide](/guide/quick-start)
