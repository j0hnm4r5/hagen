<template>
	<div class="terminal-container">
		<div ref="terminalRef" class="terminal-body"></div>
		<div class="terminal-hint" v-if="props.editable">
			💡 Interactive REPL: Type commands and press Enter to execute
		</div>
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
	editable: false,
});

const terminalRef = ref<HTMLElement | null>(null);

let terminal: any = null;
let fitAddon: any = null;
let currentCode = "";
let currentLine = "";
let commandHistory: string[] = [];
let historyIndex = -1;

// Initialize terminal with Catppuccin Mocha theme
async function initTerminal() {
	if (!terminalRef.value) return;

	// Dynamic import for browser-only code
	const { Terminal } = await import("xterm");
	const { FitAddon } = await import("xterm-addon-fit");
	await import("xterm/css/xterm.css");

	terminal = new Terminal({
		cursorBlink: !props.editable,
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
		disableStdin: !props.editable,
		rows: 1, // Start with 1 row, will auto-resize
		rightClickSelectsWord: props.editable,
	});

	fitAddon = new FitAddon();
	terminal.loadAddon(fitAddon);
	terminal.open(terminalRef.value);

	// Setup REPL input handling if editable
	if (props.editable) {
		// Set initial height for REPL
		terminal.resize(terminal.cols, 10); // Start with 10 rows for REPL
		if (terminalRef.value) {
			const height = 10 * 17 + 32; // 10 rows
			terminalRef.value.style.height = `${height}px`;
			terminalRef.value.style.minHeight = `${height}px`;
			terminalRef.value.style.maxHeight = `${height}px`;
		}
		setupREPL();

		// Enable paste by attaching to textarea element xterm creates
		setTimeout(() => {
			const textarea = terminalRef.value?.querySelector("textarea");
			if (textarea) {
				// Handle keydown to intercept Ctrl+V before xterm does
				textarea.addEventListener("keydown", (e: KeyboardEvent) => {
					// Check for Ctrl+V or Cmd+V (but not Ctrl+Shift+V)
					if ((e.ctrlKey || e.metaKey) && e.key === "v" && !e.shiftKey) {
						e.preventDefault();
						e.stopPropagation();
						// Trigger paste manually
						navigator.clipboard.readText().then((text) => {
							handlePaste(text);
						});
					}
				});

				// Handle paste event (for Ctrl+Shift+V and right-click paste)
				textarea.addEventListener("paste", (e: ClipboardEvent) => {
					e.preventDefault();
					e.stopPropagation();
					const text = e.clipboardData?.getData("text");
					if (text) {
						handlePaste(text);
					}
				});
			}
		}, 100);
	}

	// Handle pasted text
	function handlePaste(text: string) {
		if (!text) return;

		// Split into lines
		const lines = text.split(/\r?\n/).filter((line) => line.trim());

		if (lines.length === 0) return;

		// If single line, just add to current line
		if (lines.length === 1) {
			for (const char of lines[0]) {
				currentLine += char;
				terminal.write(char);
			}
		} else {
			// Multi-line: display all lines at once, then execute all at once
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];

				// Write the line to terminal
				terminal.write(line);

				// Add newline after each line
				terminal.write("\r\n");
			}

			// Now execute all lines together
			terminal.write("\r\n");
			for (const line of lines) {
				if (line.trim()) {
					executeREPLCommand(line.trim());
				}
			}

			// Add to history as a block
			commandHistory.push(lines.join("\n"));
			historyIndex = commandHistory.length;

			// Write final prompt after all lines executed
			writePrompt();
			resizeToContent();
		}
	}
}

// Setup REPL functionality
function setupREPL() {
	if (!terminal) return;

	// Write welcome prompt
	writePrompt();

	// Handle keyboard input
	terminal.onKey(({ key, domEvent }: any) => {
		const char = key;
		const ev = domEvent;
		const code = ev.keyCode;

		// Enter key - execute command
		if (code === 13) {
			terminal.write("\r\n");
			if (currentLine.trim()) {
				commandHistory.push(currentLine);
				historyIndex = commandHistory.length;
				executeREPLCommand(currentLine);
			}
			currentLine = "";
			writePrompt();
			resizeToContent();
		}
		// Backspace
		else if (code === 8) {
			if (currentLine.length > 0) {
				currentLine = currentLine.slice(0, -1);
				terminal.write("\b \b");
			}
		}
		// Up arrow - history
		else if (code === 38) {
			if (historyIndex > 0) {
				// Clear current line
				terminal.write("\r\x1b[K");
				writePrompt();
				historyIndex--;
				currentLine = commandHistory[historyIndex] || "";
				terminal.write(currentLine);
			}
		}
		// Down arrow - history
		else if (code === 40) {
			if (historyIndex < commandHistory.length) {
				// Clear current line
				terminal.write("\r\x1b[K");
				writePrompt();
				historyIndex++;
				currentLine = commandHistory[historyIndex] || "";
				terminal.write(currentLine);
			}
		}
		// Regular characters
		else if (!ev.ctrlKey && !ev.altKey && !ev.metaKey) {
			currentLine += char;
			terminal.write(char);
		}
	});
}

