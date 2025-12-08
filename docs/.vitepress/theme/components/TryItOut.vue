<template>
	<button @click="runExample" class="try-button">
		<span class="text">Run this example</span>
	</button>
</template>

<script setup lang="ts">
import { inject } from "vue";

interface Props {
	example: string;
}

const props = defineProps<Props>();

const examples: Record<string, string> = {
	basic: `hagen.log('API', 'Request received')
hagen.log('DATABASE', 'Query executed')
hagen.log('WORKER', 'Job processed')`,

	levels: `hagen.info('CONFIG', 'Configuration loaded')
hagen.success('DB', 'Connection established')
hagen.warn('CACHE', 'Cache size exceeding limit')
hagen.error('API', 'Request timeout')`,

	"quick-start": `hagen.log('APP', 'Application starting...')
hagen.info('CONFIG', 'Loaded configuration from env')
hagen.success('DB', 'Database connection established')
hagen.warn('CACHE', 'Cache size exceeding threshold')
hagen.error('API', 'Request failed', 'Error: Timeout')`,

	multiple: `hagen.log('USER', 'User logged in', 'ID: 123')
hagen.success('API', 'Response time:', '45ms')`,

	server: `hagen.info('SERVER', 'Starting up...')
hagen.success('SERVER', 'Listening on port 3000')
hagen.log('HTTP', 'GET /api/users')
hagen.success('HTTP', '200 OK')`,

	database: `hagen.log('DB', 'Connecting to database')
hagen.success('DB', 'Connection established')
hagen.log('DB', 'Running migrations')
hagen.success('DB', 'All migrations complete')`,

	errors: `hagen.warn('AUTH', 'Rate limit approaching')
hagen.error('AUTH', 'Authentication failed')
hagen.error('DB', 'Connection lost')`,

	startup: `hagen.info('APP', 'Starting application')
hagen.log('CONFIG', 'Loading configuration')
hagen.success('CONFIG', 'Configuration loaded')
hagen.log('DB', 'Connecting to database')
hagen.success('DB', 'Connected to database')
hagen.log('SERVER', 'Starting HTTP server')
hagen.success('SERVER', 'Server listening on port 3000')
hagen.success('APP', 'Application started successfully')`,

	request: `hagen.log('API', 'GET /api/users/123')
hagen.success('API', 'User 123 retrieved')`,
};

function runExample() {
	const command = examples[props.example];
	if (!command) return;

	// Find the terminal component on the page
	// We'll use a custom event to communicate with the terminal
	const event = new CustomEvent("run-terminal-command", {
		detail: { command },
		bubbles: true,
	});
	document.dispatchEvent(event);
}
</script>

<style scoped>
.try-button {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.625rem 1.25rem;
	margin-top: 0.75rem;
	margin-bottom: 1.5rem;
	background: #89b4fa;
	color: #1e1e2e;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-family: inherit;
	font-size: 14px;
	font-weight: 600;
	transition: all 0.2s ease;
}

.try-button:hover {
	background: #a6c8ff;
	transform: translateY(-1px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.try-button:active {
	transform: translateY(0);
}

.text {
	line-height: 1;
}
</style>
