# Hagen

![](https://github.com/j0hnm4r5/hagen/raw/main/assets/screenshot.png)

A colorful logger for JS/TS in Node and modern Browsers.

## Getting Started

### Installation

`npm i hagen` or `yarn add hagen`

### Usage

Hagen extends `console.log`, `console.warn`, and `console.error`. It takes two parameters: a string `label` and a `message`.

The label's color is chosen randomly from a list of terminal colors by analyzing the string. The color will remain the same every time you use the same label. You can additionally pass in an integer as a third parameter to manually select the color.

The library is written in TypeScript, so types are available for autocomplete/Intellisense in both JS and TS.

#### Importing

`hagen` is exported as both a CommonJS and ESM module. You can import it in your project like this:

##### Node (TypeScript via `ts-node` or `tsc`)

```js
import hagen from "hagen";
```

##### Node (JavaScript)

```js
const hagen = require("hagen").default;
```

##### Browser (Webpack/Parcel or frameworks like Next.js)

```js
import hagen from "hagen";
```

##### Browser (Dev bundlers like Vite)

```js
import hagen from "hagen";
```

Vite also needs to be configured with the following in `vite.config.js` to handle CommonJS modules:

```js
import { defineConfig } from "vite";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs"; // <-- install this with `npm i @originjs/vite-plugin-commonjs`

export default defineConfig({
	plugins: [viteCommonjs()],
	define: {
		"process.env": process.env,
	},
});
```

#### Commands

```js
hagen.log("LABEL", "Hello, World!"); // normal log
hagen.info("LABEL", "This is some unimportant info."); // info log
hagen.success("LABEL", "You did it!"); // success log
hagen.warn("LABEL", "Something happened!"); // warning log
hagen.error("LABEL", "This is bad."); // error log

hagen.info("", "This is a blank label."); // just the message, no label
hagen.log("LABEL"); // just the label, no message

hagen.log("LABEL", { hello: "world", how: "are you?" }); // object log
hagen.log("LABEL", "Hello, World!", 3); // custom color

// grouping
console.group();
hagen.log(`LEVEL 1`);
console.group();
hagen.log(`LEVEL 2`);
console.groupEnd();
console.groupEnd();
```

#### VSCode

In recent versions of VSCode the default minimum color-contrast ratio is set to 4.5; sometimes VSCode will automatically change the color of the label text to meet this requirement.

To disable this, set `"terminal.integrated.minimumContrastRatio": 1,` in `settings.json`.

## Major Technologies

- [Chalk](https://github.com/chalk/chalk)

## Inspirations

- [xa](https://github.com/xxczaki/xa)
- [consola](https://github.com/unjs/consola/)

## Authors

- [John Mars](http://m4r5.io)

## License

MIT © John Mars
