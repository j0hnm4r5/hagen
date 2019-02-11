# Hagen

![](https://github.com/j0hnm4r5/hagen/raw/master/assets/screenshot.png)

A colorful logger for JS in Node, Electron, and in the Browser (ES6 only). Named after Hagen, the colorful Lumberjack from [Synthie Forest](https://vimeo.com/90995716).

## Getting Started

### Installation

`npm i hagen`

or

`yarn add hagen`

### Usage

Hagen extends `console.log`, `console.warn`, and `console.error`. It takes two parameters: a string `label` and a `message`.

The label's color is chosen randomly from a list of curated colors, by analyzing the string. The color will remain the same every time you use the same label. You can additionally pass in an integer as a third parameter to manually select the color.

Hagen also handles [console grouping](https://developer.mozilla.org/en-US/docs/Web/API/Console/group), using `hagen.group()`, `hagen.groupCollapsed()`, and `hagen.groupEnd()`.

#### Importing

##### Node

`const hagen = require("hagen");`

##### Browser

`import hagen from "hagen";`

or to import only specific functions:

`import { log, info } from "hagen`

#### Commands

```js
hagen.log("LABEL", "Hello, World!"); // normal log
hagen.info("LABEL", "This is some unimportant info."); // info log
hagen.warn("LABEL", "Something happened!"); // warning log
hagen.error("LABEL", "This is bad."); // error log
hagen.log("LABEL"); // just the label, no message

hagen.log("LABEL", "Hello, World!", 3); // custom color (0-7)
hagen.log("LABEL", "Hello, World!", { bg: "#ff00ff", text: "green" }); // manual color (css color strings)

// grouping
hagen.group();
hagen.log(`LEVEL 1`);
hagen.group();
hagen.log(`LEVEL 2`);
hagen.groupEnd();
hagen.groupEnd();
```

## Major Technologies

-   [Chalk](https://github.com/chalk/chalk)

## Inspirations

-   [xa](https://github.com/xxczaki/xa)
-   [consola](https://github.com/nuxt/consola/)

## Authors

-   [John Mars](http://m4r5.io)

## License

MIT © John Mars
