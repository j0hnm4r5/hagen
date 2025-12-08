// @ts-nocheck
import DefaultTheme from "vitepress/theme";
import Terminal from "./components/Terminal.vue";
import type { Theme } from "vitepress";

export default {
	extends: DefaultTheme,
	enhanceApp({ app }) {
		// Register Terminal component globally
		app.component("Terminal", Terminal);
	},
} satisfies Theme;
