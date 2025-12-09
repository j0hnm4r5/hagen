<template>
	<div class="terminal-container" :class="{ 'is-editable': props.editable }">
		<div ref="terminalRef" class="terminal-body" :class="{ editable: props.editable }"></div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import examples from "../../examples";
// Import hagen - using relative path to built dist
import hagenModule from "../../../../dist/index.js";
const hagen = hagenModule.default || hagenModule;

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

// Persistent REPL context to maintain state between commands
const replContext: Record<string, any> = {};

// Expose method to run commands from parent
const runCommand = (command: string) => {
	if (!terminal || !props.editable) return;

	// Normalize line endings
	const normalizedCommand = command.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

	// Set currentLine but don't display it character by character
	// Just add it to the command so it can be executed
	currentLine = normalizedCommand;

	// Trigger execution immediately
	setTimeout(() => {
		if (currentLine.trim()) {
			commandHistory.push(currentLine);
			historyIndex = commandHistory.length;

			// Check if it's a multi-line command
			const lines = currentLine.split(/\r?\n/).filter((line: string) => line.trim());

			if (lines.length > 1) {
				// Multi-line: execute each line with spacing
				terminal.write("\r\n");
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i];
					const isLastLine = i === lines.length - 1;
					executeREPLCommand(line.trim(), isLastLine);
				}
			} else if (lines.length === 1) {
				// Single line: execute normally
				executeREPLCommand(currentLine.trim());
			}
		}
		currentLine = "";
		writePrompt();
		resizeToContent();
	}, 10);
};

defineExpose({ runCommand });

