/**
 * A colorful logger for JS in Node and in the Browser
 *
 * Named after Hagen the colorful Lumberjack from Synthie Forest
 * https://vimeo.com/90995716
 *
 */

// ========= IMPORTS =========

import { Chalk } from "chalk";

// ========= COLORS =========
import { defaultColors, reservedColors } from "./utils/colors";

// ========= HELPERS =========

// Writes to console colored text, from the passed-in logger
function print({
	logger,
	color,
	label,
	message,
}: {
	logger: typeof console.log | typeof console.warn | typeof console.error;
	color: Chalk;
	label: string;
	message: any;
}) {
	const coloredLabel = color.bold(` ${label} `);

	switch (typeof message) {
		case `object`:
			// if the message is an object
			logger(coloredLabel, `${JSON.stringify(message)}`);
			break;
		case `undefined`:
			// if there is no message
			logger(coloredLabel);
			break;
		default:
			// everything else
			logger(coloredLabel, `${message}`);
			break;
	}
}

// ========= LOGGERS =========

// basic logger
function log(label: string, message?: any, manualColor?: number) {
	// checks if a color id was passed in and sets the color
	let color;
	if (manualColor) {
		// if it was set, use that as the color id
		color = defaultColors[manualColor % defaultColors.length] ?? defaultColors[0];
	} else {
		// if it wasn't, hash the label to a color id
		let val = 0;
		label.split(``).forEach((character) => {
			val += character.charCodeAt(0);
		});

		color = defaultColors[val % defaultColors.length];
	}

	print({ logger: console.log, color, label, message });
}

// info logger
function info(label: string, message?: any) {
	print({ logger: console.log, color: reservedColors.INFO, label: `i ${label}`, message });
}

// warning logger
function warn(label: string, message?: any) {
	print({ logger: console.warn, color: reservedColors.WARN, label: `! ${label}`, message });
}

// error logger
function error(label: string, message?: any) {
	print({ logger: console.error, color: reservedColors.ERROR, label: `✕ ${label}`, message });
}

// ========= EXPORTS =========
export default { ...console, log, info, warn, error };