// Write the REPL prompt
function writePrompt() {
	terminal?.write("\r\x1b[36m>\x1b[0m ");
}

// Execute a REPL command
function executeREPLCommand(command: string) {
	const trimmed = command.trim();

	// Clear command
	if (trimmed === "clear") {
		terminal?.clear();
		writePrompt();
		return;
	}

	// Help command
	if (trimmed === "help") {
		terminal?.writeln("\x1b[36mAvailable commands:\x1b[0m");
		terminal?.writeln("  clear           - Clear the terminal");
		terminal?.writeln("  help            - Show this help message");
		terminal?.writeln("  hagen.log()     - Log with custom label");
		terminal?.writeln("  hagen.info()    - Info level message");
		terminal?.writeln("  hagen.success() - Success level message");
		terminal?.writeln("  hagen.warn()    - Warning level message");
		terminal?.writeln("  hagen.error()   - Error level message");
		terminal?.writeln("");
		terminal?.writeln("\x1b[2mExample: hagen.log('API', 'Request received')\x1b[0m");
		return;
	}

	// Try to execute as Hagen command
	try {
		// Parse the command to extract method and arguments
		const hagenMatch = trimmed.match(/hagen\.(log|info|success|warn|error)\s*\((.*)\)/);

		if (hagenMatch) {
			const method = hagenMatch[1];
			const argsStr = hagenMatch[2];

			// Simple argument parsing (handles strings in quotes)
			const args = argsStr
				.split(/,(?=(?:[^"']*["'][^"']*["'])*[^"']*$)/)
				.map((arg) => arg.trim().replace(/^["']|["']$/g, ""));

			// Simulate the output based on method
			simulateHagenOutput(method, args);
		} else {
			terminal?.writeln(`\x1b[31m✕ Invalid command\x1b[0m Type 'help' for available commands`);
		}
	} catch (err) {
		terminal?.writeln(
			`\x1b[31m✕ Error:\x1b[0m ${err instanceof Error ? err.message : "Unknown error"}`
		);
	}
}

// Simulate Hagen output for REPL commands
function simulateHagenOutput(method: string, args: string[]) {
	const label = args[0] || "LABEL";
	const message = args.slice(1).join(" ") || "Message";

	switch (method) {
		case "log":
			terminal?.writeln(`\x1b[46m\x1b[30m ${label} \x1b[0m ${message}`);
			break;
		case "info":
			terminal?.writeln(`\x1b[34mi\x1b[0m \x1b[44m\x1b[37m ${label} \x1b[0m ${message}`);
			break;
		case "success":
			terminal?.writeln(`\x1b[32m✓\x1b[0m \x1b[42m\x1b[37m ${label} \x1b[0m ${message}`);
			break;
		case "warn":
			terminal?.writeln(`\x1b[33m!\x1b[0m \x1b[43m\x1b[30m ${label} \x1b[0m ${message}`);
			break;
		case "error":
			terminal?.writeln(`\x1b[31m✕\x1b[0m \x1b[41m\x1b[37m ${label} \x1b[0m ${message}`);
			break;
	}
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

	// Count lines with actual content (non-empty lines)
	let contentLines = 0;
	for (let i = 0; i < buffer.length; i++) {
		const line = buffer.getLine(i);
		if (line && line.translateToString(true).trim().length > 0) {
			contentLines++;
		}
	}

	// For editable terminals, ensure minimum height and allow growth
	const targetRows = props.editable
		? Math.max(contentLines + 1, 10) // Min 10 rows for REPL, +1 for current input line
		: Math.max(contentLines, 1); // Non-editable: exact fit

	terminal.resize(terminal.cols, targetRows);

	// Update container height - exact calculation to prevent scrollbars
	const lineHeight = 17; // xterm.js default line height
	const padding = 32; // 16px top + 16px bottom
	const height = targetRows * lineHeight + padding;
	terminalRef.value.style.height = `${height}px`;
	terminalRef.value.style.minHeight = `${height}px`;
	terminalRef.value.style.maxHeight = `${height}px`;
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
	// Auto-run code after terminal is initialized (only for non-editable terminals)
	if (!props.editable) {
		setTimeout(() => {
			runCode();
		}, 100);
	}
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

.terminal-body :deep(.xterm) {
	padding: 0;
}

.terminal-body :deep(.xterm-viewport) {
	overflow-y: hidden !important;
	overflow-x: hidden !important;
}

.terminal-body :deep(.xterm-screen) {
	overflow: hidden;
}

.terminal-hint {
	padding: 8px 16px;
	background: #181825;
	border-top: 1px solid #313244;
	color: #a6adc8;
	font-size: 12px;
	text-align: center;
}

/* Dark mode adjustments for VitePress */
.dark .terminal-container {
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}
</style>
