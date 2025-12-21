# Contributing to Hagen

Thank you for your interest in contributing to Hagen! This document will help you get started.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/j0hnm4r5/hagen.git
cd hagen

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## Scripts

| Command          | Description                |
| ---------------- | -------------------------- |
| `npm run build`  | Build the library          |
| `npm test`       | Run tests                  |
| `npm run lint`   | Run ESLint                 |
| `npm run format` | Format code with Prettier  |
| `npm run check`  | Type-check with TypeScript |

## Visualize Tool

The `visualize` tool is an internal utility for testing and demonstrating Hagen's features. It's helpful for:

- Verifying color output in different terminals
- Testing layout configurations
- Demonstrating features for documentation
- Debugging visual issues

### Running the Visualize Tool

**Node.js (terminal):**

```bash
npm run visualize:node
```

**Browser (DevTools console):**

```bash
npm run visualize:browser
```

Then open <http://localhost:5173> and check the browser DevTools console.

### Visualize Categories

The tool includes demonstrations for:

| Category              | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| `defaultLoggers`      | Built-in log levels (log, info, warn, error, debug, success, fail) |
| `paletteLabels`       | Color palette cycling                                              |
| `customColors`        | Hex and RGB color examples                                         |
| `complexContent`      | Objects, arrays, errors                                            |
| `multipleLabels`      | Multi-label layouts                                                |
| `stylingTransparency` | Null colors for transparency                                       |
| `fixedWidth`          | Fixed-width label truncation                                       |
| `paletteQuantization` | Color quantization demo                                            |
| `specialLabels`       | Empty, emoji, ZWJ labels                                           |
| `layoutTemplates`     | Different layout configurations                                    |
| `multiLineContent`    | Multi-line message handling                                        |
| `dataTypes`           | Various data type formatting                                       |
| `groups`              | Console.group integration                                          |
| `errors`              | Error handling and display                                         |
| `powerlineSymbols`    | Nerd Font powerline symbols                                        |

### Adding New Visualizations

To add a new visualization:

1. Create a function in `src/test/visualize/visualize.ts`:

   ```typescript
   export function visualizeMyFeature() {
   	console.log("--- MY FEATURE ---\n");
   	// ... your demo code
   	console.log();
   }
   ```

2. Add it to the `VISUALIZATIONS` object:

   ```typescript
   export const VISUALIZATIONS = {
   	// ... existing entries
   	myFeature: visualizeMyFeature,
   };
   ```

3. Test with `npm run visualize:node`

## Code Style

- TypeScript strict mode
- ESLint for linting
- Prettier for formatting
- No `any` casts (use `unknown` if needed)
- Prefer `switch` over `if/else` chains for value dispatch

## Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint && npm test`
5. Submit a PR with a clear description

## Questions?

Open an issue on GitHub if you have questions or need help.
