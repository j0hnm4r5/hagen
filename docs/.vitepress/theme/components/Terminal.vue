<template>
	<div class="terminal-container">
		<div class="terminal-header">
			<span class="terminal-title">Output</span>
		</div>
		<div ref="terminalRef" class="terminal-body"></div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { withBase } from "vitepress";

interface Props {
	src: string; // Path to .ansi file
}

const props = defineProps<Props>();
const terminalRef = ref<HTMLElement | null>(null);

let terminal: any = null;

async function initTerminal() {
	if (!terminalRef.value) return;

	// Dynamic import for browser-only code
	const { Terminal } = await import("xterm");
	await import("xterm/css/xterm.css");

	terminal = new Terminal({
		cursorBlink: false,
		cursorStyle: "bar", // Use bar style which is less visible
		cursorWidth: 1, // Minimum width (will be hidden via CSS)
		fontSize: 14,
		lineHeight: 1.2,
		fontFamily: 'Menlo, Monaco, "Courier New", monospace',
		theme: {
			// Catppuccin Mocha theme
			background: "#1e1e2e",
			foreground: "#cdd6f4",
			cursor: "transparent", // Make cursor transparent
			cursorAccent: "transparent",
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
		disableStdin: true,
		cols: 120, // Set reasonable default width
		rows: 1, // Start with 1 row, will auto-resize after content loads
		scrollback: 0, // No scrollback needed for static content
		convertEol: true, // Auto-convert newlines
	});

	terminal.open(terminalRef.value);

	// Load and display output (will auto-resize based on content)
	await loadOutput();
}

async function loadOutput() {
	try {
		// Use withBase to prepend the VitePress base URL
		const url = withBase(props.src);
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to load output: ${response.statusText}`);
		}
		let content = await response.text();

		// Remove trailing newline to prevent cursor from moving to next line
		content = content.replace(/\n$/, "");

		// Count lines before writing to set terminal size
		const lines = content.split("\n");
		const lineCount = lines.length;

		// Resize terminal to fit all lines
		if (terminal && lineCount > 0) {
			terminal.resize(terminal.cols, lineCount);
		}

		// Write all content at once - xterm will handle the newlines
		terminal?.write(content);
	} catch (error) {
		console.error("Error loading terminal output:", error);
		terminal?.write("\x1b[31mError: Could not load output file\x1b[0m");
	}
}

onMounted(async () => {
	await initTerminal();
});

onBeforeUnmount(() => {
	terminal?.dispose();
});
</script>

<style scoped>
.terminal-container {
	margin: 2rem 0;
	border-radius: 8px;
	overflow: hidden;
	background: #1e1e2e;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	font-family: "Menlo", "Monaco", "Courier New", monospace;
}

.terminal-header {
	padding: 8px 16px;
	background: #181825;
	border-bottom: 1px solid #313244;
}

.terminal-title {
	color: #a6adc8;
	font-size: 12px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.terminal-body {
	height: auto;
	padding: 16px;
	overflow: hidden;
}

.terminal-body :deep(.xterm) {
	padding: 0;
	line-height: 1.2;
}

.terminal-body :deep(.xterm-rows) {
	line-height: 1.2;
}

/* Add vertical spacing between lines */
.terminal-body :deep(.xterm-rows > div) {
	padding-bottom: 3px;
}

/* Hide cursor completely */
.terminal-body :deep(.xterm-cursor) {
	display: none !important;
}

.terminal-body :deep(.xterm-viewport) {
	overflow: hidden !important;
}

.terminal-body :deep(.xterm-screen) {
	overflow: hidden;
}

/* Dark mode adjustments for VitePress */
.dark .terminal-container {
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}
</style>
