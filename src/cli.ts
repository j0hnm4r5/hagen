#!/usr/bin/env node

import { parseArgs } from "node:util";
import hagen, { type HagenInstance } from "./index";

const { values, positionals } = parseArgs({
	options: {
		level: {
			type: "string",
			short: "L",
			default: "log",
		},
		label: {
			type: "string",
			short: "l",
		},
		fg: {
			type: "string",
			short: "f",
		},
		bg: {
			type: "string",
			short: "b",
		},
		help: {
			type: "boolean",
			short: "h",
		},
	},
	allowPositionals: true,
});

if (values.help) {
	console.log(`
Usage: hagen [options] <message...>

Options:
  -L, --level <level>  Log level (log, info, warn, error, debug). Default: log
  -l, --label <label>  Label text
  -f, --fg <color>     Foreground text color (hex, ansi name)
  -b, --bg <color>     Background color (hex, ansi name)
  -h, --help           Show this help message

Examples:
  hagen "Hello World"
  hagen -l "MyLabel" "Message with label"
  hagen -L error "Something went wrong"
  hagen -l "Alert" --bg red --fg white "Critical Error"
`);
	process.exit(0);
}

async function main() {
	const level = (values.level || "log") as keyof HagenInstance;
	let message = positionals.join(" ");

	// Check for stdin if no message provided
	if (!message && !process.stdin.isTTY) {
		try {
			const chunks = [];
			for await (const chunk of process.stdin) {
				chunks.push(chunk);
			}
			message = Buffer.concat(chunks).toString().trim();
		} catch (error) {
			console.error("Failed to read from stdin", error);
			process.exit(1);
		}
	}

	// Determine label arguments
	let label: string | object | undefined = values.label;

	if (values.fg || values.bg) {
		label = {
			kind: "color",
			label: values.label ?? "hagen", // Default label if using colors
			fgColor: values.fg,
			bgColor: values.bg,
		};
	}

	if (!message && !label) {
		// If no message and no label, show help implicitly or just exit?
		// User didn't specify behavior for empty args, but usually CLI tools show help.
		// However, hagen might support empty logs? calling hagen.log() prints nothing visible?
		// Let's defer to Hagen's behavior but ensure we at least try to log something if provided.
		// Actually, standard practice: if empty args, show help.
		// check default behavior: "If 0 positional args: print usage instructions" from my plan.
		console.log("Usage: hagen [options] <message...>. Use --help for more info.");
		process.exit(1);
	}

	if (!(level in hagen) || typeof hagen[level] !== "function") {
		console.error(`Invalid log level: ${level}`);
		process.exit(1);
	}

	// Call the logger
	// Note: label can be string or undefined. message is string.
	// @ts-expect-error - label can be object/Label type which TS might not infer perfectly from here without full types import
	hagen[level](label, message);
}

main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
