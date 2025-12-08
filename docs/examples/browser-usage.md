# Browser Usage

Learn how to use Hagen in web browsers and client-side applications.

## Browser Compatibility

Hagen works in all modern browsers with ES2022 support:

- **Chrome** 102+
- **Firefox** 115+
- **Safari** 15.4+
- **Edge** 102+

## ESM Import

Use ESM imports in modern browsers:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Hagen Browser Example</title>
</head>
<body>
  <h1>Check the console!</h1>
  
  <script type="module">
    import hagen from "https://cdn.skypack.dev/hagen";
    
    hagen.log("BROWSER", "Hello from the browser!");
    hagen.info("INIT", "Application initialized");
    hagen.success("READY", "Ready to go!");
  </script>
</body>
</html>
```

## CDN Options

### Skypack (Recommended)

```html
<script type="module">
  import hagen from "https://cdn.skypack.dev/hagen";
  hagen.log("CDN", "Loaded from Skypack");
</script>
```

### unpkg

```html
<script type="module">
  import hagen from "https://unpkg.com/hagen?module";
  hagen.log("CDN", "Loaded from unpkg");
</script>
```

### esm.sh

```html
<script type="module">
  import hagen from "https://esm.sh/hagen";
  hagen.log("CDN", "Loaded from esm.sh");
</script>
```

## Build Tools

### Vite

```typescript
// src/main.ts
import hagen from "hagen";

hagen.log("APP", "Application starting");

// Your app code
```

```typescript
// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  // Hagen works out of the box with Vite
});
```

### Webpack

```typescript
// src/index.ts
import hagen from "hagen";

hagen.log("APP", "Webpack bundle loaded");
```

```typescript
// webpack.config.js
module.exports = {
  // Hagen works out of the box with Webpack 5+
  entry: "./src/index.ts",
  output: {
    filename: "bundle.js"
  }
};
```

### Rollup

```typescript
// src/main.ts
import hagen from "hagen";

hagen.log("APP", "Rollup bundle loaded");
```

```typescript
// rollup.config.js
export default {
  input: "src/main.ts",
  output: {
    file: "dist/bundle.js",
    format: "es"
  }
};
```

## Console Output

Browser console output looks slightly different from Node.js:

```typescript
import hagen from "hagen";

hagen.log("APP", "General log");
// Console: [APP] General log

hagen.info("INFO", "Information");
// Console: ℹ [INFO] Information (blue)

hagen.success("SUCCESS", "Success message");
// Console: ✓ [SUCCESS] Success message (green)

hagen.warn("WARNING", "Warning message");
// Console: ⚠ [WARNING] Warning message (yellow)

hagen.error("ERROR", "Error message");
// Console: ✕ [ERROR] Error message (red)
```

## Browser DevTools

Hagen integrates nicely with browser DevTools:

### Filtering Logs

Use browser console filters to show only Hagen logs:

```
Filter: [
```

This shows only logs with `[` which includes all Hagen logs.

### Source Maps

When using build tools, source maps work correctly:

```typescript
// src/api.ts
import hagen from "hagen";

export async function fetchUser(id: string) {
  hagen.log("API", `Fetching user ${id}`);  // Click to jump to source
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

## React Example

```tsx
// App.tsx
import { useEffect } from "react";
import hagen from "hagen";

function App() {
  useEffect(() => {
    hagen.log("REACT", "App component mounted");
    
    return () => {
      hagen.log("REACT", "App component unmounted");
    };
  }, []);
  
  const handleClick = () => {
    hagen.info("USER", "Button clicked");
  };
  
  return (
    <div>
      <h1>Hagen + React</h1>
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
}

export default App;
```

## Vue Example

```vue
<!-- App.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import hagen from "hagen";

onMounted(() => {
  hagen.log("VUE", "App component mounted");
});

onUnmounted(() => {
  hagen.log("VUE", "App component unmounted");
});

const handleClick = () => {
  hagen.info("USER", "Button clicked");
};
</script>

<template>
  <div>
    <h1>Hagen + Vue</h1>
    <button @click="handleClick">Click Me</button>
  </div>
</template>
```

## Svelte Example

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import hagen from "hagen";
  
  onMount(() => {
    hagen.log("SVELTE", "App component mounted");
  });
  
  onDestroy(() => {
    hagen.log("SVELTE", "App component unmounted");
  });
  
  function handleClick() {
    hagen.info("USER", "Button clicked");
  }
</script>

<div>
  <h1>Hagen + Svelte</h1>
  <button on:click={handleClick}>Click Me</button>
</div>
```

## API Client Logging

Log HTTP requests in the browser:

```typescript
import hagen from "hagen";

class ApiClient {
  async get(url: string) {
    hagen.log("HTTP", `GET ${url}`);
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        hagen.warn("HTTP", `GET ${url} returned ${response.status}`);
      } else {
        hagen.success("HTTP", `GET ${url} succeeded`);
      }
      
      return response.json();
    } catch (error) {
      hagen.error("HTTP", `GET ${url} failed`, error);
      throw error;
    }
  }
  
  async post(url: string, data: unknown) {
    hagen.log("HTTP", `POST ${url}`);
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        hagen.warn("HTTP", `POST ${url} returned ${response.status}`);
      } else {
        hagen.success("HTTP", `POST ${url} succeeded`);
      }
      
      return response.json();
    } catch (error) {
      hagen.error("HTTP", `POST ${url} failed`, error);
      throw error;
    }
  }
}

