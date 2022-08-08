/**
 * A colorful logger for JS in Node and in the Browser
 *
 * Named after Hagen the colorful Lumberjack from Synthie Forest
 * https://vimeo.com/90995716
 *
 */

// ========= IMPORTS =========

import chalk from "chalk";

// ========= COLORS =========

const customChalk = new chalk.Instance({ level: 3 });

const reservedColors = {
	WARN: customChalk.bgHex(`#ccff00`).hex("#000000"),
	ERROR: customChalk.bgHex("#ff0099").hex("#000000"),
	INFO: customChalk.bgBlack.white,
	SUCCESS: customChalk.bgBlack.greenBright,
};

const defaultColors = [
	customChalk.bgBlue.white, // blue, 0
	customChalk.bgGreen.black, // green, 1
	customChalk.bgCyan.black, // cyan, 2
	customChalk.bgRed.white, // red, 3
	customChalk.bgMagenta.white, // magenta, 4
	customChalk.bgYellow.black, // yellow, 5
];

// ========= HELPERS =========

// writes to console colored text, from the passed-in logger
function print({
	logger,
	color,
	label,
	message,
}: {
	logger: typeof console.log | typeof console.warn | typeof console.error;
	color: chalk.Chalk;
	label: string;
	message: any;
}) {
	// const coloredLabel = chalk.supportsColor ? color.bold(` ${label} `) : `[[ ${label} ]]`;
	const coloredLabel = color.bold(` ${label} `);

	switch (typeof message) {
		case "string":
			logger(`${coloredLabel}`, message);
			break;
		case "undefined":
			logger(coloredLabel);
			break;
		default:
			// if the message is an object
			logger(coloredLabel);
			console.group();
			console.log(message);
			console.groupEnd();
			break;
	}
}

// ========= LOGGERS =========

// basic logger
function log(label: string, message?: any, manualColor?: number) {
	// checks if a color id was passed in and sets the color
	let color;
	if (manualColor !== undefined) {
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

	print({
		logger: console.log,
		color,
		label: label === "" ? "•" : label,
		message,
	});
}

// info logger
function info(label: string, message?: any) {
	print({
		logger: console.log,
		color: reservedColors.INFO,
		label: `i${label === "" ? "" : " "}${label}`,
		message,
	});
}

// success logger
function success(label: string, message?: any) {
	print({
		logger: console.log,
		color: reservedColors.SUCCESS,
		label: `✓${label === "" ? "" : " "}${label}`,
		message,
	});
}

// warning logger
function warn(label: string, message?: any) {
	print({
		logger: console.warn,
		color: reservedColors.WARN,
		label: `!${label === "" ? "" : " "}${label}`,
		message,
	});
}

// error logger
function error(label: string, message?: any) {
	print({
		logger: console.error,
		color: reservedColors.ERROR,
		label: `✕${label === "" ? "" : " "}${label}`,
		message,
	});
}

// ========= EXPORTS =========
export default { log, info, success, warn, error };
