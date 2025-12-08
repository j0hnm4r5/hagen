---
layout: home

hero:
  name: Hagen
  text: Colorful logging for JavaScript
  tagline: A lightweight, instance-based logger for Node.js and modern browsers
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View on GitHub
      link: https://github.com/j0hnm4r5/hagen
    - theme: alt
      text: API Reference
      link: /api/

features:
  - icon: 🎨
    title: Consistent Coloring
    details: Same label = same color. Automatic hash-based selection keeps your logs readable.
  
  - icon: 🎯
    title: Instance-Based
    details: Create multiple independent loggers with different configurations. No global state.
  
  - icon: ⚡
    title: Lightweight
    details: Just ~4.4KB minified. Zero dependencies beyond chalk and std-env.
  
  - icon: 📘
    title: TypeScript First
    details: Full type safety with comprehensive JSDoc documentation.
  
  - icon: 🌈
    title: Highly Configurable
    details: Custom colors, timestamps, label formats, and more.
  
  - icon: 🤖
    title: CI Ready
    details: Auto-detects CI environments and disables colors appropriately.
---

## Quick Example

```typescript
import hagen from "hagen";

hagen.log("API", "Request received");
hagen.info("AUTH", "User logged in");
hagen.success("DB", "Connection established");
hagen.warn("CACHE", "High memory usage");
hagen.error("API", "Request failed", error);
```

<Terminal exampleId="log-levels-all" title="All Log Levels" />

## Installation

```bash
npm install hagen
```

Requires Node.js 20+ or modern browsers with ES2022 support.

## Why Hagen?

**Hagen v4.0** brings a modern, instance-based architecture that eliminates global state and gives you complete control over your logging. Whether you're building a small CLI tool or a large-scale application, Hagen scales with you.

### Perfect For

- **Debugging** - Visually distinguish log sources at a glance
- **Microservices** - Track requests across distributed systems
- **CLI Tools** - Beautiful console output that users will appreciate
- **Development** - Quick setup with sensible defaults
- **Production** - Automatic CI detection and professional output

### Migration from v3

Upgrading from v3.x? Check out our [Migration Guide](/guide/migration) for a smooth transition to the new instance-based API.
