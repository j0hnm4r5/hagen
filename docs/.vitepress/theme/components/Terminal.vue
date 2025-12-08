<template>
	<div class="terminal-container">
		<div ref="terminalRef" class="terminal-body"></div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import examples from "../../examples";

interface Props {
	exampleId?: string;
	code?: string;
	title?: string;
	editable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	exampleId: "repl",
	code: "",
	title: "Node.js REPL",
	editable: true,
});

const terminalRef = ref<HTMLElement | null>(null);

let terminal: any = null;
let fitAddon: any = null;
let currentCode = "";

// Initialize terminal with Catppuccin Mocha theme
async function initTerminal() {
	if (!terminalRef.value) return;

	// Dynamic import for browser-only code
	const { Terminal } = await import("xterm");
	const { FitAddon } = await import("xterm-addon-fit");
	await import("xterm/css/xterm.css");

	terminal = new Terminal({
		cursorBlink: false,
		fontSize: 14,
		fontFamily: 'Menlo, Monaco, "Courier New", monospace',
		theme: {
			// Catppuccin Mocha theme
			background: "#1e1e2e",
			foreground: "#cdd6f4",
			cursor: "#f5e0dc",
			cursorAccent: "#1e1e2e",
			selectionBackground: "#585b70",
			black: "#45475a",
			red: "#f38ba8",
			green: "#a6e3a1",
			yellow: "#f9e2af",
			blue: "#89b4fa",
			magenta: "#cba6f7",
			cyan: "#94e2d5",
			white: "#bac2de",
			brightBlack: "#585b70",
			brightRed: "#f38ba8",
			brightGreen: "#a6e3a1",
			brightYellow: "#f9e2af",
			brightBlue: "#89b4fa",
			brightMagenta: "#cba6f7",
			brightCyan: "#94e2d5",
			brightWhite: "#a6adc8",
		},
		allowTransparency: false,
		scrollback: 1000,
		disableStdin: true,
		rows: 1, // Start with 1 row, will auto-resize
	});

	fitAddon = new FitAddon();
	terminal.loadAddon(fitAddon);
	terminal.open(terminalRef.value);
}

// Get code to execute
function getCodeToRun(): string {
	if (props.code) {
		return props.code;
	}

	if (props.exampleId && examples[props.exampleId]) {
		return examples[props.exampleId].code;
	}

	return examples["repl"].code;
}

// Run the code and auto-resize terminal to fit content
async function runCode() {
	try {
		currentCode = getCodeToRun();

		// Simulate output based on example
		simulateOutput(props.exampleId || "repl");

		// Auto-resize terminal to fit content after output is written
		// Use setTimeout to ensure terminal buffer is updated
		setTimeout(() => {
			resizeToContent();
		}, 50);
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : "Unknown error";
		terminal?.writeln("");
		terminal?.writeln(`\x1b[31m✕ Error:\x1b[0m ${errorMessage}`);
		setTimeout(() => {
			resizeToContent();
		}, 50);
	}
}

// Resize terminal to fit content with padding
function resizeToContent() {
	if (!terminal || !terminalRef.value) return;

	const buffer = terminal.buffer.active;
	const lineCount = buffer.length;

	// Count lines with actual content (non-empty lines)
	let contentLines = 0;
	for (let i = 0; i < buffer.length; i++) {
		const line = buffer.getLine(i);
		if (line && line.translateToString(true).trim().length > 0) {
			contentLines++;
		}
	}

	// Add 1 line of padding at bottom
	const targetRows = Math.max(contentLines + 1, 3); // Min 3 rows

	terminal.resize(terminal.cols, targetRows);

	// Update container height
	const lineHeight = 20; // ~14px font + 6px line spacing
	const padding = 32; // 16px top + 16px bottom
	const height = targetRows * lineHeight + padding;
	terminalRef.value.style.height = `${height}px`;
}

