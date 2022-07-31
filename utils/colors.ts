import chalk from "chalk";

export const reservedColors = {
	WARN: chalk.bgHex(`#ccff00`).hex("#000000"),
	ERROR: chalk.bgHex("#ff0099").hex("#ffffff"),
	INFO: chalk.bgBlack.white,
};

export const defaultColors = [
	chalk.bgBlue.white, // blue, 0
	chalk.bgRed.white, // red, 1
	chalk.bgYellow.black, // yellow, 2
	chalk.bgGreen.green, // green, 3
	chalk.bgMagenta.magenta, // magenta, 4
	chalk.bgCyan.cyan, // cyan, 5
];
