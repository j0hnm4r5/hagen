/**
 * A colorful logger for JS in Node and in the Browser
 *
 * Named after Hagen the colorful Lumberjack from Synthie Forest
 * https://vimeo.com/90995716
 *
 */

// ========= IMPORTS =========

const isBrowser = require("detect-browser").detect();
const chalk = require("chalk");

// ========= COLORS =========
const colorList = require("./utils/colors");

const textColors = Object.freeze({
	LIGHT: colorList.gray[50],
	DARK: colorList.gray[900],
});

const reservedColors = Object.freeze({
	WARN: { bg: `#ccff00`, text: textColors.DARK },
	ERROR: { bg: `#ff0099`, text: textColors.LIGHT },
	INFO: { bg: `#000000`, text: textColors.LIGHT },
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
	if (isBrowser.name === `node`) {
		// if using node.js
		switch (typeof message) {
			case `object`:
				// if the message is an object
				logger(
					chalk
						.bgHex(color.bg)
						.hex(color.text)
						.bold(` ${label} `),
					`${JSON.stringify(message)}`
				);
				break;
			case `undefined`:
				// if there is no message
				logger(
					chalk
						.bgHex(color.bg)
						.hex(color.text)
						.bold(` ${label} `)
				);
				break;
			default:
				logger(
					chalk
						.bgHex(color.bg)
						.hex(color.text)
						.bold(` ${label} `),
					`${message}`
				);
				break;
		}
	} else {
		// if using the browser
		switch (typeof message) {
			case `object`:
				// if the message is an object
				logger(
					`%c ${label} %c %o`,
					`
						background-color: ${color.bg}; 
						color: ${color.text}; 
						font-weight: bold;
					`,
					`
						background-color: inherit; 
						color: inherit; 
						font-weight: inherit;
					`,
					message
				);
				break;
			case `undefined`:
				// if there is no message
				logger(
					`%c ${label} `,
					`
						background-color: ${color.bg}; 
						color: ${color.text}; 
						font-weight: bold;
					`
				);
				break;
			default:
				logger(
					`%c ${label} %c ${message}`,
					`
						background-color: ${color.bg}; 
						color: ${color.text}; 
						font-weight: bold;
					`,
					`
						background-color: inherit; 
						color: inherit; 
						font-weight: inherit;
					`
				);
				break;
		}
	}
}

// ========= LOGGERS =========

// basic logger
function log(label, message, manualColor) {
	// if the label isn't a string
	if (typeof label !== `string`) label = ``;

	// checks if a color id was passed in and sets the color
	let color;
	const numColors = colors.length;
	if (typeof manualColor === `number` && manualColor >= 0) {
		// if it was with an integer, use that as the color id
		// round floats to the nearest integer
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

	logg(console.log, color, label, message);
}

// info logger
function info(label, message) {
	logg(console.log, reservedColors.INFO, `i ${label}`, message);
}

// warning logger
function warn(label, message) {
	logg(console.warn, reservedColors.WARN, `! ${label}`, message);
}

// error logger
function error(label, message) {
	logg(console.error, reservedColors.ERROR, `✕ ${label}`, message);
}

// ========= GROUPS =========

function group() {
	console.group();
}
function groupCollapsed() {
	console.groupCollapsed();
}
function groupEnd() {
	console.groupEnd();
}

// ========= EXPORTS =========

module.exports = {
	log,
	info,
	warn,
	error,
	group,
	groupCollapsed,
	groupEnd,
};