// Simulate output for different examples
function simulateOutput(exampleId: string) {
	// This is a temporary simulation until we have full Wasmer.js integration
	// In the final version, this will execute real code in the WASM Node.js instance

	switch (exampleId) {
		case "quick-start-basic":
			terminal?.writeln("\x1b[46m\x1b[30m APP \x1b[0m Application starting...");
			terminal?.writeln(
				"\x1b[34mi\x1b[0m \x1b[44m\x1b[37m CONFIG \x1b[0m Loaded configuration from env"
			);
			terminal?.writeln(
				"\x1b[32m✓\x1b[0m \x1b[42m\x1b[37m DB \x1b[0m Database connection established"
			);
			terminal?.writeln(
				"\x1b[33m!\x1b[0m \x1b[43m\x1b[30m CACHE \x1b[0m Cache size exceeding threshold"
			);
			terminal?.writeln(
				"\x1b[31m✕\x1b[0m \x1b[41m\x1b[37m API \x1b[0m Request failed Error: Timeout"
			);
			break;

		case "log-levels-all":
			terminal?.writeln("\x1b[46m\x1b[30m LABEL \x1b[0m General logging");
			terminal?.writeln("\x1b[34mi\x1b[0m \x1b[44m\x1b[37m LABEL \x1b[0m Informational");
			terminal?.writeln("\x1b[32m✓\x1b[0m \x1b[42m\x1b[37m LABEL \x1b[0m Success message");
			terminal?.writeln("\x1b[33m!\x1b[0m \x1b[43m\x1b[30m LABEL \x1b[0m Warning message");
			terminal?.writeln("\x1b[31m✕\x1b[0m \x1b[41m\x1b[37m LABEL \x1b[0m Error message");
			break;

		case "log-levels-log":
			terminal?.writeln("\x1b[46m\x1b[30m API \x1b[0m Request received");
			terminal?.writeln("\x1b[43m\x1b[30m CACHE \x1b[0m Cache hit for key: user_123");
			terminal?.writeln("\x1b[45m\x1b[37m WORKER \x1b[0m Processing job job_456");
			break;

		case "log-levels-info":
			terminal?.writeln(
				"\x1b[34mi\x1b[0m \x1b[44m\x1b[37m CONFIG \x1b[0m Loaded configuration from env"
			);
			terminal?.writeln(
				"\x1b[34mi\x1b[0m \x1b[44m\x1b[37m AUTH \x1b[0m User authentication required"
			);
			terminal?.writeln(
				"\x1b[34mi\x1b[0m \x1b[44m\x1b[37m SYSTEM \x1b[0m Service started on port 3000"
			);
			break;

		case "log-levels-success":
			terminal?.writeln(
				"\x1b[32m✓\x1b[0m \x1b[42m\x1b[37m DB \x1b[0m Database connection established"
			);
			terminal?.writeln(
				"\x1b[32m✓\x1b[0m \x1b[42m\x1b[37m API \x1b[0m Request completed successfully"
			);
			terminal?.writeln("\x1b[32m✓\x1b[0m \x1b[42m\x1b[37m AUTH \x1b[0m User logged in");
			break;

		case "log-levels-warn":
			terminal?.writeln(
				"\x1b[33m!\x1b[0m \x1b[43m\x1b[30m CACHE \x1b[0m Cache size exceeding 80% capacity"
			);
			terminal?.writeln("\x1b[33m!\x1b[0m \x1b[43m\x1b[30m API \x1b[0m Rate limit approaching");
			terminal?.writeln(
				"\x1b[33m!\x1b[0m \x1b[43m\x1b[30m MEMORY \x1b[0m High memory usage detected"
			);
			break;

		case "log-levels-error":
			terminal?.writeln(
				"\x1b[31m✕\x1b[0m \x1b[41m\x1b[37m API \x1b[0m Request failed Error: Timeout"
			);
			terminal?.writeln(
				"\x1b[31m✕\x1b[0m \x1b[41m\x1b[37m DB \x1b[0m Connection lost Error: Connection refused"
			);
			terminal?.writeln("\x1b[31m✕\x1b[0m \x1b[41m\x1b[37m AUTH \x1b[0m Invalid credentials");
			break;

		case "basic-usage":
			terminal?.writeln("\x1b[46m\x1b[30m APP \x1b[0m Application starting");
			terminal?.writeln("\x1b[34mi\x1b[0m \x1b[44m\x1b[37m CONFIG \x1b[0m Configuration loaded");
			terminal?.writeln("\x1b[32m✓\x1b[0m \x1b[42m\x1b[37m INIT \x1b[0m Initialization complete");
			break;

		case "timestamps-time-24h":
			const time24 = new Date().toLocaleTimeString("en-US", {
				hour12: false,
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});
			terminal?.writeln(`${time24} \x1b[46m\x1b[30m API \x1b[0m Message`);
			break;

		case "timestamps-time-12h":
			const time12 = new Date().toLocaleTimeString("en-US", { hour12: true });
			terminal?.writeln(`${time12} \x1b[46m\x1b[30m API \x1b[0m Message`);
			break;

		case "custom-colors-palette":
			terminal?.writeln("\x1b[46m\x1b[30m API \x1b[0m Cyan");
			terminal?.writeln("\x1b[45m\x1b[37m API \x1b[0m Magenta");
			terminal?.writeln("\x1b[44m\x1b[37m API \x1b[0m Blue");
			terminal?.writeln("\x1b[43m\x1b[30m API \x1b[0m Yellow");
			terminal?.writeln("\x1b[42m\x1b[30m API \x1b[0m Green");
			terminal?.writeln("\x1b[41m\x1b[37m API \x1b[0m Red");
			break;

		case "custom-colors-hex":
			terminal?.writeln(
				"\x1b[48;2;255;107;107m\x1b[38;2;255;255;255m CUSTOM \x1b[0m Red background, white text"
			);
			terminal?.writeln("");
			terminal?.writeln(
				"\x1b[48;2;59;130;246m\x1b[38;2;255;255;255m PRIMARY \x1b[0m Primary brand color"
			);
			terminal?.writeln(
				"\x1b[48;2;16;185;129m\x1b[38;2;255;255;255m SUCCESS \x1b[0m Brand success color"
			);
			break;

		case "config-fixed-width":
			terminal?.writeln("\x1b[46m\x1b[30m API        \x1b[0m Short label");
			terminal?.writeln("\x1b[45m\x1b[37m DATABASE   \x1b[0m Longer label");
			terminal?.writeln("\x1b[44m\x1b[37m X          \x1b[0m Tiny");
			break;

		case "config-prefix-suffix":
			terminal?.writeln("→ \x1b[46m\x1b[30m API \x1b[0m Arrow before label");
			terminal?.writeln(">> \x1b[45m\x1b[37m WORKER \x1b[0m << Brackets");
			terminal?.writeln("✨ \x1b[42m\x1b[30m SUCCESS \x1b[0m Sparkles");
			terminal?.writeln("\x1b[44m\x1b[37m DB \x1b[0m : Colon after label");
			break;

		case "custom-styling":
			terminal?.writeln(
				"\x1b[48;2;59;130;246m\x1b[38;2;255;255;255m PRIMARY \x1b[0m Primary brand color"
			);
			terminal?.writeln(
				"\x1b[48;2;16;185;129m\x1b[38;2;255;255;255m SUCCESS \x1b[0m Success state"
			);
			terminal?.writeln("\x1b[48;2;245;158;11m\x1b[38;2;0;0;0m WARNING \x1b[0m Warning state");
			terminal?.writeln("\x1b[48;2;239;68;68m\x1b[38;2;255;255;255m DANGER \x1b[0m Danger state");
			break;

		case "custom-styling-brands":
			terminal?.writeln("🌐 \x1b[44m\x1b[37m API \x1b[0m Request processed");
			terminal?.writeln("💾 \x1b[42m\x1b[30m DB \x1b[0m Query executed");
			terminal?.writeln("⚡ \x1b[43m\x1b[30m CACHE \x1b[0m Cache hit");
			terminal?.writeln("🔐 \x1b[45m\x1b[37m AUTH \x1b[0m User authenticated");
			terminal?.writeln("📨 \x1b[46m\x1b[30m QUEUE \x1b[0m Job enqueued");
			break;

		case "multiple-loggers":
			const time = new Date().toLocaleTimeString("en-US", {
				hour12: true,
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});
			terminal?.writeln(`${time} [API] \x1b[46m\x1b[30m REQUEST \x1b[0m GET /api/users`);
			terminal?.writeln(
				`${time} \x1b[32m✓\x1b[0m \x1b[42m\x1b[30m CONNECT    \x1b[0m Database connected`
			);
			terminal?.writeln(
				"[CACHE] \x1b[32m✓\x1b[0m \x1b[42m\x1b[30m HIT \x1b[0m Cache hit for key: user_123"
			);
			break;

		case "repl":
			terminal?.writeln("\x1b[46m\x1b[30m DEMO \x1b[0m Hello from Hagen!");
			break;

		default:
			terminal?.writeln("\x1b[2mOutput will appear here when code is executed\x1b[0m");
			terminal?.writeln("\x1b[2m(Simulation active - showing expected output)\x1b[0m");
	}
}

// Reset terminal
function resetTerminal() {
	terminal?.clear();
	// Auto-run after reset
	setTimeout(() => {
		runCode();
	}, 100);
}

// Lifecycle hooks
onMounted(async () => {
	await initTerminal();
	// Auto-run code after terminal is initialized
	setTimeout(() => {
		runCode();
	}, 100);
});

onBeforeUnmount(() => {
	terminal?.dispose();
});

// Watch for prop changes
watch(
	() => props.exampleId,
	() => {
		resetTerminal();
	}
);
</script>

<style scoped>
.terminal-container {
	margin: 1.5rem 0;
	border-radius: 8px;
	overflow: hidden;
	background: #1e1e2e;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	font-family: "Menlo", "Monaco", "Courier New", monospace;
}

.terminal-body {
	height: auto;
	min-height: 60px;
	padding: 16px;
	overflow: hidden;
}

/* Dark mode adjustments for VitePress */
.dark .terminal-container {
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}
</style>
