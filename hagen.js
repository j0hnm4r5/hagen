/**
 * A colorful logger for JS in Node and in the Browser
 *
 * Named after Hagen the colorful Lumberjack from Synthie Forest
 * https://vimeo.com/90995716
 *
 */

const chalk = require("chalk");

// TODO: This isn't a super duper safe way to check for Browser/Node/: https://stackoverflow.com/questions/4224606/how-to-check-whether-a-script-is-running-under-node-js
// Ideally, we shouldn’t even have to check; the logging should work regardless of platform
const isNode = typeof process === "object" && `${process}` === "[object process]";

const textColors = Object.freeze({
	LIGHT: "#FAFAFA",
	DARK: "212121",
});

const reservedColors = Object.freeze({
	WARN: { bg: "#424242", text: textColors.LIGHT },
	ERROR: { bg: "#212121", text: textColors.LIGHT },
});

const colors = [
	// Google Material colors (A400): https://gist.github.com/kawanet/a880c83f06d6baf742e45ac9ac52af96
	{ bg: "#f50057", text: textColors.LIGHT }, // Pink
	{ bg: "#d500f9", text: textColors.LIGHT }, // Purple
	{ bg: "#651fff", text: textColors.LIGHT }, // Deep Purple
	{ bg: "#3d5afe", text: textColors.LIGHT }, // Indigo
	{ bg: "#2979ff", text: textColors.LIGHT }, // Blue
	{ bg: "#00b0ff", text: textColors.DARK }, // Light Blue
	{ bg: "#00e5ff", text: textColors.DARK }, // Cyan
	{ bg: "#1de9b6", text: textColors.DARK }, // Teal
	{ bg: "#00e676", text: textColors.DARK }, // Green
	{ bg: "#76ff03", text: textColors.DARK }, // Light Green
	{ bg: "#c6ff00", text: textColors.DARK }, // Lime
	{ bg: "#ffea00", text: textColors.DARK }, // Yellow
	{ bg: "#ff9100", text: textColors.DARK }, // Orange
	{ bg: "#ff3d00", text: textColors.LIGHT }, // Deep Orange
];

// Writes to console colored text, from the passed-in logger
function logg(logger, color, label, message) {
	// TODO: Try to get rid of the if...else, and just have a uniform logging method
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

// Basic logger
function log(label, message) {
	// Picks a random color from the array, based on the label name
	let val = 0;
	label.split("").forEach((character) => {
		val += character.charCodeAt(0);
	});

	const numColors = colors.length;
	const color = colors[val % numColors];

	logg(console.log, color, label, message);
}

// Warning logger
function warn(label, message) {
	logg(console.warn, reservedColors.WARN, `⚠️  ${label}`, message);
}

// Error logger
function error(label, message) {
	logg(console.error, reservedColors.ERROR, `❌  ${label}`, message);
}

module.exports = { log, warn, error };
