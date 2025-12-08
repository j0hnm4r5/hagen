// @ts-nocheck
import DefaultTheme from "vitepress/theme";
import Terminal from "./components/Terminal.vue";
import TryItOut from "./components/TryItOut.vue";
import GlobalTerminal from "./components/GlobalTerminal.vue";
import type { Theme } from "vitepress";
import { h, nextTick } from "vue";
import "./custom.css";

export default {
	extends: DefaultTheme,
	Layout() {
		return h(DefaultTheme.Layout, null, {
			"layout-bottom": () => h(GlobalTerminal),
		});
	},
	enhanceApp({ app, router }) {
		// Register Terminal component globally
		app.component("Terminal", Terminal);
		app.component("TryItOut", TryItOut);

		// Add run buttons after navigation
		if (typeof window !== "undefined") {
			// After each route change
			router.onAfterRouteChanged = () => {
				nextTick(() => {
					setTimeout(addRunButtons, 100);
				});
			};
		}
	},
} satisfies Theme;

function addRunButtons() {
	// Find all TypeScript code blocks that contain hagen commands
	const codeBlocks = document.querySelectorAll('div[class*="language-typescript"]');

	codeBlocks.forEach((block) => {
		// Check if already has a button
		if (block.querySelector(".code-run-button")) return;

		const code = block.querySelector("code");
		if (!code) return;

		const codeText = code.textContent || "";

		// Only add button if code contains hagen method calls
		if (
			codeText.includes("hagen.log(") ||
			codeText.includes("hagen.info(") ||
			codeText.includes("hagen.success(") ||
			codeText.includes("hagen.warn(") ||
			codeText.includes("hagen.error(")
		) {
			const button = document.createElement("button");
			button.className = "code-run-button";
			button.textContent = "Run";
			button.addEventListener("click", () => {
				// Extract just the hagen commands
				const lines = codeText.split("\n");
				const hagenCommands = lines
					.filter(
						(line) =>
							line.trim().startsWith("hagen.log(") ||
							line.trim().startsWith("hagen.info(") ||
							line.trim().startsWith("hagen.success(") ||
							line.trim().startsWith("hagen.warn(") ||
							line.trim().startsWith("hagen.error(")
					)
					.join("\n");

				if (hagenCommands) {
					const event = new CustomEvent("run-terminal-command", {
						detail: { command: hagenCommands },
						bubbles: true,
					});
					document.dispatchEvent(event);
				}
			});

			block.appendChild(button);
		}
	});
}

// Browser-only setup
if (typeof window !== "undefined") {
	// Run after page load
	window.addEventListener("load", () => {
		setTimeout(addRunButtons, 200);
	});

	// Also run after DOM changes (for SPA navigation)
	const observer = new MutationObserver(() => {
		addRunButtons();
	});

	// Start observing once DOM is ready
	if (document.body) {
		observer.observe(document.body, { childList: true, subtree: true });
	} else {
		document.addEventListener("DOMContentLoaded", () => {
			observer.observe(document.body, { childList: true, subtree: true });
		});
	}
}
