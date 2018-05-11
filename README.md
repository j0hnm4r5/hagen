# Hagen

[![XO](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io/)
[![gitmoji](https://img.shields.io/badge/gitmoji-%F0%9F%98%9C%F0%9F%98%8D-yellow.svg?style=flat-square)](https://gitmoji.carloscuesta.me/)

![](https://i.imgur.com/SQ0ob19.png?1)

A colorful logger for JS in Node and in the Browser (ES6 only). Named after Hagen, the colorful Lumberjack from [Synthie Forest](https://vimeo.com/90995716).

## Getting Started

### Installation

`yarn add hagen`


### Usage

#### Node

```js
const hagen = require("hagen");

hagen.log("TEST", "Hello, World!");
hagen.warn("ABC", "Something happened!");
hagen.error("123", "This is bad.");

```

#### Browser (ES6)

```js
import * as hagen from "hagen";

hagen.log("TEST", "Hello, World!");
hagen.warn("ABC", "Something happened!");
hagen.error("123", "This is bad.");

```


## Major Technologies

*   [Chalk](https://github.com/chalk/chalk)

## Authors

*   [John Mars](http://m4r5.io)