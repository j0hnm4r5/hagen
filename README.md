# Hagen

![](https://github.com/j0hnm4r5/hagen/raw/main/assets/screenshot.png)

A colorful logger for JS/TS in Node and modern browsers.

Hagen enhances your logging by extending `console.log`, `console.warn`, and `console.error` with colored labels that stay consistent between calls. It supports custom colors, fixed-width labels (with truncation/centering), timestamps, and automatic removal of colors in CI environments.

## Features

- **Consistent Coloring:**  
  The label’s color is chosen from a list based on a hash of the label, so the same label always has the same color. You can also override this by passing a config object.

- **Custom Colors:**  
  Supply custom Chalk colors or manually define foreground/background colors.

- **Fixed-Width Labels:**  
  Optionally specify a fixed width so that short labels are centered and long labels are truncated (with ellipses added).

- **Timestamping:**  
  Optionally include a timestamp in your logs.

- **CI Support:**  
  When running in CI environments (detected via [std-env](https://github.com/sindresorhus/std-env)), Hagen automatically disables colors and wraps labels in a border.

- **ESM & CommonJS:**  
  Bundled with [tsup](https://github.com/egoist/tsup) to support both module systems along with TypeScript declarations and sourcemaps.

## Installation

Install via npm or yarn:

```bash
npm install hagen
# or
yarn add hagen
```

## Importing

Hagen is exported as both ESM and CommonJS. Examples:

### ESM

```js
import hagen, { setConfig } from "hagen";

// or named imports if you prefer:
import { log, info } from "hagen";
```

### CommonJS

```js
const hagen = require("hagen");

// or destructuring:
const { log, info } = require("hagen");
```

## Usage Examples

### Basic Logging

```js
hagen.log("MY_LABEL", "Hello, World!"); // standard log
hagen.info("MY_LABEL", "This is some unimportant info.");
hagen.success("MY_LABEL", "You did it!");
hagen.warn("MY_LABEL", "Something happened!");
hagen.error("MY_LABEL", "This is bad.");
```

### Logging with Only a Label or Only a Message

```js
hagen.info("", "This is a blank label."); // no label, just message
hagen.log("MY_LABEL"); // label only, no message
```

### Logging Complex Objects

```js
hagen.log("DATA", { hello: "world", how: "are you?" });
```

### Using Custom Colors

You can pass an object as the label to manually set colors. For example:

```js
// Using a custom chalk color index (from the default normal colors array)
hagen.log({ label: "CUSTOM", color: 3 }, "Hello, custom color!");

// Using a custom Chalk color directly:
import chalk from "chalk";
hagen.log(
	{ label: "CUSTOM", color: chalk.bgHex("#ff00ff").hex("#000000") },
	"Hello, custom color!"
);

// Using custom background and foreground colors:
hagen.log({ label: "CUSTOM", bgColor: "#ff00ff", fgColor: "#000000" }, "Hello, custom color!");
```

### Configuring Hagen

You can change settings (such as fixed label width and timestamp display) with the `setConfig` function.

```js
import { setConfig } from "hagen";

// Enable timestamps and set a fixed width of 15 characters with middle truncation.
setConfig({
	showTimestamp: true,
	fixedWidth: {
		width: 15,
		truncationMethod: "middle",
	},
});
```

### CI Environments and Color Removal

Hagen uses [std-env](https://github.com/sindresorhus/std-env) to detect if it's running in a CI environment. In such cases, colors are disabled and labels are rendered in plain text wrapped in square brackets (e.g. `[ MY_LABEL ]`). This ensures that logs remain readable in environments where ANSI escape codes might not be supported.

### Grouping Logs

Hagen works seamlessly with `console.group`:

```js
console.group("Group Level 1");
hagen.log("LEVEL 1", "This is level 1");
console.group("Group Level 2");
hagen.log("LEVEL 2", "This is level 2");
console.groupEnd();
console.groupEnd();
```

## Major Technologies

- [Chalk](https://github.com/chalk/chalk)

## Inspirations

- [xa](https://github.com/xxczaki/xa)
- [consola](https://github.com/unjs/consola/)

## Authors

- [John Mars](http://m4r5.io)

## License

MIT © John Mars
