import {
	test,
	visualizeConfigurations,
	visualizeEdgeCases,
	visualizeQuantization,
} from "./visualize";

// Capture console output for DOM rendering
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

interface CapturedLog {
	type: "log" | "warn" | "error";
	args: unknown[];
	hasAnsi: boolean;
	rawText: string;
}

const capturedLogs: CapturedLog[] = [];

function captureConsole() {
	console.log = (...args: unknown[]) => {
		const rawText = args.map((arg) => String(arg)).join(" ");
		capturedLogs.push({
			type: "log",
			args,
			hasAnsi: /\u001B\[\d+m/.test(rawText),
			rawText,
		});
		originalLog(...args);
	};

	console.warn = (...args: unknown[]) => {
		const rawText = args.map((arg) => String(arg)).join(" ");
		capturedLogs.push({
			type: "warn",
			args,
			hasAnsi: /\u001B\[\d+m/.test(rawText),
			rawText,
		});
		originalWarn(...args);
	};

	console.error = (...args: unknown[]) => {
		const rawText = args.map((arg) => String(arg)).join(" ");
		capturedLogs.push({
			type: "error",
			args,
			hasAnsi: /\u001B\[\d+m/.test(rawText),
			rawText,
		});
		originalError(...args);
	};
}

function renderLogsToDOM() {
	const outputElement = document.querySelector("#output");
	if (!outputElement) return;

	const html = capturedLogs
		.map((log) => {
			const type = log.type;
			const text = log.rawText;
			const hasColors = log.hasAnsi;

			return `<div class="log-entry" data-type="${type}" data-has-colors="${hasColors}">${escapeHtml(text)}</div>`;
		})
		.join("");

	outputElement.innerHTML = html;

	// Store logs count for testing
	(window as unknown as { hagenTestData: unknown }).hagenTestData = {
		totalLogs: capturedLogs.length,
		logTypes: capturedLogs.map((l) => l.type),
		hasColoredOutput: capturedLogs.some((l) => l.hasAnsi),
		logs: capturedLogs,
	};
}

function escapeHtml(text: string): string {
	const div = document.createElement("div");
	div.textContent = text;
	return div.innerHTML;
}

// Expose test function globally for testing purposes
(window as unknown as { runHagenTest: () => void }).runHagenTest = () => {
	capturedLogs.length = 0; // Clear previous logs
	captureConsole();
	test();
	visualizeQuantization();
	visualizeConfigurations();
	visualizeEdgeCases();
	renderLogsToDOM();
};

document.addEventListener("DOMContentLoaded", () => {
	// In the browser, the logger writes to console.
	// Open the browser dev console to see the colored output.
	captureConsole();
	test();
	visualizeQuantization();
	visualizeConfigurations();
	visualizeEdgeCases();
	renderLogsToDOM();
});
