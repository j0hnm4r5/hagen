<template>
	<div class="global-terminal" :class="{ 'is-collapsed': isCollapsed, 'is-open': !isCollapsed }">
		<div class="terminal-header-wrapper">
			<div class="terminal-header" :class="{ 'has-shadow': isCollapsed }" @click="toggleCollapse">
				<div class="terminal-title">
					<span>Interactive Terminal</span>
				</div>
			</div>
		</div>
		<div class="terminal-content" v-show="!isCollapsed">
			<Terminal ref="terminalRef" :editable="true" title="Interactive Hagen REPL" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import Terminal from "./Terminal.vue";

const terminalRef = ref<InstanceType<typeof Terminal> | null>(null);
const isCollapsed = ref(false);

function toggleCollapse() {
	isCollapsed.value = !isCollapsed.value;
	// Save state to localStorage
	localStorage.setItem("hagen-terminal-collapsed", String(isCollapsed.value));
}

// Listen for run-terminal-command events
onMounted(() => {
	const handleRunCommand = (event: Event) => {
		const customEvent = event as CustomEvent;
		if (customEvent.detail?.command) {
			// Open terminal if collapsed
			if (isCollapsed.value) {
				isCollapsed.value = false;
			}
			// Run the command
			if (terminalRef.value) {
				terminalRef.value.runCommand(customEvent.detail.command);
			}
		}
	};
	document.addEventListener("run-terminal-command", handleRunCommand);

	// Restore collapsed state from localStorage
	const savedState = localStorage.getItem("hagen-terminal-collapsed");
	if (savedState !== null) {
		isCollapsed.value = savedState === "true";
	}

	onBeforeUnmount(() => {
		document.removeEventListener("run-terminal-command", handleRunCommand);
	});
});
</script>

<style scoped>
.global-terminal {
	position: fixed;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 80%;
	max-width: 1200px;
	z-index: 1000;
	transition: transform 0.3s ease;
	pointer-events: none;
}

.global-terminal.is-collapsed {
	transform: translateX(-50%) translateY(calc(100% - 48px));
}

.global-terminal.is-open {
	transform: translateX(-50%) translateY(0);
}

.terminal-header-wrapper {
	position: relative;
	height: 48px;
	pointer-events: none;
}

.terminal-header {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1.5rem 0.5rem 1rem;
	background: #1e1e2e;
	border-radius: 12px 12px 0 0;
	cursor: pointer;
	user-select: none;
	position: absolute;
	bottom: 0;
	min-width: 280px;
	pointer-events: auto;
	margin-left: 2rem;
}

.terminal-header.has-shadow {
	box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
}

.terminal-header::before {
	content: "";
	position: absolute;
	bottom: 0;
	left: -20px;
	width: 20px;
	height: 20px;
	background: radial-gradient(circle at 0 0, transparent 20px, #1e1e2e 20px);
}

.terminal-header::after {
	content: "";
	position: absolute;
	bottom: 0;
	right: -20px;
	width: 20px;
	height: 20px;
	background: radial-gradient(circle at 100% 0, transparent 20px, #1e1e2e 20px);
}

.terminal-header:hover {
	background: #242438;
}

.terminal-header:hover::before {
	background: radial-gradient(circle at 0 0, transparent 20px, #242438 20px);
}

.terminal-header:hover::after {
	background: radial-gradient(circle at 100% 0, transparent 20px, #242438 20px);
}

.terminal-title {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	color: #cdd6f4;
	font-weight: 600;
	font-size: 13px;
}

.terminal-icon {
	color: #89b4fa;
	font-size: 12px;
}

.collapse-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	border-radius: 4px;
	background: transparent;
	color: #a6adc8;
	font-size: 11px;
	transition: all 0.2s ease;
}

.collapse-btn:hover {
	background: #313244;
	color: #cdd6f4;
}

.terminal-content {
	max-height: 50vh;
	overflow: hidden;
	background: #1e1e2e;
	border-radius: 12px 12px 0 0;
	box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
	pointer-events: auto;
}

/* Override terminal height to fit within global terminal */
.terminal-content :deep(.terminal-body) {
	height: calc(50vh - 32px) !important;
	max-height: 400px !important;
}

/* Remove margins from nested terminal */
.terminal-content :deep(.terminal-container) {
	margin: 0;
	border-radius: 0;
	box-shadow: none;
}

/* Adjust for mobile */
@media (max-width: 768px) {
	.global-terminal {
		width: 95%;
	}

	.terminal-content {
		max-height: 60vh;
	}

	.terminal-header {
		min-width: 200px;
		font-size: 12px;
	}
}
</style>
