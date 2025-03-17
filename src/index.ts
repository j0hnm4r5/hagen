/**
 * A colorful logger for JS in Node and in the Browser
 *
 * Named after Hagen the colorful Lumberjack from Synthie Forest
 * https://vimeo.com/90995716
 */

import chalk from "chalk";
import { isCI } from "std-env";

// ========= TYPES =========

type Label =
	| string
	| {
			label: string;
			color: chalk.Chalk | number;
	  }
	| {
			label: string;
			bgColor: string;
			fgColor: string;
	  };

interface PrintParams {
	logger: (...params: any) => void;
	label: Label;
	message?: any;
}

interface LoggerConfig {
	showTimestamp: boolean;
	colors: {
		reserved: {
			WARN: chalk.Chalk;
			ERROR: chalk.Chalk;
			INFO: chalk.Chalk;
			SUCCESS: chalk.Chalk;
		};
		normal: chalk.Chalk[];
	};
	fixedWidth?: {
		width: number;
		truncationMethod?: "start" | "end" | "middle";
	};
}

// ========= CONFIGURATION =========

const customChalk = new chalk.Instance({ level: 3 });

// if the environment is CI, don't use color
if (isCI) {
	customChalk.level = 0;
}

const defaultConfig: LoggerConfig = {
	showTimestamp: false,
	colors: {
		reserved: {
			WARN: customChalk.bgYellowBright.black,
			ERROR: customChalk.bgRedBright.black,
			INFO: customChalk.bgBlack.white,
			SUCCESS: customChalk.bgBlack.greenBright,
		},
		normal: [
			customChalk.bgBlue.white, // blue
			customChalk.bgGreen.black, // green
			customChalk.bgCyan.black, // cyan
			customChalk.bgRed.white, // red
			customChalk.bgMagenta.white, // magenta
			customChalk.bgYellow.black, // yellow
		],
	},
};

let currentConfig = { ...defaultConfig };

export function setConfig(config: Partial<LoggerConfig>): void {
	currentConfig = { ...currentConfig, ...config };
}

export function getConfig(): LoggerConfig {
	return currentConfig;
}

export function resetConfig(): void {
	currentConfig = { ...defaultConfig };
}

// ========= HELPERS =========

/**
 * Returns a default color either based on a manual index or a hash of the label.
 */
function calculateLabelColor(label: string): chalk.Chalk {
	const charSum = Array.from(label).reduce((sum, char) => sum + char.charCodeAt(0), 0);
	return currentConfig.colors.normal[charSum % currentConfig.colors.normal.length];
}

/**
 * Formats the text to a fixed width.
 * - If the text is shorter than the width, it is centered.
 * - If it is longer, it is truncated based on the provided position:
 *   - "start": keep the end of the string.
 *   - "end": keep the beginning of the string.
 *   - "middle": keep the beginning and end, with an ellipsis in the middle.
 */
function fixedWidthFormat(
	text: string,
	width: number,
	truncationMethod: "start" | "end" | "middle" = "end"
): string {
	if (text.length === width) {
		return text;
	}

	if (text.length < width) {
		const spacesTotal = width - text.length;
		const leftPadding = Math.floor(spacesTotal / 2);
		const rightPadding = spacesTotal - leftPadding;
		return " ".repeat(leftPadding) + text + " ".repeat(rightPadding);
	}

	const ellipsis = "…";
	const charsToShow = width - 1; // account for the ellipsis

	// text is longer than the target width, so truncate
	switch (truncationMethod) {
		case "start":
			return `${ellipsis}${text.slice(text.length - charsToShow)}`;
		case "end":
			return `${text.slice(0, charsToShow)}${ellipsis}`;
		case "middle": {
			const frontChars = Math.ceil(charsToShow / 2);
			const backChars = Math.floor(charsToShow / 2);
			return `${text.slice(0, frontChars)}${ellipsis}${text.slice(text.length - backChars)}`;
		}
		default:
			throw new Error(`Invalid truncation method: ${truncationMethod}`);
	}
}

/**
 * Prints the colored label and the message to the provided logger.
 */
function print({ logger, label, message }: PrintParams): void {
	// let labelString: string;
	let color: chalk.Chalk;

	let finalLabel: string = "•";

	if (typeof label === "object") {
		// if the label is an object
		finalLabel = label.label ? label.label : finalLabel;

		if ("color" in label) {
			if (typeof label.color === "number") {
				// if the label has a color index, use it
				color = currentConfig.colors.normal[label.color];
			} else {
				// if the label has a chalk color, use it
				color = label.color;
			}
		} else {
			// if the label has bgColor and fgColor properties use them
			color = customChalk.bgHex(label.bgColor).hex(label.fgColor);
		}
	} else {
		// if the label is a string
		finalLabel = label || finalLabel;

		// use the default color
		color = calculateLabelColor(label);
	}

	// trim off extra spaces
	finalLabel.trim();

	// apply fixed width formatting if configured
	if (currentConfig.fixedWidth !== undefined) {
		finalLabel = fixedWidthFormat(
			finalLabel,
			currentConfig.fixedWidth.width,
			currentConfig.fixedWidth.truncationMethod
		);
	}

	// make the label bold
	finalLabel = color.bold(` ${finalLabel} `);

	// if the environment is CI, add a border around the label
	if (isCI) {
		finalLabel = `[${finalLabel}]`;
	}

	// add a timestamp if configured
	if (currentConfig.showTimestamp) {
		const timestamp = new Date().toISOString();
		const timestampLabel = customChalk.gray(`[ ${timestamp} ]`);
		finalLabel = `${finalLabel} ${timestampLabel}`;
	}

	// log it
	logger(finalLabel, message);
}

/**
 * Formats the label by prepending a prefix. If the label is empty, returns the fallback.
 */
function formatLabel(prefix: string, label: string): string {
	return `${prefix} ${label}`.trim();
}

// ========= LOGGERS =========

export function log(label: Label, message?: any): void {
	print({
		logger: console.log,
		label,
		message,
	});
}

export function info(label: string, message?: any): void {
	print({
		logger: console.log,
		label: {
			label: formatLabel("i", label),
			color: currentConfig.colors.reserved.INFO,
		},
		message,
	});
}

export function success(label: string, message?: any): void {
	print({
		logger: console.log,
		label: {
			label: formatLabel("✓", label),
			color: currentConfig.colors.reserved.SUCCESS,
		},
		message,
	});
}

export function warn(label: string, message?: any): void {
	print({
		logger: console.warn,
		label: {
			label: formatLabel("!", label),
			color: currentConfig.colors.reserved.WARN,
		},
		message,
	});
}

export function error(label: string, message?: any): void {
	print({
		logger: console.error,
		label: {
			label: formatLabel("✕", label),
			color: currentConfig.colors.reserved.ERROR,
		},
		message,
	});
}

export default { log, info, success, warn, error };