// Initialize terminal with Catppuccin Mocha theme
async function initTerminal() {
	if (!terminalRef.value) return;

	// Dynamic import for browser-only code
	const { Terminal } = await import("xterm");
	const { FitAddon } = await import("xterm-addon-fit");
	await import("xterm/css/xterm.css");

	terminal = new Terminal({
		cursorBlink: true,
		cursorStyle: "block",
		fontSize: 14,
		lineHeight: 1.2, // Normal line height for character rendering
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
		// Set fixed height for REPL - rows will stay constant, scrollback handles overflow
		terminal.resize(terminal.cols, 18); // Fixed 18 rows to fit in 400px container
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

		// Normalize line endings and append to current line
		const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

		for (const char of normalizedText) {
			currentLine += char;
			if (char === "\n") {
				terminal.write("\r\n"); // Move to next line
			} else {
				terminal.write(char);
			}
		}

		resizeToContent();
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

				// Check if it's a multi-line command (contains newlines)
				const lines = currentLine.split(/\r?\n/).filter((line) => line.trim());

				if (lines.length > 1) {
					// Multi-line: execute each line with spacing
					terminal.write("\r\n");
					for (let i = 0; i < lines.length; i++) {
						const line = lines[i];
						const isLastLine = i === lines.length - 1;
						executeREPLCommand(line.trim(), isLastLine);
					}
				} else {
					// Single line: execute normally
					executeREPLCommand(currentLine);
				}
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
function executeREPLCommand(command: string, addBlankLine: boolean = true) {
	const trimmed = command.trim();

	// Clear command
	if (trimmed === "clear") {
		terminal?.clear();
		// Clear the REPL context
		Object.keys(replContext).forEach(key => delete replContext[key]);
		writePrompt();
		return;
	}

	// Help command
	if (trimmed === "help") {
		terminal?.writeln("\x1b[36mAvailable JavaScript REPL:\x1b[0m");
		terminal?.writeln("  Type any JavaScript code to execute");
		terminal?.writeln("  clear           - Clear the terminal");
		terminal?.writeln("  help            - Show this help message");
		terminal?.writeln("");
		terminal?.writeln("\x1b[36mHagen is available globally:\x1b[0m");
		terminal?.writeln("  hagen.log()     - Log with custom label");
		terminal?.writeln("  hagen.info()    - Info level message");
		terminal?.writeln("  hagen.success() - Success level message");
		terminal?.writeln("  hagen.warn()    - Warning level message");
		terminal?.writeln("  hagen.error()   - Error level message");
		terminal?.writeln("");
		terminal?.writeln("\x1b[2mExample: hagen.log('API', 'Request received')\x1b[0m");
		terminal?.writeln("\x1b[2mExample: const x = 5; hagen.log('VALUE', `x = ${x}`)\x1b[0m");
		if (addBlankLine) {
			terminal?.writeln(""); // Add blank line after help output
		}
		return;
	}

	// Execute as JavaScript code
	try {
		// Intercept console.log to capture output in terminal
		const originalConsoleLog = console.log;
		const originalConsoleInfo = console.info;
		const originalConsoleWarn = console.warn;
		const originalConsoleError = console.error;

		console.log = (...args: any[]) => {
			// Write directly to terminal
			const output = args
				.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
				.join(" ");
			terminal?.writeln(output);
		};
		console.info = console.log;
		console.warn = console.log;
		console.error = console.log;

		try {
			// Execute code in context with persistent variables
			// Build a function that has access to all previous variables
			const contextKeys = Object.keys(replContext);
			const contextValues = contextKeys.map(key => replContext[key]);

			// Create function with context variables as parameters
			const func = new Function('hagen', ...contextKeys, `
				"use strict";
				${trimmed}
			`);

			const result = func(window.hagen, ...contextValues);

			// Parse variable declarations and add to context
			// Match: const/let/var identifier = value
			const declMatch = trimmed.match(/^\s*(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/);
			if (declMatch) {
				const varName = declMatch[2];
				// Re-evaluate to get the value
				try {
					const evalFunc = new Function('hagen', ...contextKeys, `
						"use strict";
						${trimmed}
						return ${varName};
					`);
					replContext[varName] = evalFunc(window.hagen, ...contextValues);
				} catch (e) {
					// Variable might not be accessible, skip
				}
			}

			// Restore console methods
			console.log = originalConsoleLog;
			console.info = originalConsoleInfo;
			console.warn = originalConsoleWarn;
			console.error = originalConsoleError;

			// Show the return value if it's not undefined
			if (result !== undefined) {
				const resultStr =
					typeof result === "object" ? JSON.stringify(result, null, 2) : String(result);
				terminal?.writeln(`\x1b[90m${resultStr}\x1b[0m`);
			}

			if (addBlankLine) {
				terminal?.writeln(""); // Add blank line after output
			}
		} catch (execError) {
			// Restore console methods
			console.log = originalConsoleLog;
			console.info = originalConsoleInfo;
			console.warn = originalConsoleWarn;
			console.error = originalConsoleError;

			terminal?.writeln(
				`\x1b[31m✕ ${execError instanceof Error ? execError.message : "Execution error"}\x1b[0m`
			);
			if (addBlankLine) {
				terminal?.writeln("");
			}
		}
	} catch (err) {
		terminal?.writeln(
			`\x1b[31m✕ Error:\x1b[0m ${err instanceof Error ? err.message : "Unknown error"}`
		);
		if (addBlankLine) {
			terminal?.writeln(""); // Add blank line after error
		}
	}
				`
				);

				const declaredVars = func(window.hagen, ...contextValues);

				// Add declared variables to context
				Object.assign(replContext, declaredVars);

				result = undefined; // Declarations don't return values
			} else {
				// For expressions/statements, execute with access to context
				const func = new Function(
					"hagen",
					...contextKeys,
					`
					"use strict";
					return (${code});
				`
				);

				result = func(window.hagen, ...contextValues);
			}

			// Restore console methods
			console.log = originalConsoleLog;
			console.info = originalConsoleInfo;
			console.warn = originalConsoleWarn;
			console.error = originalConsoleError;

			// Show the return value if it's not undefined
			if (result !== undefined) {
				const resultStr =
					typeof result === "object" ? JSON.stringify(result, null, 2) : String(result);
				terminal?.writeln(`\x1b[90m${resultStr}\x1b[0m`);
			}

			if (addBlankLine) {
				terminal?.writeln(""); // Add blank line after output
			}
		} catch (execError) {
			// Restore console methods
			console.log = originalConsoleLog;
			console.info = originalConsoleInfo;
			console.warn = originalConsoleWarn;
			console.error = originalConsoleError;

			terminal?.writeln(
				`\x1b[31m✕ ${execError instanceof Error ? execError.message : "Execution error"}\x1b[0m`
			);
			if (addBlankLine) {
				terminal?.writeln("");
			}
		}
	} catch (err) {
		terminal?.writeln(
			`\x1b[31m✕ Error:\x1b[0m ${err instanceof Error ? err.message : "Unknown error"}`
		);
		if (addBlankLine) {
			terminal?.writeln(""); // Add blank line after error
		}
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

	// For editable terminals (REPL), don't resize rows - keep fixed size and scroll
	if (props.editable) {
		// Auto-scroll to bottom to show latest content
		setTimeout(() => {
			if (terminal) {
				terminal.scrollToBottom();
			}
		}, 0);
		return;
	}

	// For non-editable terminals, resize to fit content exactly
	const buffer = terminal.buffer.active;

	// Count lines with actual content (non-empty lines)
	let contentLines = 0;
	for (let i = 0; i < buffer.length; i++) {
		const line = buffer.getLine(i);
		if (line && line.translateToString(true).trim().length > 0) {
			contentLines++;
		}
	}

	// Add 1 for cursor line to ensure all content is visible
	const targetRows = Math.max(contentLines + 1, 1);
	terminal.resize(terminal.cols, targetRows);

	// Auto-scroll to bottom after resize
	setTimeout(() => {
		if (terminal) {
			terminal.scrollToBottom();
		}
	}, 0);
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
	// Make hagen available globally for REPL
	if (typeof window !== "undefined") {
		(window as any).hagen = hagen;
	}

	await initTerminal();
	// Auto-run code after terminal is initialized (only for non-editable terminals)
	if (!props.editable) {
		setTimeout(() => {
			runCode();
		}, 100);
	}

	// Listen for custom events from TryItOut buttons
	if (props.editable) {
		const handleRunCommand = (event: Event) => {
			const customEvent = event as CustomEvent;
			if (customEvent.detail?.command) {
				runCommand(customEvent.detail.command);
			}
		};
		document.addEventListener("run-terminal-command", handleRunCommand);

		// Cleanup
		onBeforeUnmount(() => {
			document.removeEventListener("run-terminal-command", handleRunCommand);
		});
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

/* Extra vertical margin for non-editable terminals */
.terminal-container:not(.is-editable) {
	margin: 2rem 0;
}

.terminal-body {
	height: auto;
	padding: 16px;
	overflow: hidden;
}

/* Fixed height only for editable/REPL terminals */
.terminal-body.editable {
	height: 400px;
}

.terminal-body :deep(.xterm) {
	padding: 0;
	line-height: 1.2;
}

.terminal-body :deep(.xterm-rows) {
	line-height: 1.2;
}

/* Add vertical spacing between lines (leading) */
.terminal-body :deep(.xterm-rows > div) {
	padding-bottom: 3px;
}

/* Scrolling only for editable terminals */
.terminal-body.editable :deep(.xterm-viewport) {
	overflow-y: auto !important;
	overflow-x: hidden !important;
}

/* Non-editable terminals should not scroll */
.terminal-body:not(.editable) :deep(.xterm-viewport) {
	overflow-y: hidden !important;
	overflow-x: hidden !important;
}

.terminal-body :deep(.xterm-screen) {
	overflow: hidden;
}

/* Dark mode adjustments for VitePress */
.dark .terminal-container {
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}
</style>
