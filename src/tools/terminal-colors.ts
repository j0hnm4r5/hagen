#!/usr/bin/env -S node --no-warnings

/// <reference types="node" />

/** RGB color tuple [red, green, blue] where each value is 0-255 */
type RGB = readonly [number, number, number];

const ESC = "\u001B";
const BEL = "\u0007";
const PALETTE_SIZE = 16;
const READ_TIMEOUT_MS = 1000;

const PALETTE_NAMES = [
	"black",
	"red",
	"green",
	"yellow",
	"blue",
	"magenta",
	"cyan",
	"white",
	"brightBlack",
	"brightRed",
	"brightGreen",
	"brightYellow",
	"brightBlue",
	"brightMagenta",
	"brightCyan",
	"brightWhite",
] as const;

type PaletteName = (typeof PALETTE_NAMES)[number];
interface PaletteEntry {
	index: number;
	rgb: RGB;
}
type Palette = Record<PaletteName, PaletteEntry>;

class UnsupportedTerminalError extends Error {
	override name = "UnsupportedTerminalError";
	constructor(message = "Terminal does not support ANSI color palette queries") {
		super(message);
	}
}

/** Parse OSC 4 rgb response (e.g. "rgb:ffff/0000/8080") to RGB tuple */
function parseOscRgb(s: string): RGB {
	const match = /^rgb:([0-9a-f]{1,4})\/([0-9a-f]{1,4})\/([0-9a-f]{1,4})$/i.exec(s);
	if (!match) throw new Error(`Invalid OSC 4 color format: ${s}`);

	// Scale from 16-bit (0-65535) to 8-bit (0-255)
	const to8bit = (hex: string) => Math.round((Number.parseInt(hex, 16) / 0xFF_FF) * 255);
	return [to8bit(match[1]!), to8bit(match[2]!), to8bit(match[3]!)] as const;
}

/** Build the query string for all palette indices */
function buildPaletteQuery(): string {
	return Array.from({ length: PALETTE_SIZE }, (_, index) => `${ESC}]4;${index};?${BEL}`).join("");
}

/** Response pattern: ESC]4;{index};{rgb}BEL or ESC]4;{index};{rgb}ESC\ */
const OSC_RESPONSE_RE = new RegExp(String.raw`\x1b\]4;(\d+);([^\x07\x1b]+)(?:\x07|\x1b\\)`, "g");

async function queryPalette(): Promise<Palette> {
	if (!process.stdin.isTTY) {
		throw new Error("stdin is not a TTY; cannot query terminal colors");
	}

	const results = new Map<number, string>();
	let buffer = "";

	return new Promise((resolve, reject) => {
		const cleanup = () => {
			clearTimeout(timer);
			process.stdin.removeListener("data", onData);
			process.stdin.setRawMode(false);
			process.stdin.pause();
		};

		const timer = setTimeout(() => {
			cleanup();
			const missing = Array.from({ length: PALETTE_SIZE }, (_, index) => index).filter(
				(index) => !results.has(index)
			);
			reject(
				new UnsupportedTerminalError(
					`Terminal did not respond for palette indices: ${missing.join(", ")}`
				)
			);
		}, READ_TIMEOUT_MS);

		const onData = (chunk: string) => {
			buffer += chunk;

			// Extract all complete responses from buffer
			let match: RegExpExecArray | null;
			while ((match = OSC_RESPONSE_RE.exec(buffer))) {
				results.set(Number(match[1]), match[2]!);
			}

			// Check if we have all responses
			if (results.size >= PALETTE_SIZE) {
				cleanup();

				const palette = {} as Palette;
				for (let index = 0; index < PALETTE_SIZE; index++) {
					const name = PALETTE_NAMES[index]!;
					const value = results.get(index)!;
					palette[name] = { index: index, rgb: parseOscRgb(value) };
				}
				resolve(palette);
			}
		};

		// Setup stdin for raw terminal input
		process.stdin.setEncoding("utf8");
		process.stdin.setRawMode(true);
		process.stdin.on("data", onData);

		// Send all queries at once
		process.stdout.write(buildPaletteQuery());
	});
}

async function main() {
	try {
		const palette = await queryPalette();
		console.log(palette);
	} catch (error) {
		if (error instanceof UnsupportedTerminalError) {
			console.error("Unsupported terminal:", error.message);
		} else {
			console.error(error);
		}
		process.exitCode = 1;
	}
}

void main();