const api = new ApiClient();
```

## State Management Logging

### Redux

```typescript
import { createStore, applyMiddleware } from "redux";
import hagen from "hagen";

const loggerMiddleware = store => next => action => {
  hagen.log("REDUX", `Dispatching action: ${action.type}`);
  const result = next(action);
  hagen.success("REDUX", `Action ${action.type} completed`);
  return result;
};

const store = createStore(
  rootReducer,
  applyMiddleware(loggerMiddleware)
);
```

### Zustand

```typescript
import { create } from "zustand";
import hagen from "hagen";

const useStore = create((set) => ({
  count: 0,
  increment: () => {
    hagen.log("STORE", "Incrementing count");
    set((state) => ({ count: state.count + 1 }));
    hagen.success("STORE", "Count incremented");
  },
  decrement: () => {
    hagen.log("STORE", "Decrementing count");
    set((state) => ({ count: state.count - 1 }));
    hagen.success("STORE", "Count decremented");
  }
}));
```

## Development vs Production

Disable logging in production builds:

### Vite

```typescript
// src/lib/logger.ts
import { createHagen } from "hagen";

export const logger = createHagen({
  enableColor: import.meta.env.DEV  // Only in development
});
```

### Webpack

```typescript
// src/lib/logger.ts
import { createHagen } from "hagen";

export const logger = createHagen({
  enableColor: process.env.NODE_ENV === "development"
});
```

## Error Boundaries

Log errors caught by error boundaries:

### React Error Boundary

```tsx
import { Component, ReactNode } from "react";
import hagen from "hagen";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  
  static getDerivedStateFromError(error: Error) {
    hagen.error("ERROR", "Error boundary caught error", error);
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    hagen.error("ERROR", "Component error details", { error, errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## Performance Monitoring

Track performance in the browser:

```typescript
import hagen from "hagen";

function measureRender(componentName: string) {
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    
    if (duration > 16) {  // Longer than 1 frame
      hagen.warn("PERF", `${componentName} render took ${duration.toFixed(2)}ms`);
    } else {
      hagen.log("PERF", `${componentName} render took ${duration.toFixed(2)}ms`);
    }
  };
}

// Usage in React
function MyComponent() {
  const endMeasure = measureRender("MyComponent");
  
  useEffect(() => {
    endMeasure();
  });
  
  return <div>My Component</div>;
}
```

## Service Worker Logging

Note: Hagen relies on `chalk` which uses terminal features not available in Service Workers. For Service Worker logging, use the colorless mode:

```typescript
// service-worker.ts
import { createHagen } from "hagen";

const logger = createHagen({
  enableColor: false  // Service Workers don't support colors
});

self.addEventListener("install", (event) => {
  logger.log("SW", "Service Worker installing");
});

self.addEventListener("activate", (event) => {
  logger.success("SW", "Service Worker activated");
});

self.addEventListener("fetch", (event) => {
  logger.log("SW", `Fetching: ${event.request.url}`);
});
```

## Bundle Size

Hagen is lightweight in the browser:

- **Minified**: ~4.4KB
- **Gzipped**: ~2KB

Check your bundle size with your build tool:

```bash
# Vite
npm run build
# Check dist/assets/*.js sizes

# Webpack Bundle Analyzer
npm install -D webpack-bundle-analyzer
```

## Browser-Specific Tips

### Console Styling

Browser consoles support CSS styling, but Hagen uses text-based colors for consistency across environments.

### Stack Traces

Browser console automatically provides clickable stack traces for errors:

```typescript
hagen.error("APP", "Something went wrong", new Error("Details"));
// Click the error in console to jump to source
```

### Console Groups

Combine with console.group for organization:

```typescript
console.group("API Request");
hagen.log("API", "Starting request");
hagen.log("API", "Request data:", data);
hagen.success("API", "Request complete");
console.groupEnd();
```

## Next Steps

- [Basic Usage](/examples/basic-usage) - Learn the fundamentals
- [Configuration](/guide/configuration) - Configure for browsers
- [TypeScript](/examples/typescript) - Type-safe browser logging
