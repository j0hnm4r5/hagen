/**
 * A colorful logger for JS in Node and in the Browser
 *
 * Named after Hagen the colorful Lumberjack from Synthie Forest
 * https://vimeo.com/90995716
 *
 */

// ========= IMPORTS =========

const isNode = require("detect-node");
const chalk = require("chalk");

// ========= COLORS =========
const colorList = require("./utils/colors");

const textColors = Object.freeze({
	LIGHT: colorList.gray[50],
	DARK: colorList.gray[900],
});

const reservedColors = Object.freeze({
	WARN: { bg: colorList.gray[500], text: textColors.DARK },
	ERROR: { bg: colorList.gray[900], text: textColors.LIGHT },
});

const colors = [
	{ bg: colorList.blue[500], text: textColors.LIGHT }, // blue
	{ bg: colorList.red[500], text: textColors.LIGHT }, // red
	{ bg: colorList.yellow[500], text: textColors.DARK }, // yellow
	{ bg: colorList.green[500], text: textColors.LIGHT }, // green
	{ bg: colorList.orange[500], text: textColors.LIGHT }, // orange
	{ bg: colorList.pink[500], text: textColors.LIGHT }, // pink
	{ bg: colorList.purple[500], text: textColors.LIGHT }, // purple
	{ bg: colorList.cyan[500], text: textColors.DARK }, // cyan
];

// ========= HELPERS =========

// Writes to console colored text, from the passed-in logger
function logg(logger, color, label, message) {
	if (isNode) {
		logger(
			chalk
				.bgHex(color.bg)
				.hex(color.text)
				.bold(` ${label} `),
			`${message}`
		);
	} else {
		logger(
			`%c ${label} %c ${message}`,
			`background-color: ${color.bg}; color: ${color.text}`,
			`background-color: inherit; color: inherit`
		);
	}
}

// ========= LOGGERS =========

// basic logger
function log(label, message, manualColor) {
	let color;

	// checks if a color id was passed in and sets the color
	const numColors = colors.length;
	if (typeof manualColor === `number` && manualColor >= 0) {
		// if it was with an integer, use that as the color id
		color = colors[Math.round(manualColor) % numColors];
	} else if (
		typeof manualColor === `object` &&
		manualColor.bg !== undefined &&
		manualColor.text !== undefined
	) {
		// if it was with a custom color object, use that
		color = { bg: manualColor.bg, text: manualColor.text };
	} else {
		// if it wasn't, use a value generated from the label
		let val = 0;
		label.split(``).forEach((character) => {
			val += character.charCodeAt(0);
		});

		color = colors[val % numColors];
	}

	// extends console.log()
	logg(console.log, color, label, message);
}

// warning logger
function warn(label, message) {
	// extends console.warn()
	logg(console.warn, reservedColors.WARN, `⚠️  ${label}`, message);
}

// error logger
function error(label, message) {
	// extends console.error()
	logg(console.error, reservedColors.ERROR, `❌  ${label}`, message);
}

// ========= EXPORTS =========

module.exports = { log, warn, error };
