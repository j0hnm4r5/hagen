import DefaultTheme from "vitepress/theme";
import Terminal from "./components/Terminal.vue";
import type { Theme } from "vitepress";

export default {
	extends: DefaultTheme,
	enhanceApp({ app }) {
		app.component("Terminal", Terminal);

		// One-time cleanup: Unregister old COI service worker
		if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
			navigator.serviceWorker.getRegistrations().then((registrations) => {
				for (const registration of registrations) {
					if (registration.active?.scriptURL.includes("coi-serviceworker")) {
						registration.unregister();
					}
				}
			});
		}
	},
} satisfies Theme;
